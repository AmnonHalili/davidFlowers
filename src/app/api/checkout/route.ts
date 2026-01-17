import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth } from '@clerk/nextjs/server'; // Updated import for newer Clerk versions
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to get absolute URL
const getUrl = (path: string) => {
    return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${path}`;
};

export async function POST(req: Request) {
    try {
        const { userId } = auth();
        const user = await auth().currentUser(); // Get user details for email

        // Ensure user is logged in
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { items } = body;

        if (!items || items.length === 0) {
            return new NextResponse("No items in checkout", { status: 400 });
        }

        // 1. Create Order in Database (PENDING)
        // We do this BEFORE Stripe so we have an Order ID to pass to metadata
        /* 
           NOTE: In a real production flow with high volume, you might want to create the order 
           AFTER the webhook confirms payment to avoid "ghost" orders. 
           However, creating it here allows us to recover "Abandoned Carts" easily.
           For this MVP, we'll create it here as PENDING.
        */

        // Calculate total for DB record
        const totalAmount = items.reduce((acc: number, item: any) => {
            return acc + (item.price * item.quantity);
        }, 0);

        const order = await prisma.order.create({
            data: {
                userId: userId, // Assuming all users are synced to DB. If not, might need a check.
                totalAmount: totalAmount,
                status: 'PENDING',
                items: {
                    create: items.map((item: any) => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.price // Snapshot price at time of order
                    }))
                }
            }
        });

        // 2. Format Line Items for Stripe
        const line_items = items.map((item: any) => ({
            quantity: item.quantity,
            price_data: {
                currency: 'ils',
                product_data: {
                    name: item.name,
                    images: item.image ? [item.image] : [],
                },
                unit_amount: Math.round(item.price * 100), // Stripe expects Agorot (cents)
            }
        }));

        // 3. Create Stripe Session
        const session = await stripe.checkout.sessions.create({
            line_items,
            mode: 'payment',
            billing_address_collection: 'required',
            phone_number_collection: {
                enabled: true
            },
            success_url: getUrl(`/success?orderId=${order.id}`), // Pass Order ID to success page
            cancel_url: getUrl(`/cancel?orderId=${order.id}`),
            metadata: {
                orderId: order.id, // CRITICAL: This connects Stripe back to our DB in the Webhook
                userId: userId
            }
        });

        return NextResponse.json({ url: session.url });

    } catch (error) {
        console.error('[CHECKOUT_ERROR]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

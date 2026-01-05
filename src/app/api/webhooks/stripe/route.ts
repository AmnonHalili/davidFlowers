import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get('Stripe-Signature') as string;

    let event;

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            // If secret is missing, we can't verify, but for dev we might want to log it
            console.error('Missing STRIPE_WEBHOOK_SECRET');
            return new NextResponse('Webhook Secret Missing', { status: 500 });
        }

        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object as any;

            // Retrieve the order ID from metadata
            const orderId = session?.metadata?.orderId;
            const userEmail = session?.customer_details?.email;

            if (orderId) {
                // Update Order Status to PAID and save shipping info if needed
                await prisma.order.update({
                    where: { id: orderId },
                    data: {
                        status: 'PAID', // Ensure this status exists in your Prisma Schema Enum
                        // You could also save the Stripe Payment ID here if you added a field for it
                    }
                });

                console.log(`Order ${orderId} marked as PAID`);
            }
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}

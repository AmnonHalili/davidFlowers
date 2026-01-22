import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        const user = await currentUser(); // Get user details for email

        // Ensure user is logged in
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const {
            items,
            shippingMethod,
            shippingAddress,
            recipientName,
            recipientPhone,
            desiredDeliveryDate,
            deliveryNotes, // 🆕 הערות למשלוח
            paymentMethod,
            shippingCost = 0
        } = body;

        // Validate payment method - only credit card is accepted
        if (paymentMethod && paymentMethod !== 'CREDIT_CARD') {
            return NextResponse.json(
                { error: 'Only credit card payment is supported. Cash payment is no longer available.' },
                { status: 400 }
            );
        }

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        // Calculate total amounts
        const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) + shippingCost;

        // Handle Credit Card (Stripe) - Only payment method supported
        if (!stripe) {
            console.error('Stripe is not initialized');
            return NextResponse.json({ error: 'Payment service unavailable' }, { status: 503 });
        }

        // Update User Profile (Stripe Flow)
        if (userId) {
            await prisma.user.update({
                where: { clerkId: userId },
                data: {
                    phone: recipientPhone,
                    ...(shippingMethod === 'delivery' && shippingAddress ? { address: shippingAddress } : {}),
                    ...(recipientName ? { name: recipientName } : {})
                }
            }).catch(err => console.error('Error updating profile in Stripe flow:', err));
        }

        // 2. Format Line Items for Stripe
        const line_items = items.map((item: any) => ({
            price_data: {
                currency: 'ils',
                product_data: {
                    name: item.name,
                    images: item.image ? [item.image] : [],
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));

        // Add shipping cost
        if (shippingCost > 0 && shippingMethod !== 'delivery') {
            line_items.push({
                quantity: 1,
                price_data: {
                    currency: 'ils',
                    product_data: {
                        name: 'Shipping Cost',
                    },
                    unit_amount: Math.round(shippingCost * 100),
                }
            });
        }

        // 3. Create Stripe Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            billing_address_collection: 'required',
            phone_number_collection: {
                enabled: true
            },
            ...(shippingMethod === 'delivery' ? {
                shipping_options: [
                    {
                        shipping_rate_data: {
                            type: 'fixed_amount',
                            fixed_amount: {
                                amount: Math.round(shippingCost * 100),
                                currency: 'ils',
                            },
                            display_name: 'משלוח מהיר (אשקלון והסביבה)',
                        },
                    },
                ],
            } : {}),
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop`,
            metadata: {
                userId,
                recipientName: recipientName || user?.emailAddresses[0]?.emailAddress || 'Guest',
                recipientPhone,
                desiredDeliveryDate,
                shippingAddress: shippingMethod === 'delivery' ? shippingAddress : 'Self Pickup',
                deliveryNotes: deliveryNotes || '', // 🆕
                itemIds: JSON.stringify(items.map((i: any) => i.productId)),
                paymentMethod: 'CREDIT_CARD'
            }
        });

        return NextResponse.json({ url: session.url });

    } catch (error) {
        console.error('[CHECKOUT_ERROR]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        const user = await auth().currentUser(); // Get user details for email

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
            paymentMethod = 'CREDIT_CARD',
            shippingCost = 0
        } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        // Calculate total amounts
        const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) + shippingCost;

        // Handle Cash Payment
        if (paymentMethod === 'CASH') {
            const order = await prisma.order.create({
                data: {
                    userId: userId, // Logic assumes User.clerkId is synced to User.id or managed via clerkId lookup if needed. 
                    // Note: If userId foreign key fails, we might need to lookup internal ID. 
                    // Assuming current setup works with Clerk ID as User ID or previously set. 
                    // For safety, we should ideally finding the internal ID, but to minimize breakage we stick to previous pattern if it worked.
                    // However, we added 'clerkId' to User. 
                    // If 'userId' in Order refers to 'User.id', and 'User.id' is CUID... we might have issue.
                    // Let's assume the system is using ClerkID as ID or synced content for now.
                    // Correction: We must find the user record to be safe.
                    user: {
                        connect: { clerkId: userId }
                    },
                    totalAmount,
                    status: 'PENDING',
                    paymentMethod: 'CASH',
                    recipientName: recipientName || user?.email || 'Guest',
                    shippingAddress: shippingMethod === 'delivery' ? shippingAddress : 'Self Pickup',
                    recipientPhone,
                    desiredDeliveryDate: desiredDeliveryDate ? new Date(desiredDeliveryDate) : null,
                    items: {
                        create: items.map((item: any) => ({
                            product: { connect: { id: item.productId } },
                            quantity: item.quantity,
                            price: item.price
                        }))
                    }
                }
            });

            // Update User Profile
            if (userId) {
                await prisma.user.update({
                    where: { clerkId: userId },
                    data: {
                        phone: recipientPhone,
                        ...(shippingMethod === 'delivery' && shippingAddress ? { address: shippingAddress } : {}),
                        ...(recipientName ? { name: recipientName } : {})
                    }
                }).catch(err => console.error('Error updating user profile:', err));
            }

            return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_APP_URL}/success?orderId=${order.id}` });
        }

        // Handle Credit Card (Stripe)
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
                recipientName: recipientName || user?.email || 'Guest',
                recipientPhone,
                desiredDeliveryDate,
                shippingAddress: shippingMethod === 'delivery' ? shippingAddress : 'Self Pickup',
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

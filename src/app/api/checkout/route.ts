import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

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
            deliveryNotes,
            couponId,
            shippingCost = 0
        } = body;

        // Validation
        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        if (!recipientName || !recipientPhone) {
            return NextResponse.json({ error: 'Recipient details required' }, { status: 400 });
        }

        if (shippingMethod === 'delivery' && !shippingAddress) {
            return NextResponse.json({ error: 'Delivery address required' }, { status: 400 });
        }

        // Calculate total
        const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        const finalShippingCost = shippingMethod === 'delivery' ? shippingCost : 0;
        const totalAmount = subtotal + finalShippingCost;

        // 1. CREATE ORDER IN DATABASE (PENDING STATUS)
        const order = await prisma.order.create({
            data: {
                user: { connect: { clerkId: userId } },
                totalAmount,
                status: 'PENDING',
                paymentMethod: 'CREDIT_CARD',
                recipientName,
                shippingAddress: shippingMethod === 'delivery' ? shippingAddress : 'Self Pickup',
                recipientPhone,
                desiredDeliveryDate: desiredDeliveryDate ? new Date(desiredDeliveryDate) : null,
                deliveryNotes: shippingMethod === 'delivery' ? deliveryNotes : null,
                ...(couponId && { coupon: { connect: { id: couponId } } }),
                items: {
                    create: items.map((item: any) => ({
                        product: { connect: { id: item.productId } },
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            }
        });

        console.log(`✅ Order created: ${order.id}`);

        // 2. UPDATE USER PROFILE
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

        // 3. CREATE PAY PLUS PAYMENT
        const paymentUrl = await createPayPlusPayment({
            orderId: order.id,
            amount: Number(totalAmount),
            customerName: recipientName,
            customerPhone: recipientPhone,
            customerEmail: user?.emailAddresses[0]?.emailAddress
        });

        return NextResponse.json({
            url: paymentUrl,
            orderId: order.id
        });

    } catch (error) {
        console.error('[CHECKOUT_ERROR]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// Pay Plus Integration with Mock Fallback
async function createPayPlusPayment(data: {
    orderId: string;
    amount: number;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
}): Promise<string> {
    const { orderId, amount, customerName, customerPhone, customerEmail } = data;

    // Check if Pay Plus is configured
    const payPlusApiKey = process.env.PAYPLUS_API_KEY;
    const payPlusSecretKey = process.env.PAYPLUS_SECRET_KEY;
    const payPlusTerminalId = process.env.PAYPLUS_TERMINAL_ID;

    // MOCK MODE - Development without API keys
    if (!payPlusApiKey || !payPlusSecretKey || !payPlusTerminalId) {
        console.warn('⚠️  Pay Plus not configured - using MOCK mode');
        return `${process.env.NEXT_PUBLIC_APP_URL}/success?orderId=${orderId}&mock=true`;
    }

    // REAL PAY PLUS MODE
    try {
        const response = await fetch('https://restapi.payplus.co.il/api/v1/payment-pages/create', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${payPlusSecretKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                terminal_uid: payPlusTerminalId,
                amount: amount,
                currency_code: 'ILS',
                customer: {
                    customer_name: customerName,
                    phone: customerPhone,
                    ...(customerEmail && { email: customerEmail })
                },
                more_info: orderId, // Store orderId for webhook
                success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?orderId=${orderId}`,
                failure_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel?orderId=${orderId}`,
                sendEmailApproval: false, // Don't send Pay Plus emails
                sendEmailFailure: false
            })
        });

        if (!response.ok) {
            throw new Error(`Pay Plus API error: ${response.status}`);
        }

        const result = await response.json();

        if (!result.data?.payment_page_link) {
            throw new Error('No payment link returned from Pay Plus');
        }

        console.log(`✅ Pay Plus payment page created for order ${orderId}`);
        return result.data.payment_page_link;

    } catch (error) {
        console.error('[PAY_PLUS_ERROR]', error);
        // Fallback to mock on error
        console.warn('⚠️  Pay Plus error - falling back to MOCK mode');
        return `${process.env.NEXT_PUBLIC_APP_URL}/success?orderId=${orderId}&mock=true&error=payplus_failed`;
    }
}

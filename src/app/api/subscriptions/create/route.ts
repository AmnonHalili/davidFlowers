import { NextResponse } from 'next/server';
import { calculateNextDeliveryDate, DayOfWeek, Frequency, formatDate } from '@/lib/subscription-utils';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            productId,
            frequency,
            deliveryDay,
            recipientName,
            shippingAddress,
            cardMessage
        } = body;

        // Validation
        if (!productId || !frequency || !deliveryDay || !recipientName || !shippingAddress) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Logic to calculate the first delivery date
        const firstDeliveryDate = calculateNextDeliveryDate(
            deliveryDay as DayOfWeek,
            frequency as Frequency
        );

        // Mock response (In a real app, you'd create a PayPlus Checkout Session here 
        // and then save the Subscription to Prisma once the payment is confirmed)
        return NextResponse.json({
            success: true,
            message: 'Subscription order initialized',
            details: {
                productId,
                frequency,
                deliveryDay,
                firstDeliveryDate: firstDeliveryDate.toISOString(),
                readableFirstDelivery: formatDate(firstDeliveryDate),
                shipping: {
                    recipient: recipientName,
                    address: shippingAddress,
                    message: cardMessage || 'No gift note included.'
                },
                // Mocking PayPlus integration
                payplusRedirectUrl: 'https://payplus.co.il/mock-session'
            }
        });
    } catch (error) {
        console.error('SUBSCRIPTION_ERROR', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

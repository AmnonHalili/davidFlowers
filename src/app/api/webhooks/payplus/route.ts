import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        console.log('[PAYPLUS_WEBHOOK] Received:', JSON.stringify(body, null, 2));

        const { transaction_uid, more_info, status_code, amount } = body;

        if (!transaction_uid || !more_info) {
            console.error('[PAYPLUS_WEBHOOK] Missing required fields');
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const orderId = more_info; // orderId was stored in more_info

        // Verify transaction with Pay Plus API
        const isVerified = await verifyPayPlusTransaction(transaction_uid, orderId);

        if (!isVerified) {
            console.error(`[PAYPLUS_WEBHOOK] Transaction ${transaction_uid} verification failed`);
            return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
        }

        // Update order status to PAID and include related data for email
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'PAID',
                payplusTransactionId: transaction_uid
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                user: true
            }
        });

        console.log(`✅ Order ${orderId} marked as PAID (transaction: ${transaction_uid})`);

        // STOCK REDUCTION LOGIC
        try {
            console.log(`[STOCK_REDUCTION] Processing ${updatedOrder.items.length} items for order ${orderId}`);

            for (const item of updatedOrder.items) {
                const product = item.product;

                if (product.isVariablePrice && product.variations) {
                    // Handle Variable Product
                    const variations = product.variations as Record<string, any>;
                    let variantKeyToUpdate: string | null = null;

                    if (item.selectedSize) {
                        const normalizedSize = item.selectedSize.toLowerCase().trim();

                        for (const [key, details] of Object.entries(variations)) {
                            const detailLabel = ((details as any).label || '').toLowerCase().trim();
                            const detailKey = key.toLowerCase().trim();

                            if (
                                detailLabel === normalizedSize ||
                                detailKey === normalizedSize ||
                                normalizedSize.includes(detailKey) ||
                                detailKey.includes(normalizedSize)
                            ) {
                                variantKeyToUpdate = key;
                                break;
                            }
                        }
                    }

                    if (variantKeyToUpdate) {
                        const currentVariantStock = (variations[variantKeyToUpdate] as any).stock || 0;
                        const newVariantStock = Math.max(0, currentVariantStock - item.quantity);

                        // Update the specific variation's stock in the JSON object
                        variations[variantKeyToUpdate] = {
                            ...variations[variantKeyToUpdate],
                            stock: newVariantStock
                        };

                        await prisma.product.update({
                            where: { id: product.id },
                            data: {
                                variations: variations
                            }
                        });
                        console.log(`[STOCK_REDUCTION] Updated variation ${variantKeyToUpdate} for product ${product.name}. New stock: ${newVariantStock}`);

                    } else {
                        console.warn(`[STOCK_REDUCTION] Could not match variation for product ${product.name} with size "${item.selectedSize}"`);
                    }

                } else {
                    // Handle Simple Product
                    const newStock = Math.max(0, product.stock - item.quantity);
                    await prisma.product.update({
                        where: { id: product.id },
                        data: { stock: newStock }
                    });
                    console.log(`[STOCK_REDUCTION] Updated simple product ${product.name}. New stock: ${newStock}`);
                }
            }
        } catch (stockError) {
            console.error('[STOCK_REDUCTION_ERROR] Failed to reduce stock', stockError);
        }

        // Send email confirmation to customer
        const customerEmail = updatedOrder.user?.email || updatedOrder.ordererEmail;

        if (customerEmail) {
            // Import email service
            const { sendOrderConfirmation, sendAdminNotification } = await import('@/lib/email');

            try {
                // AWAIT email confirmation to ensure it finishes or logs properly
                await sendOrderConfirmation({
                    to: customerEmail,
                    orderNumber: updatedOrder.id,
                    customerName: updatedOrder.ordererName || updatedOrder.recipientName,
                    items: updatedOrder.items.map(item => ({
                        name: item.product.name,
                        quantity: item.quantity,
                        price: Number(item.price)
                    })),
                    totalAmount: Number(updatedOrder.totalAmount),
                    shippingAddress: updatedOrder.shippingAddress,
                    deliveryDate: updatedOrder.desiredDeliveryDate
                        ? new Date(updatedOrder.desiredDeliveryDate).toLocaleDateString('he-IL', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })
                        : undefined,
                    deliveryNotes: (updatedOrder as any).deliveryNotes || undefined
                });
                console.log(`📧 Confirmation email sent to ${customerEmail}`);

                // ALSO Send Admin Notification
                await sendAdminNotification({
                    orderNumber: updatedOrder.id,
                    customerName: updatedOrder.ordererName || updatedOrder.recipientName,
                    totalAmount: Number(updatedOrder.totalAmount),
                    items: updatedOrder.items.map(item => ({
                        name: item.product.name,
                        quantity: item.quantity
                    }))
                });
                console.log(`📧 Admin notification sent`);

            } catch (error) {
                console.error('[WEBHOOK_EMAIL_ERROR]', error);
            }
        } else {
            console.warn(`⚠️  No email found for order ${orderId}`);
        }

        return NextResponse.json({
            received: true,
            orderId: updatedOrder.id,
            emailSent: !!customerEmail
        });

    } catch (error: any) {
        console.error('[PAYPLUS_WEBHOOK_ERROR]', error);
        return NextResponse.json({
            error: 'Webhook processing failed',
            message: error.message
        }, { status: 500 });
    }
}

async function verifyPayPlusTransaction(transactionUid: string, expectedOrderId: string): Promise<boolean> {
    const payPlusApiKey = process.env.PAY_PLUS_API_KEY || process.env.PAYPLUS_API_KEY; // Support both naming styles
    const payPlusSecretKey = process.env.PAY_PLUS_SECRET_KEY || process.env.PAYPLUS_SECRET_KEY;

    if (!payPlusApiKey || !payPlusSecretKey) {
        console.warn('[PAYPLUS_WEBHOOK] Missing API keys - skipping verification in dev/mock mode');
        return true;
    }

    try {
        console.log(`[PAYPLUS_VERIFY] Verifying transaction ${transactionUid} for order ${expectedOrderId}`);

        // Use v1.0 and headers consistent with checkout/route.ts for reliability
        const response = await fetch(
            `https://restapi.payplus.co.il/api/v1.0/transactions/${transactionUid}`,
            {
                headers: {
                    'Authorization': JSON.stringify({
                        'api_key': payPlusApiKey,
                        'secret_key': payPlusSecretKey
                    }),
                    'api-key': payPlusApiKey,
                    'secret-key': payPlusSecretKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[PAYPLUS_VERIFY] API error: ${response.status} - ${errorText}`);
            return false;
        }

        const result = await response.json();

        if (result.status === 'error') {
            console.error(`[PAYPLUS_VERIFY] PayPlus returned error:`, result);
            return false;
        }

        const transaction = result.data;

        // Verify transaction details
        // status_code "000" means success
        if (transaction.status_code !== '000') {
            console.error(`[PAYPLUS_VERIFY] Transaction failed with status: ${transaction.status_code}`);
            return false;
        }

        if (transaction.more_info !== expectedOrderId) {
            console.error(`[PAYPLUS_VERIFY] Order ID mismatch: ${transaction.more_info} !== ${expectedOrderId}`);
            return false;
        }

        console.log(`✅ Transaction ${transactionUid} verified successfully`);
        return true;

    } catch (error) {
        console.error('[PAYPLUS_VERIFY_ERROR]', error);
        return false;
    }
}

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

                    // Try to find the matching variation key based on selectedSize
                    // selectedSize usually comes like "Small" or "Medium - Standard"
                    // The variation keys might be "small", "medium", etc.

                    if (item.selectedSize) {
                        // Strategy: Try to find a variation where the label matches the selectedSize
                        // or where the key matches a normalized version of selectedSize
                        const normalizedSize = item.selectedSize.toLowerCase();

                        for (const [key, details] of Object.entries(variations)) {
                            if (
                                (details as any).label === item.selectedSize ||
                                key.toLowerCase() === normalizedSize
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

                        // Also decrement main stock for aggregate tracking if needed, 
                        // but primarily we update the JSON. 
                        // Note: Some systems keep main stock as sum of variations. 
                        // adhering to "decrement main stock field" for simple, but for variable taking care of JSON.
                        // We will also decrement the main stock as a fallback/aggregate if logic dictates, 
                        // but usually variable products depend on the JSON. 
                        // Let's just update the JSON and the main stock count to keep them in sync if logical.
                        // checking schema: stock Int @default(0). 
                        // Let's update main stock as well to reflect total available? 
                        // Or is main stock irrelevant for variable?
                        // The prompt says "If a product is simple, decrement the main stock field."
                        // "If a product is variable, update the specific size stock within the variations JSON field."
                        // So I will STRICTLY follow that.

                        await prisma.product.update({
                            where: { id: product.id },
                            data: {
                                variations: variations
                            }
                        });
                        console.log(`[STOCK_REDUCTION] Updated variation ${variantKeyToUpdate} for product ${product.name}. New stock: ${newVariantStock}`);

                    } else {
                        console.warn(`[STOCK_REDUCTION] Could not match variation for product ${product.name} with size ${item.selectedSize}`);
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
            // We do NOT fail the webhook response because the payment was successful.
            // Admin should be notified if possible (logging is a good start)
        }

        // Send email confirmation to customer
        const customerEmail = updatedOrder.user?.email || updatedOrder.ordererEmail;

        if (customerEmail) {
            // Import email service
            const { sendOrderConfirmation } = await import('@/lib/email');

            // Send email (don't await - fire and forget)
            sendOrderConfirmation({
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
            }).catch(error => {
                // Log email errors but don't fail the webhook
                console.error('[EMAIL_SEND_FAILED]', error);
            });

            // ALSO Send Admin Notification
            const { sendAdminNotification } = await import('@/lib/email');
            sendAdminNotification({
                orderNumber: updatedOrder.id,
                customerName: updatedOrder.ordererName || updatedOrder.recipientName,
                totalAmount: Number(updatedOrder.totalAmount),
                items: updatedOrder.items.map(item => ({
                    name: item.product.name,
                    quantity: item.quantity
                }))
            }).catch(err => console.error('[ADMIN_NOTIF_FAILED]', err));

            console.log(`📧 Email queued for ${customerEmail} and Admin`);
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
    const payPlusSecretKey = process.env.PAYPLUS_SECRET_KEY;

    if (!payPlusSecretKey) {
        console.warn('[PAYPLUS_WEBHOOK] No API key - skipping verification (development mode)');
        return true; // In development without keys, trust the webhook
    }

    try {
        const response = await fetch(
            `https://restapi.payplus.co.il/api/v1/transactions/${transactionUid}`,
            {
                headers: {
                    'Authorization': `Bearer ${payPlusSecretKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            console.error(`[PAYPLUS_VERIFY] API error: ${response.status}`);
            return false;
        }

        const result = await response.json();
        const transaction = result.data;

        // Verify transaction details
        if (transaction.status_code !== '000') {
            console.error(`[PAYPLUS_VERIFY] Transaction failed: ${transaction.status_code}`);
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

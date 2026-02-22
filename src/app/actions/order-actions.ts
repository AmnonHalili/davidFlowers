'use server';

import prisma from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export type OrderStatusResult = {
    success: boolean;
    error?: string;
    order?: any; // We can type this properly with Prisma types later
};

export async function getOrderStatus(orderId: string, email: string): Promise<OrderStatusResult> {
    if (!orderId || !email) {
        return { success: false, error: 'נא להזין מספר הזמנה וכתובת אימייל.' };
    }

    try {
        // Find order matching ID and Email (either customer or orderer email)
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                OR: [
                    { user: { email: { equals: email, mode: 'insensitive' } } },
                    { ordererEmail: { equals: email, mode: 'insensitive' } }
                ]
            },
            include: {
                items: {
                    include: {
                        product: { include: { images: true } }
                    }
                }
            }
        });

        if (!order) {
            return { success: false, error: 'לא נמצאה הזמנה תואמת לפרטים שהוזנו.' };
        }

        return { success: true, order };
    } catch (error) {
        console.error('Error fetching order status:', error);
        return { success: false, error: 'אירעה שגיאה בבדיקת הסטטוס. אנא נסה שנית מאוחר יותר.' };
    }
}

export async function getOrders(status?: OrderStatus) {
    return await prisma.order.findMany({
        // By default show paid/shipped/delivered. Added a way to fetch PENDING later.
        // Default: Hide abandoned checkouts unless requested
        where: status ? { status } : { status: { not: 'PENDING' } },
        orderBy: { createdAt: 'desc' },
        include: {
            user: true,
            items: {
                include: {
                    product: { include: { images: true } }
                }
            }
        }
    });
}

/**
 * Capture a draft order as soon as contact details are entered.
 * This helps recover abandoned carts by saving user info before they leave.
 */
export async function saveDraftOrder(data: {
    items: any[];
    ordererName: string;
    ordererPhone: string;
    ordererEmail: string;
    clerkId?: string;
    orderId?: string; // Optional: If we already have a draft order ID to update
}) {
    try {
        const { items, ordererName, ordererPhone, ordererEmail, clerkId, orderId } = data;

        // Basic validation
        if (!items || items.length === 0 || !ordererPhone || !ordererName) {
            return { success: false, error: 'Missing basic info' };
        }

        const totalAmount = items.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);

        const orderData = {
            totalAmount,
            status: 'PENDING' as OrderStatus,
            ordererName,
            ordererPhone,
            ordererEmail,
            recipientName: ordererName, // Temporary until delivery step
            shippingAddress: 'Draft',
            ...(clerkId && { user: { connect: { clerkId } } }),
            items: {
                create: items.map((item: any) => ({
                    product: { connect: { id: item.productId } },
                    quantity: item.quantity,
                    price: item.price,
                    selectedSize: item.selectedSize,
                    personalizationText: item.personalizationText
                }))
            }
        };

        let order;
        if (orderId) {
            // If we have an ID, clear items and re-create them (common pattern for drafts)
            await prisma.orderItem.deleteMany({ where: { orderId } });
            order = await prisma.order.update({
                where: { id: orderId },
                data: {
                    ...orderData,
                    items: orderData.items // Re-link
                }
            });
        } else {
            order = await prisma.order.create({
                data: orderData
            });
        }

        return { success: true, orderId: order.id };
    } catch (error) {
        console.error('Error saving draft order:', error);
        return { success: false, error: 'Failed to save draft' };
    }
}

export async function getOrder(id: string) {
    return await prisma.order.findUnique({
        where: { id },
        include: {
            user: true,
            items: {
                include: {
                    product: { include: { images: true } }
                }
            }
        }
    });
}

import { sendOrderStatusEmail } from '@/lib/email-service';

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
    try {
        const order = await prisma.order.update({
            where: { id: orderId },
            data: { status },
            include: {
                user: true,
                items: {
                    include: {
                        product: { include: { images: true } }
                    }
                }
            }
        });

        revalidatePath('/admin/orders');
        revalidatePath(`/admin/orders/${orderId}`);

        // Trigger Email Notification (Fire & Forgetish, but we await to log)
        if (status === 'SHIPPED' || status === 'DELIVERED') {
            await sendOrderStatusEmail(order as any, status);
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating order status:', error);
        return { success: false, error: 'Failed to update order status' };
    }
}

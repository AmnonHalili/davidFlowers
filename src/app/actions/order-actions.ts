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

export async function getOrders() {
    return await prisma.order.findMany({
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

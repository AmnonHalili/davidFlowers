'use server';

import prisma from '@/lib/prisma';

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
                        product: true
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

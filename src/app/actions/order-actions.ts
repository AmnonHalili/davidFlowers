'use server';

import { PrismaClient, OrderStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function getOrders() {
    try {
        const orders = await prisma.order.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    }
                },
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return { success: true, data: orders };
    } catch (error) {
        console.error('Failed to fetch orders:', error);
        return { success: false, error: 'Failed to fetch orders' };
    }
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    try {
        await prisma.order.update({
            where: { id: orderId },
            data: { status: newStatus }
        });

        revalidatePath('/admin/orders');
        return { success: true };
    } catch (error) {
        console.error('Failed to update order status:', error);
        return { success: false, error: 'Failed to update status' };
    }
}

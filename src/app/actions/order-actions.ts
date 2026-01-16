'use server';

import prisma from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getOrders() {
    try {
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true, email: true } },
                _count: { select: { items: true } }
            }
        });
        return orders;
    } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
    }
}

export async function getOrder(id: string) {
    try {
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                user: true,
                items: {
                    include: {
                        product: { select: { name: true, price: true, images: { take: 1 } } }
                    }
                }
            }
        });
        return order;
    } catch (error) {
        console.error("Error fetching order:", error);
        return null;
    }
}

export async function updateOrderStatus(id: string, newStatus: OrderStatus) {
    try {
        await prisma.order.update({
            where: { id },
            data: { status: newStatus }
        });
        revalidatePath('/admin/orders');
        revalidatePath(`/admin/orders/${id}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating order status:", error);
        return { success: false, error: "Failed to update status" };
    }
}

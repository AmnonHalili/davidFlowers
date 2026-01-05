'use server';

import { PrismaClient, OrderStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function createDemoOrder() {
    try {
        // Find existing user or create dummy
        let user = await prisma.user.findFirst({
            where: { email: 'demo@example.com' }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: 'demo@example.com',
                    name: 'ישראל ישראלי',
                    role: 'CUSTOMER'
                }
            });
        }

        // Get a random product
        const product = await prisma.product.findFirst();

        if (!product) {
            return { success: false, error: 'No products found. Please seed products first.' };
        }

        // Create Order
        await prisma.order.create({
            data: {
                userId: user.id,
                totalAmount: product.price,
                recipientName: 'דנה כהן',
                shippingAddress: 'רחוב הרקפת 12, תל אביב',
                cardMessage: 'יום הולדת שמח אהובה! המון מזל טוב.',
                status: 'PENDING',
                items: {
                    create: {
                        productId: product.id,
                        quantity: 1,
                        price: product.price
                    }
                }
            }
        });

        revalidatePath('/admin/orders');
        return { success: true };
    } catch (error) {
        console.error('Failed to create demo order:', error);
        return { success: false, error: 'Failed to create demo order' };
    }
}

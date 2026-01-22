'use server';

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function toggleWishlist(productId: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    try {
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            include: { favorites: { where: { id: productId } } }
        });

        if (!user) return { success: false, error: 'User not found' };

        const isFavorited = user.favorites.length > 0;

        if (isFavorited) {
            await prisma.user.update({
                where: { clerkId: userId },
                data: {
                    favorites: {
                        disconnect: { id: productId }
                    }
                }
            });
        } else {
            await prisma.user.update({
                where: { clerkId: userId },
                data: {
                    favorites: {
                        connect: { id: productId }
                    }
                }
            });
        }

        revalidatePath('/wishlist');
        revalidatePath('/');
        return { success: true, isFavorited: !isFavorited };

    } catch (error) {
        console.error('Error toggling wishlist:', error);
        return { success: false, error: 'Failed to update wishlist' };
    }
}

export async function getWishlist() {
    const { userId } = await auth();
    if (!userId) return [];

    try {
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            include: {
                favorites: {
                    include: { images: true }
                }
            }
        });

        return user?.favorites || [];
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        return [];
    }
}

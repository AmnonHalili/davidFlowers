'use server';

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function getUserProfile() {
    const { userId } = await auth();
    if (!userId) return null;

    try {
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: {
                name: true,
                phone: true,
                address: true
            }
        });
        return user;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}

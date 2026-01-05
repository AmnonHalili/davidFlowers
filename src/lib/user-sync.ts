import { currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

export async function syncUser() {
    const user = await currentUser();

    if (!user) return null;

    // Determine role (whitelist admin email or default to CUSTOMER)
    // DEV MODE: Force ADMIN for everyone so you can test easily. Change this before production!
    const isAdmin = true; // user.emailAddresses.some(e => e.emailAddress === 'david@davidflowers.com');

    // Check if user exists in our DB
    const existingUser = await prisma.user.findUnique({
        where: { clerkId: user.id },
    });

    if (existingUser) {
        // Auto-promote if they are in whitespace but not admin in DB
        if (isAdmin && existingUser.role !== 'ADMIN') {
            return await prisma.user.update({
                where: { id: existingUser.id },
                data: { role: 'ADMIN' }
            });
        }
        return existingUser;
    }

    // Create new user
    return await prisma.user.create({
        data: {
            clerkId: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            image: user.imageUrl,
            role: isAdmin ? 'ADMIN' : 'CUSTOMER',
        },
    });
}

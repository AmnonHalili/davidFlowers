import { currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';


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

    // If not found by Clerk ID, try to find by Email (Migration / Production Switch fix)
    const email = user.emailAddresses[0]?.emailAddress;
    if (email) {
        const existingUserByEmail = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUserByEmail) {
            // Relink the existing user to the new Clerk ID
            console.log(`Relinking user ${email} to new Clerk ID: ${user.id}`);
            return await prisma.user.update({
                where: { id: existingUserByEmail.id },
                data: {
                    clerkId: user.id,
                    image: user.imageUrl, // Update image while we're at it
                    name: `${user.firstName || ''} ${user.lastName || ''}`.trim()
                }
            });
        }
    }

    // Create new user if absolutely no record found
    return await prisma.user.create({
        data: {
            clerkId: user.id,
            email: email!, // We verified it exists above or Clerk ensures it
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            image: user.imageUrl,
            role: isAdmin ? 'ADMIN' : 'CUSTOMER',
        },
    });
}

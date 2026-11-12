import 'server-only';
import { currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function syncUser() {
    const user = await currentUser();
    if (!user) return null;
    const existingUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (existingUser) return existingUser;

    const email = user.emailAddresses.find(e => e.verification?.status === 'verified')?.emailAddress;
    if (!email) return null;
    // Never relink an existing identity by email; migrations require explicit review.
    const emailOwner = await prisma.user.findUnique({ where: { email } });
    if (emailOwner) return null;
    return prisma.user.create({ data: {
        clerkId: user.id, email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        image: user.imageUrl, role: 'CUSTOMER',
    } });
}

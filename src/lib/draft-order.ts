import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { issueOrderCapability, verifyOrderCapability, DRAFT_LIFETIME_SECONDS } from './order-capabilities';

const cookieName = (id: string) => `order_draft_${id}`;

// Nested item replacement and the PENDING/version/ownership predicates are one atomic DB write.
export async function persistDraftOrder(data: Prisma.OrderCreateInput, orderId: string | undefined, finalize: boolean) {
    const { userId } = await auth();
    let order;
    if (orderId) {
        const grant = verifyOrderCapability(cookies().get(cookieName(orderId))?.value, 'draft');
        if (!grant || grant.orderId !== orderId || grant.subject !== userId) throw new Error('Draft access expired; start a new checkout');
        order = await prisma.order.update({
            where: {
                id: orderId, status: 'PENDING', AND: [{ payplusTransactionId: null }], shippingAddress: 'Draft',
                updatedAt: new Date(grant.version!),
                ...(userId ? { user: { clerkId: userId } } : { userId: null }),
            },
            data: {
                ...data,
                updatedAt: new Date(Math.max(Date.now(), Date.parse(grant.version!) + 1)),
                items: { deleteMany: {}, ...data.items },
            },
        });
    } else {
        order = await prisma.order.create({ data });
    }
    if (finalize) {
        cookies().delete(cookieName(order.id));
    } else {
        const token = issueOrderCapability({ purpose: 'draft', orderId: order.id, subject: userId,
            version: order.updatedAt.toISOString(), expiresAt: Date.now() + DRAFT_LIFETIME_SECONDS * 1000 });
        if (token) cookies().set(cookieName(order.id), token, {
            httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/',
            maxAge: DRAFT_LIFETIME_SECONDS,
        });
    }
    return order;
}

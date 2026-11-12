import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { createHash } from 'crypto';
import { Prisma, PaymentAttempt } from '@prisma/client';
import prisma from '@/lib/prisma';
import { issueOrderCapability, verifyOrderCapability, orderCapabilitiesAvailable, RECEIPT_LIFETIME_SECONDS, DRAFT_LIFETIME_SECONDS } from './order-capabilities';
import { draftCookieName } from './draft-order';
import { grantGuestReceipt } from './order-access';

const attemptCookie = (id: string) => `checkout_attempt_${id}`;
const closed = (attempt: PaymentAttempt) => attempt.state === 'VERIFIED';

async function attemptIdentity(id: string) {
    const { userId } = await auth();
    const grant = verifyOrderCapability(cookies().get(attemptCookie(id))?.value, 'checkout');
    if (!grant || grant.orderId !== id || grant.subject !== userId) throw new Error('Checkout access unavailable');
    const attempt = await prisma.paymentAttempt.findUnique({ where: { id } });
    if (!attempt || attempt.subject !== userId) throw new Error('Checkout access unavailable');
    return attempt;
}

function grantAttempt(attempt: PaymentAttempt) {
    const token = issueOrderCapability({ purpose: 'checkout', orderId: attempt.id, subject: attempt.subject,
        expiresAt: Date.now() + RECEIPT_LIFETIME_SECONDS * 1000 });
    if (!token) throw new Error('Checkout signing configuration unavailable');
    const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge: RECEIPT_LIFETIME_SECONDS };
    cookies().set(attemptCookie(attempt.id), token, options);
    cookies().set('active_checkout_attempt', token, options);
    if (!attempt.subject) grantGuestReceipt(attempt.orderId);
}

export async function preparePaymentAttempt(orderId?: string) {
    if (!orderCapabilitiesAvailable()) throw new Error('Checkout signing configuration unavailable');
    const { userId } = await auth();
    const activeGrant = verifyOrderCapability(cookies().get('active_checkout_attempt')?.value, 'checkout');
    if (activeGrant && activeGrant.subject === userId) {
        const active = await prisma.paymentAttempt.findUnique({ where: { id: activeGrant.orderId } });
        if (active && active.subject === userId && !closed(active)) {
            const result = await paymentAttemptResult(active);
            if (result.state === 'VERIFIED') {
                grantAttempt(active);
                return { attemptId: active.id, orderId: active.orderId, state: 'VERIFIED', resumeRequired: false };
            }
            if (active.state === 'PREPARED') {
                // No provider call can have started in PREPARED. Recover this same draft, even after
                // reload or invalid form submission; never silently replace an uncertain attempt.
                const draft = await prisma.order.findFirst({ where: { id: active.orderId, status: 'PENDING',
                    payplusTransactionId: null, shippingAddress: 'Draft',
                    ...(userId ? { user: { clerkId: userId } } : { userId: null }) } });
                if (!draft) throw new Error('Prepared draft changed');
                const token = issueOrderCapability({ purpose: 'draft', orderId: draft.id, subject: userId,
                    version: draft.updatedAt.toISOString(), expiresAt: Date.now() + DRAFT_LIFETIME_SECONDS * 1000 });
                if (!token) throw new Error('Checkout signing configuration unavailable');
                cookies().set(draftCookieName(draft.id), token, { httpOnly: true, secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax', path: '/', maxAge: DRAFT_LIFETIME_SECONDS });
                orderId = draft.id;
            } else {
                const order = await prisma.order.findUnique({ where: { id: active.orderId }, select: { totalAmount: true } });
                grantAttempt(active);
                return { attemptId: active.id, orderId: active.orderId, state: result.state,
                    resumeRequired: active.orderId !== orderId, amount: order?.totalAmount.toString() };
            }
        }
    }
    if (!orderId) return { requiresDraft: true };
    const grant = verifyOrderCapability(cookies().get(draftCookieName(orderId))?.value, 'draft');
    if (!grant || grant.orderId !== orderId || grant.subject !== userId) throw new Error('Draft access unavailable');
    const order = await prisma.order.findFirst({ where: { id: orderId, status: 'PENDING', payplusTransactionId: null,
        shippingAddress: 'Draft', updatedAt: new Date(grant.version!),
        ...(userId ? { user: { clerkId: userId } } : { userId: null }) } });
    if (!order) throw new Error('Draft changed');
    // Atomic unique orderId is the server idempotency scope; concurrent prepare calls cannot create two attempts.
    const attempt = await prisma.paymentAttempt.upsert({ where: { orderId }, update: {},
        create: { orderId, subject: userId, draftVersion: order.updatedAt } });
    if (attempt.subject !== userId) throw new Error('Checkout access unavailable');
    await prisma.paymentAttempt.updateMany({ where: { id: attempt.id, state: 'PREPARED' }, data: { draftVersion: order.updatedAt } });
    const refreshed = await prisma.paymentAttempt.findUniqueOrThrow({ where: { id: attempt.id } });
    grantAttempt(refreshed);
    return { attemptId: refreshed.id, orderId, state: refreshed.state, resumeRequired: false, amount: order.totalAmount.toString() };
}

export async function paymentAttemptResult(attempt: PaymentAttempt) {
    // The ledger is authoritative even if the subsequent attempt-state write failed or crashed.
    // Recheck immediately before exposing a URL, including the initial GenerateLink response.
    const fact = await prisma.paymentVerification.findFirst({ where: { orderId: attempt.orderId }, select: { transactionId: true } });
    const order = await prisma.order.findUnique({ where: { id: attempt.orderId }, select: { status: true, payplusTransactionId: true, shippingAddress: true } });
    if (!order) throw new Error('Checkout order unavailable');
    if (fact || order.payplusTransactionId || ['PAID', 'SHIPPED', 'DELIVERED', 'PAYMENT_REVIEW'].includes(order.status)) {
        return { state: 'VERIFIED' as const, orderId: attempt.orderId };
    }
    if (attempt.state === 'LINK_READY' && attempt.paymentUrl && order.status === 'PENDING' && order.shippingAddress !== 'Draft') return { state: 'LINK_READY' as const, url: attempt.paymentUrl, orderId: attempt.orderId };
    if (attempt.state === 'VERIFIED') return { state: 'VERIFIED' as const, orderId: attempt.orderId };
    return { state: 'UNRESOLVED' as const, orderId: attempt.orderId,
        message: 'ניסיון התשלום עדיין בבדיקה. אין להתחיל תשלום חדש. נסו לבדוק את אותו ניסיון שוב או פנו לחנות.' };
}

export async function readPaymentAttempt(id: string) {
    const attempt = await attemptIdentity(id);
    const result = await paymentAttemptResult(attempt);
    return attempt.state === 'PREPARED' && result.state !== 'VERIFIED' ? null : result;
}

type ProviderOrder = { orderId: string; amount: number; customerName: string; customerPhone: string; customerEmail: string };

export async function initiatePaymentAttempt(id: string, data: Prisma.OrderCreateInput,
    createLink: (order: ProviderOrder) => Promise<string>) {
    const attempt = await attemptIdentity(id);
    const prior = await paymentAttemptResult(attempt);
    if (attempt.state !== 'PREPARED' || prior.state === 'VERIFIED') return prior;
    const requestFingerprint = createHash('sha256').update(JSON.stringify(data)).digest('hex');
    const order = await prisma.$transaction(async tx => {
        const claim = await tx.paymentAttempt.updateMany({ where: { id, state: 'PREPARED' },
            data: { state: 'REQUESTING', requestFingerprint } });
        if (claim.count !== 1) return null;
        return tx.order.update({ where: { id: attempt.orderId, status: 'PENDING', AND: [{ payplusTransactionId: null }],
            shippingAddress: 'Draft', updatedAt: attempt.draftVersion,
            ...(attempt.subject ? { user: { clerkId: attempt.subject } } : { userId: null }) },
            data: { ...data, updatedAt: new Date(Math.max(Date.now(), attempt.draftVersion.getTime() + 1)),
                items: { deleteMany: {}, ...data.items } } });
    });
    if (!order) return paymentAttemptResult(await prisma.paymentAttempt.findUniqueOrThrow({ where: { id } }));
    // REQUESTING is committed before network I/O. A crash at any later point blocks another GenerateLink.
    try {
        const url = await createLink({ orderId: order.id, amount: Number(order.totalAmount), customerName: order.ordererName,
            customerPhone: order.ordererPhone || '', customerEmail: order.ordererEmail });
        const parsed = new URL(url);
        if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error('Invalid provider URL');
        const stored = await prisma.paymentAttempt.updateMany({ where: { id, state: 'REQUESTING' }, data: { state: 'LINK_READY', paymentUrl: url } });
        if (stored.count !== 1) return paymentAttemptResult(await prisma.paymentAttempt.findUniqueOrThrow({ where: { id } }));
        cookies().delete(draftCookieName(order.id));
        return paymentAttemptResult(await prisma.paymentAttempt.findUniqueOrThrow({ where: { id } }));
    } catch {
        // Timeout, malformed success, HTTP failure and failed result persistence are all uncertain outcomes.
        // Never reset to PREPARED or issue a replacement link automatically.
        await prisma.paymentAttempt.updateMany({ where: { id, state: 'REQUESTING' }, data: { state: 'UNKNOWN' } }).catch(() => {});
        return { state: 'UNRESOLVED' as const, orderId: order.id,
            message: 'ייתכן שנוצר דף תשלום. אין לפתוח ניסיון חדש או לשלם שוב. פנו לחנות לבדיקת הניסיון הקיים.' };
    }
}

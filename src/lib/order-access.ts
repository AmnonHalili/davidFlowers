import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { issueOrderCapability, verifyOrderCapability, RECEIPT_LIFETIME_SECONDS } from './order-capabilities';

const receiptCookieName = (orderId: string) => `order_receipt_${orderId}`;

export function acceptGuestReceipt(token: string): string | null {
    const claims = verifyOrderCapability(token, 'receipt');
    if (!claims) return null;
    cookies().set(receiptCookieName(claims.orderId), token, {
        httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/',
        maxAge: Math.min(24 * 60 * 60, Math.floor((claims.expiresAt - Date.now()) / 1000)),
    });
    return claims.orderId;
}

export function grantGuestReceipt(orderId: string) {
    const token = issueOrderCapability({ purpose: 'receipt', orderId, expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
    if (token) acceptGuestReceipt(token);
}

export function createGuestReceiptLink(orderId: string): string | undefined {
    const origin = process.env.NEXT_PUBLIC_APP_URL;
    if (!origin) return undefined;
    const url = new URL('/receipt/access', origin);
    if (url.protocol !== 'https:') return undefined;
    const token = issueOrderCapability({ purpose: 'receipt', orderId, expiresAt: Date.now() + RECEIPT_LIFETIME_SECONDS * 1000 });
    if (!token) return undefined;
    url.searchParams.set('token', token);
    return url.toString();
}

export async function customerOrderScope(orderId: string) {
    const { userId } = await auth();
    // A browser receipt never overrides the currently signed-in account's ownership.
    if (userId) return { id: orderId, user: { clerkId: userId } };
    const token = cookies().get(receiptCookieName(orderId))?.value;
    const claims = verifyOrderCapability(token, 'receipt');
    if (claims?.orderId === orderId) return { id: orderId, userId: null };
    return { id: orderId, userId: '__no_authenticated_owner__' };
}

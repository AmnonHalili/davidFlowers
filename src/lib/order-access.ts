import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';

function signature(orderId: string) {
    const secret = process.env.CLERK_SECRET_KEY;
    return secret ? createHmac('sha256', secret).update(`guest-receipt:${orderId}`).digest('hex') : null;
}

export function grantGuestReceipt(orderId: string) {
    const value = signature(orderId);
    if (value) cookies().set('order_receipt', `${orderId}:${value}`, {
        httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax',
        path: '/', maxAge: 60 * 60 * 24,
    });
}

export async function customerOrderScope(orderId: string) {
    const { userId } = await auth();
    const value = cookies().get('order_receipt')?.value;
    const expected = signature(orderId);
    const supplied = value?.startsWith(`${orderId}:`) ? value.slice(orderId.length + 1) : '';
    if (expected && /^[a-f0-9]{64}$/.test(supplied) &&
        timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return { id: orderId };
    if (!userId) return { id: orderId, userId: '__no_authenticated_owner__' };
    return { id: orderId, user: { clerkId: userId } };
}

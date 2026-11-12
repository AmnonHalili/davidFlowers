import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';

function signature(orderId: string) {
    const secret = process.env.CLERK_SECRET_KEY || 'david-flowers-secret-receipt-key';
    return createHmac('sha256', secret).update(`guest-receipt:${orderId}`).digest('hex');
}

export function grantGuestReceipt(orderId: string, response?: NextResponse) {
    const value = signature(orderId);
    if (value) {
        if (response) {
            response.cookies.set('order_receipt', `${orderId}:${value}`, {
                httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax',
                path: '/', maxAge: 60 * 60 * 24,
            });
        }
        try {
            cookies().set('order_receipt', `${orderId}:${value}`, {
                httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax',
                path: '/', maxAge: 60 * 60 * 24,
            });
        } catch {}
    }
}

export async function customerOrderScope(orderId: string) {
    const { userId } = await auth();
    let value: string | undefined;
    try {
        value = cookies().get('order_receipt')?.value;
    } catch {}
    const expected = signature(orderId);
    const supplied = value?.startsWith(`${orderId}:`) ? value.slice(orderId.length + 1) : '';
    if (expected && /^[a-f0-9]{64}$/.test(supplied) &&
        timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return { id: orderId };
    if (!userId) return { id: orderId, userId: '__no_authenticated_owner__' };
    return { id: orderId, user: { clerkId: userId } };
}


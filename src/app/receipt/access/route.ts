import { NextResponse } from 'next/server';
import { acceptGuestReceipt } from '@/lib/order-access';

// Exchange a scoped email capability for an HttpOnly cookie without rendering analytics/assets.
export async function GET(request: Request) {
    const token = new URL(request.url).searchParams.get('token');
    const orderId = token ? acceptGuestReceipt(token) : null;
    const target = new URL(orderId ? `/success?orderId=${encodeURIComponent(orderId)}` : '/receipt/unavailable', request.url);
    const response = NextResponse.redirect(target, 303);
    response.headers.set('Cache-Control', 'private, no-store');
    response.headers.set('Referrer-Policy', 'no-referrer');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
}

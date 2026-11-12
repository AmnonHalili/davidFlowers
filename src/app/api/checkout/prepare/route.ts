import { NextResponse } from 'next/server';
import { preparePaymentAttempt } from '@/lib/payment-attempt';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        if (body.orderId !== undefined && body.orderId !== null && typeof body.orderId !== 'string') return NextResponse.json({ error: 'Invalid draft' }, { status: 400 });
        return NextResponse.json(await preparePaymentAttempt(body.orderId || undefined), { headers: { 'Cache-Control': 'no-store' } });
    } catch {
        return NextResponse.json({ error: 'לא ניתן להתחיל ניסיון תשלום מאובטח. נסו לבדוק את הניסיון הקיים או פנו לחנות.' }, { status: 409 });
    }
}

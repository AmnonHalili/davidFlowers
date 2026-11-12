import { NextResponse } from 'next/server';
import { finalizePayment } from '@/lib/payment-finalization';

async function processNotification(body: any) {
    // Callback values are routing hints only. All financial facts come from authenticated View.
    const transactionUid = body?.transaction_uid || body?.transaction?.uid;
    const orderId = body?.more_info || body?.transaction?.more_info;
    if (typeof transactionUid !== 'string' || typeof orderId !== 'string') return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
    if (body?.transaction_type === 'Refund' || body?.transaction_type === 'Cancel') {
        return NextResponse.json({ received: true, requiresReconciliation: true });
    }
    const result = await finalizePayment(orderId, transactionUid);
    return NextResponse.json(result, { status: result.success ? 200 : 409, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: Request) {
    try { return await processNotification(await req.json()); }
    catch { return NextResponse.json({ error: 'Notification could not be processed' }, { status: 500 }); }
}

export async function GET(req: Request) {
    try { return await processNotification(Object.fromEntries(new URL(req.url).searchParams)); }
    catch { return NextResponse.json({ error: 'Notification could not be processed' }, { status: 500 }); }
}

import 'server-only';

export type ExpectedPayment = { orderId: string; transactionUid: string; amount: string; currency: 'ILS'; terminalUid: string };
export type VerifiedPayment = { orderId: string; transactionUid: string; amountMinor: number; currency: 'ILS' };

// Do not use binary floating-point rounding to turn a mismatched amount into a match.
export function moneyToMinor(value: unknown): number | null {
    if (typeof value !== 'string' && typeof value !== 'number') return null;
    const text = String(value);
    if (!/^\d+(?:\.\d{1,2})?$/.test(text)) return null;
    const [whole, fraction = ''] = text.split('.');
    const result = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
    return Number.isSafeInteger(result) && result > 0 ? result : null;
}

// Official Transactions/View 200 response: results + data[]; no callback fields are trusted.
// https://docs.payplus.co.il/reference/post_transactions-view
export function parseVerifiedPayment(payload: unknown, expected: ExpectedPayment): VerifiedPayment | null {
    if (!payload || typeof payload !== 'object') return null;
    const response = payload as any;
    if (response.results?.status !== 'success' || response.results?.code !== 0 || !Array.isArray(response.data) || response.data.length !== 1) return null;
    const entry = response.data[0];
    const transaction = entry?.transaction;
    const amountMinor = moneyToMinor(transaction?.amount);
    const expectedMinor = moneyToMinor(expected.amount);
    if (!transaction || transaction.transaction_uid !== expected.transactionUid || transaction.more_info !== expected.orderId ||
        transaction.transaction_type !== 'Charge' || transaction.status_code !== '000' || transaction.transaction_is_cancelled !== false ||
        transaction.currency !== expected.currency || entry.data?.terminal_uid !== expected.terminalUid ||
        amountMinor === null || expectedMinor === null || amountMinor !== expectedMinor) return null;
    return { orderId: expected.orderId, transactionUid: expected.transactionUid, amountMinor, currency: expected.currency };
}

export async function verifyPayPlusTransaction(transactionUid: string, orderId: string, amount: string): Promise<VerifiedPayment | null> {
    const apiKey = process.env.PAYPLUS_API_KEY || process.env.PAY_PLUS_API_KEY;
    const secretKey = process.env.PAYPLUS_SECRET_KEY || process.env.PAY_PLUS_SECRET_KEY;
    const terminalUid = process.env.PAYPLUS_TERMINAL_ID;
    if (!apiKey || !secretKey || !terminalUid) return null;
    try {
        const response = await fetch('https://restapi.payplus.co.il/api/v1.0/Transactions/View', {
            method: 'POST', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(10000),
            headers: { 'api-key': apiKey, 'secret-key': secretKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ transaction_uid: transactionUid }),
        });
        if (!response.ok) {
            console.error('Payment verification unavailable', { status: response.status });
            return null;
        }
        return parseVerifiedPayment(await response.json(), { orderId, transactionUid, amount, currency: 'ILS', terminalUid });
    } catch {
        console.error('Payment verification failed');
        return null;
    }
}

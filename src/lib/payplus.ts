import { logger } from "@/lib/logger";

export async function verifyPayPlusTransaction(transactionUid: string, expectedOrderId: string): Promise<boolean> {
    const payPlusApiKey = process.env.PAYPLUS_API_KEY || process.env.PAY_PLUS_API_KEY;
    const payPlusSecretKey = process.env.PAYPLUS_SECRET_KEY || process.env.PAY_PLUS_SECRET_KEY;
    const payPlusTerminalId = process.env.PAYPLUS_TERMINAL_ID;

    if (!payPlusApiKey || !payPlusSecretKey) {
        console.warn('[PAYPLUS_WEBHOOK] Missing API keys - skipping verification in dev/mock mode');
        return true;
    }

    try {
        console.log(`[PAYPLUS_VERIFY] Verifying transaction ${transactionUid} for order ${expectedOrderId}`);

        // Try Transactions/GetStatus with terminal_uid
        const response = await fetch(
            `https://restapi.payplus.co.il/api/v1.0/Transactions/GetStatus`,
            {
                method: 'POST',
                headers: {
                    'Authorization': JSON.stringify({
                        'api_key': payPlusApiKey,
                        'secret_key': payPlusSecretKey
                    }),
                    'api-key': payPlusApiKey,
                    'secret-key': payPlusSecretKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    transaction_uid: transactionUid,
                    terminal_uid: payPlusTerminalId // Some endpoints require identifying the terminal
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();

            // If it's a 403, it's likely IP restriction on PayPlus side (common with Vercel)
            // We downgrade this to WARN because the system handles it via payload verification
            if (response.status === 403) {
                console.warn(`[PAYPLUS_VERIFY] 403 Forbidden: API restricted (likely IP). Falling back to payload verification.`);
                await logger.warn('PayPlus Verification API Restricted (403)', 'PayPlusVerify', {
                    note: 'PayPlus GetStatus API returned 403. This is often an IP whitelist requirement. Falling back to secure payload check.',
                    transactionUid
                });
            } else {
                console.error(`[PAYPLUS_VERIFY] API error: ${response.status} - ${errorText}`);
                await logger.error('PayPlus Verification API Error', 'PayPlusVerify', {
                    status: response.status,
                    body: errorText
                });
            }
            return false;
        }

        const result = await response.json();

        if (result.status === 'error') {
            console.error(`[PAYPLUS_VERIFY] PayPlus returned error:`, result);
            await logger.error('PayPlus Verification Returned Error', 'PayPlusVerify', { result });
            return false;
        }

        const transaction = result.data;
        if (!transaction) {
            await logger.error('Verification Failed: No Transaction Data', 'PayPlusVerify', { result });
            return false;
        }

        // Verify transaction details
        if (transaction.status_code !== '000') {
            console.error(`[PAYPLUS_VERIFY] Transaction failed with status: ${transaction.status_code}`);
            await logger.error('Verification Failed: Bad Status', 'PayPlusVerify', { statusCode: transaction.status_code, transaction });
            return false;
        }

        // more_info field in PayPlus contains the exact Order ID (passed during checkout)
        if (transaction.more_info !== expectedOrderId) {
            console.error(`[PAYPLUS_VERIFY] Order ID mismatch: ${transaction.more_info} !== ${expectedOrderId}`);
            await logger.error('Verification Failed: Order ID Mismatch', 'PayPlusVerify', {
                expected: expectedOrderId,
                received: transaction.more_info,
                full_transaction: transaction
            });
            return false;
        }

        console.log(`✅ Transaction ${transactionUid} verified successfully`);
        return true;

    } catch (error: any) {
        console.error('[PAYPLUS_VERIFY_ERROR]', error);
        await logger.error('Verification Logic Exception', 'PayPlusVerify', { message: error.message });
        return false;
    }
}

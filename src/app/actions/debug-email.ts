'use server';

import { Resend } from 'resend';

export async function sendTestEmailAction(to: string) {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    if (!apiKey) {
        return {
            success: false,
            error: 'Missing RESEND_API_KEY in environment variables',
            debug: { apiKeyExists: false, fromEmail }
        };
    }

    const resend = new Resend(apiKey);

    try {
        console.log(`[DEBUG] Attempting to send test email to ${to} from ${fromEmail}`);

        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: to,
            subject: 'David Flowers - Production Debug Email',
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h1>Test Email from Production</h1>
                    <p>If you received this, the email service is working correctly!</p>
                    <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                    <p><strong>Environment:</strong> ${process.env.NODE_ENV}</p>
                </div>
            `
        });

        if (error) {
            console.error('[DEBUG] Resend API Error:', error);
            // Return the raw error object which might contain headers/status
            return {
                success: false,
                error: error.message || 'Unknown Resend Error',
                fullError: error,
                debug: { apiKeyExists: true, fromEmail }
            };
        }

        return {
            success: true,
            data,
            debug: { apiKeyExists: true, fromEmail }
        };

    } catch (err: any) {
        console.error('[DEBUG] Unexpected Exception:', err);
        return {
            success: false,
            error: err.message || 'Unexpected server error',
            fullError: err,
            debug: { apiKeyExists: true, fromEmail }
        };
    }
}

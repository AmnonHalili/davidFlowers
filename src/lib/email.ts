import { Resend } from 'resend';
import { OrderConfirmationEmail } from './emails/order-confirmation';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendOrderConfirmationData {
    to: string;
    orderNumber: string;
    customerName: string;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    shippingAddress: string;
    deliveryDate?: string;
    deliveryNotes?: string;
}

export async function sendOrderConfirmation(data: SendOrderConfirmationData) {
    try {
        // Check if Resend is configured
        if (!process.env.RESEND_API_KEY) {
            console.warn('⚠️  RESEND_API_KEY not configured - email not sent');
            return { success: false, error: 'Email service not configured' };
        }

        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

        const { data: emailData, error } = await resend.emails.send({
            from: fromEmail,
            to: data.to,
            subject: `אישור הזמנה ${data.orderNumber} - דוד פרחים`,
            react: OrderConfirmationEmail(data),
        });

        if (error) {
            console.error('[EMAIL_ERROR]', error);
            return { success: false, error };
        }

        console.log(`✅ Email sent to ${data.to}:`, emailData?.id);
        return { success: true, data: emailData };

    } catch (error: any) {
        console.error('[EMAIL_SEND_ERROR]', error);
        return { success: false, error: error.message || 'Failed to send email' };
    }
}

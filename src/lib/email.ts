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

export interface SendAdminNotificationData {
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    shippingAddress?: string;
    deliveryDate?: Date | null;
    items: Array<{
        name: string;
        quantity: number;
    }>;
}

export async function sendOrderConfirmation(data: SendOrderConfirmationData) {
    try {
        console.log(`[EMAIL_SERVICE] Attempting to send order confirmation for #${data.orderNumber} to ${data.to}`);

        // Check if Resend is configured
        if (!process.env.RESEND_API_KEY) {
            console.error('DavidFlowers: RESEND_API_KEY is missing. Environment check failed.');
            return { success: false, error: 'Email service not configured' };
        }

        const fromEmail = process.env.RESEND_FROM_EMAIL;
        if (!fromEmail) {
            console.warn('[EMAIL_SERVICE] RESEND_FROM_EMAIL is missing. Falling back to default.');
        }

        const finalFromEmail = fromEmail || 'onboarding@resend.dev';

        const { data: emailData, error } = await resend.emails.send({
            from: finalFromEmail,
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

    } catch (error: unknown) {
        console.error('[EMAIL_SEND_ERROR]', error);
        return { success: false, error: (error as Error).message || 'Failed to send email' };
    }
}

export async function sendAdminNotification(data: SendAdminNotificationData) {
    try {
        if (!process.env.RESEND_API_KEY) return;

        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
        const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.replace(/"/g, '').trim());

        if (adminEmails.length === 0) return;

        const isPickup = data.shippingAddress === 'Self Pickup';
        const deliveryText = isPickup ? 'איסוף עצמי' : 'משלוח';

        let deliveryDateLine = '';
        if (data.deliveryDate) {
            const tempDate = new Date(data.deliveryDate);
            const dateStr = tempDate.toLocaleDateString('he-IL');
            const hour = tempDate.getHours().toString().padStart(2, '0');
            const min = tempDate.getMinutes().toString().padStart(2, '0');
            // If it's strictly Midnight (00:00), we probably only captured a Date.
            // Otherwise, we captured a Date + Time slot.
            const hasTime = (tempDate.getHours() !== 0 || tempDate.getMinutes() !== 0);
            const timeStr = hasTime ? ` בשעה ${hour}:${min}` : '';
            deliveryDateLine = `<p><strong>מועד ${isPickup ? 'איסוף' : 'משלוח'}:</strong> ${dateStr}${timeStr}</p>`;
        } else {
            deliveryDateLine = `<p><strong>מועד ${isPickup ? 'איסוף' : 'משלוח'}:</strong> לא נבחר</p>`;
        }

        await resend.emails.send({
            from: fromEmail,
            to: adminEmails,
            subject: `🔔 הזמנה חדשה שולמה: ${data.orderNumber}`,
            html: `
                <div dir="rtl" style="font-family: sans-serif;">
                    <h2>הזמנה חדשה שולמה באתר!</h2>
                    <p><strong>מספר הזמנה:</strong> ${data.orderNumber}</p>
                    <p><strong>לקוח:</strong> ${data.customerName}</p>
                    <p><strong>סכום כולל:</strong> ₪${data.totalAmount}</p>
                    <p><strong>סוג:</strong> ${deliveryText}</p>
                    ${deliveryDateLine}
                    <h3>פריטים:</h3>
                    <ul>
                        ${data.items.map(item => `<li>${item.name} (x${item.quantity})</li>`).join('')}
                    </ul>
                    <hr />
                    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders/${data.orderNumber}">לצפייה בהזמנה בניהול</a></p>
                </div>
            `
        });

        console.log(`🔔 Admin notification sent for order ${data.orderNumber}`);
    } catch (error) {
        console.error('[ADMIN_EMAIL_ERROR]', error);
    }
}

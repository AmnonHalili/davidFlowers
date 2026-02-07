import { Resend } from 'resend';
import { Order, OrderItem, Product, ProductImage, User } from '@prisma/client';

const resend = new Resend(process.env.RESEND_API_KEY);

type OrderWithItems = Order & {
    user: User | null;
    items: (OrderItem & {
        product: Product & { images: ProductImage[] }
    })[];
};

export async function sendOrderStatusEmail(order: OrderWithItems, status: 'SHIPPED' | 'DELIVERED') {
    if (!process.env.RESEND_API_KEY) {
        console.warn('DavidFlowers: RESEND_API_KEY is missing. Email not sent.');
        return { success: false, error: 'Missing API Key' };
    }

    const email = order.user?.email || order.ordererEmail; // Prefer user email, fallback to orderer email
    if (!email) {
        console.warn(`DavidFlowers: No email found for order ${order.id}.`);
        return { success: false, error: 'No email address' };
    }

    const subject = status === 'SHIPPED'
        ? `הזמנה #${order.id.slice(-8)} בדרך אלייך! 🚚`
        : `הזמנה #${order.id.slice(-8)} נמסרה בהצלחה! 🌸`;

    const heading = status === 'SHIPPED'
        ? 'המשלוח שלך יצא לדרך'
        : 'המשלוח נמסר ליעדו';

    const message = status === 'SHIPPED'
        ? `איזה כיף! ההזמנה שלך נאספה על ידי השליח והיא עושה את דרכה לכתובת: <strong>${order.shippingAddress}</strong>.`
        : `שמחים לעדכן שההזמנה שלך נמסרה בהצלחה ל-<strong>${order.recipientName}</strong>. תודה שבחרת ב-David Flowers!`;

    const itemsHtml = order.items.map(item => `
        <div style="display: flex; gap: 10px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
            <img src="${item.product.images[0]?.url || ''}" alt="${item.product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
            <div>
                <div style="font-weight: bold;">${item.product.name}</div>
                <div style="font-size: 12px; color: #666;">כמות: ${item.quantity} | גודל: ${item.selectedSize || 'רגיל'}</div>
            </div>
        </div>
    `).join('');

    const html = `
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; direction: rtl; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
                .header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 20px; margin-bottom: 20px; }
                .title { font-size: 24px; font-weight: bold; color: #111; margin-bottom: 10px; }
                .content { font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px; }
                .footer { text-align: center; font-size: 12px; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; }
                .button { display: inline-block; background-color: #111; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>David Flowers</h1>
                </div>
                
                <h2 class="title">${heading}</h2>
                
                <div class="content">
                    <p>שלום ${order.ordererName || 'לקוח יקר'},</p>
                    <p>${message}</p>
                </div>

                <div style="background: #fafafa; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                    <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; color: #888;">פירוט הזמנה #${order.id.slice(-8)}</h3>
                    ${itemsHtml}
                </div>

                <div style="text-align: center;">
                    <a href="https://davidflowers.co.il/track-order" class="button" style="color: #ffffff;">מעקב אחר הזמנה</a>
                </div>

                <div class="footer">
                    <p>© ${new Date().getFullYear()} David Flowers. כל הזכויות שמורות.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        const data = await resend.emails.send({
            from: 'David Flowers <orders@davidflowers.co.il>', // Ensure this domain is verified in Resend
            to: [email],
            subject: subject,
            html: html,
        });

        console.log(`DavidFlowers: Email sent to ${email} for order ${order.id}. ID: ${data.data?.id}`);
        return { success: true, data };
    } catch (error) {
        console.error('DavidFlowers: Failed to send email:', error);
        return { success: false, error };
    }
}

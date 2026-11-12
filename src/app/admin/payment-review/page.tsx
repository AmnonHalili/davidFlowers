import { requireAdmin } from '@/lib/admin-auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function PaymentReviewPage() {
    await requireAdmin();
    const payments = await prisma.paymentVerification.findMany({
        where: { fulfillmentState: 'REQUIRES_REVIEW' }, orderBy: { verifiedAt: 'desc' }, take: 100,
    });
    const attempts = await prisma.paymentAttempt.findMany({ where: { state: { in: ['REQUESTING', 'UNKNOWN'] } }, orderBy: { updatedAt: 'desc' }, take: 100 });
    return <main className="p-8" dir="rtl">
        <h1 className="text-2xl mb-4">תשלומים מאומתים הדורשים התאמה</h1>
        <p className="mb-6">אין לבקש תשלום נוסף או לאשר הכנה לפני בדיקת החיוב והמלאי. הרשימה מציגה עד 100 מקרים אחרונים. עמוד זה אינו מבצע החזרים או משנה מלאי.</p>
        <ul className="space-y-4">{payments.map(payment => <li key={payment.transactionId} className="border p-4">
            <Link className="underline" href={`/admin/orders/${payment.orderId}`}>הזמנה {payment.orderId}</Link>
            <p>חיוב מאומת: {payment.amount.toString()} {payment.currency}</p>
            <p>מצב ההזמנה בעת האימות: {payment.orderStatusAtVerification}</p>
            <p>אסמכתה: {payment.transactionId}</p>
            <p>אומת ב־{payment.verifiedAt.toISOString()}</p>
        </li>)}</ul>
        <h2 className="text-xl mt-8 mb-4">ניסיונות פתיחת תשלום ללא תוצאה ודאית</h2>
        <p>אין ליצור קישור חלופי לפני התאמה מול ספק התשלום. מצב זה אינו הוכחה לחיוב או להעדר חיוב.</p>
        <ul>{attempts.map(attempt => <li key={attempt.id} className="border p-4">
            <Link className="underline" href={`/admin/orders/${attempt.orderId}`}>הזמנה {attempt.orderId}</Link>
            <p>ניסיון: {attempt.id} — {attempt.state}</p><p>{attempt.updatedAt.toISOString()}</p>
        </li>)}</ul>
        {!payments.length && <p>אין תשלומים הממתינים להתאמה.</p>}
    </main>;
}

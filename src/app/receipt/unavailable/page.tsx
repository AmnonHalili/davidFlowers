import Link from 'next/link';
export default function ReceiptUnavailable() {
    return <main dir="rtl" className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-2xl mb-4">קישור ההזמנה אינו זמין</h1>
        <p>הקישור תקף לשבעה ימים וייתכן שפג תוקפו או בוטל. אם ההזמנה בוצעה בחשבון, התחברו אליו. אחרת פנו לחנות לקבלת עזרה.</p>
        <Link className="inline-block underline mt-6" href="/account">כניסה לחשבון</Link>
    </main>;
}

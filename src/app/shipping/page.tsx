import Link from 'next/link';
import { Truck, RotateCcw, MessageCircle, Clock, CheckCircle, HelpCircle, AlertCircle } from 'lucide-react';

export const metadata = {
    title: 'משלוחים והחזרות | פרחי דוד אשקלון',
    description: 'מדיניות המשלוחים וההחזרות של פרחי דוד. משלוחים מהירים לאשקלון והסביבה.',
};

const faqs = [
    {
        icon: Clock,
        question: 'מתי יגיע המשלוח שלי?',
        answer: 'אנו מציעים משלוחים בלוחות זמנים קבועים ונוחים. בעת ביצוע ההזמנה בעגלה תוכלו לבחור את חלונית השעה המועדפת עליכם (שימו לב שבימי שישי זמני הפעילות קצרים יותר).'
    },
    {
        icon: Truck,
        question: 'לאילו אזורים אתם מספקים?',
        answer: 'אנו מספקים לאשקלון, באר גנים, ניצנים, ניצן, הודיה, ברכיה, ניר ישראל, בית שקמה, בת הדר וכפר סילבר. לאזורים אחרים — צרו קשר לבדיקה.'
    },
    {
        icon: CheckCircle,
        question: 'מתי המשלוח חינם?',
        answer: 'הזמנות מעל ₪350 זכאיות למשלוח חינם לכל אזורי המשלוח שלנו.'
    },
    {
        icon: AlertCircle,
        question: 'מה קורה אם הפרחים הגיעו פגומים?',
        answer: 'אנחנו מבטיחים שהפרחים יגיעו במצב מושלם. אם התרחש מקרה חריג — שילחו לנו תמונה ב-WhatsApp תוך 24 שעות ואנחנו נסדר החלפה מיד, ללא עלות.'
    },
    {
        icon: RotateCcw,
        question: 'האם אפשר לבטל הזמנה?',
        answer: 'ניתן לבטל הזמנה עד 3 שעות לפני מועד המשלוח המבוקש. לאחר מכן, עבדנו כבר על הפרחים שלכם ולא ניתן לבצע ביטול מלא.'
    },
    {
        icon: HelpCircle,
        question: 'מה אם אני לא יודע מה לבחור?',
        answer: 'שלחו לנו הודעה ב-WhatsApp! נשמח לעזור לכם לבחור את הזר המושלם לפי תקציב, סגנון ואירוע. אנחנו כאן בשבילכם.'
    }
];

export default function ShippingPage() {
    return (
        <main className="bg-white min-h-screen pb-24 rtl" dir="rtl">

            {/* Hero Banner */}
            <div className="bg-gradient-to-b from-stone-50 to-white border-b border-stone-100 pt-16 pb-12 px-6 text-center">
                <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Truck className="w-7 h-7 text-david-green" strokeWidth={1.5} />
                </div>
                <h1 className="font-serif text-4xl md:text-5xl text-stone-900 mb-3">משלוחים והחזרות</h1>
                <p className="text-stone-500 max-w-md mx-auto text-lg font-light">
                    כל מה שצריך לדעת על משלוח הפרחים שלכם — ברור, פשוט ושקוף.
                </p>
            </div>

            <div className="max-w-3xl mx-auto px-6 pt-16 space-y-16">

                {/* Shipping areas + costs */}
                <section>
                    <h2 className="font-serif text-3xl text-stone-900 mb-8">אזורי משלוח ועלויות</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { city: 'אשקלון', price: '₪25', free: true },
                            { city: 'באר גנים', price: '₪45', free: false },
                            { city: 'ניצנים', price: '₪45', free: false },
                            { city: 'ניצן', price: '₪45', free: false },
                            { city: 'הודיה', price: '₪45', free: false },
                            { city: 'ברכיה', price: '₪45', free: false },
                            { city: 'ניר ישראל', price: '₪45', free: false },
                            { city: 'בית שקמה', price: '₪45', free: false },
                            { city: 'בת הדר', price: '₪45', free: false },
                            { city: 'כפר סילבר', price: '₪45', free: false },
                        ].map(item => (
                            <div key={item.city} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                                        <span className="text-sm">📍</span>
                                    </div>
                                    <span className="font-bold text-stone-900">{item.city}</span>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-david-green">{item.price}</span>
                                    {item.city === 'אשקלון' && <p className="text-[10px] text-stone-400">חינם מ-₪350</p>}
                                    {item.city !== 'אשקלון' && <p className="text-[10px] text-stone-400">חינם מ-₪350</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                        <span className="text-2xl">🎉</span>
                        <p className="text-sm font-bold text-emerald-800">הזמנות מעל ₪350 — משלוח חינם לכל האזורים!</p>
                    </div>
                </section>

                {/* FAQ Section */}
                <section>
                    <h2 className="font-serif text-3xl text-stone-900 mb-8">שאלות נפוצות</h2>
                    <div className="space-y-4">
                        {faqs.map((faq) => (
                            <div key={faq.question} className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                        <faq.icon className="w-5 h-5 text-david-green" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-stone-900 mb-2 text-lg leading-snug">{faq.question}</h3>
                                        <p className="text-stone-600 leading-relaxed">{faq.answer}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* WhatsApp CTA */}
                <section className="text-center p-10 bg-david-green rounded-3xl text-white">
                    <h2 className="font-serif text-3xl mb-3">יש לכם שאלה נוספת?</h2>
                    <p className="text-white/80 mb-6 font-light">אנחנו זמינים ב-WhatsApp, תמיד שמחים לעזור.</p>
                    <a
                        href="https://wa.me/972535879344"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-white text-david-green px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                        <MessageCircle className="w-5 h-5" />
                        שליחת הודעה ב-WhatsApp
                    </a>
                </section>
            </div>
        </main>
    );
}

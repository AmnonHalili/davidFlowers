import Link from 'next/link';
import { Leaf, ShieldCheck, RefreshCw, MessageCircle, Star, Droplets } from 'lucide-react';

export const metadata = {
    title: 'אחריות טריות | פרחי דוד אשקלון',
    description: 'אנחנו מתחייבים לטריות הפרחים שלנו. פרחים יומיים ישירות מהמגדל עם אחריות של 7 ימים.',
};

const guaranteePoints = [
    {
        icon: Leaf,
        title: 'פרחים יומיים',
        description: 'אנחנו מקבלים פרחים טריים כל בוקר ישירות ממגדלים ישראליים. אף זר לא עוזב את החנות לאחר יום אחד.'
    },
    {
        icon: Droplets,
        title: 'טיפול מקצועי',
        description: 'כל זר מוכן בקפידה עם חומרי טיפול המאריכים את חיי הפרח. הפרחים מקוררים עד לרגע המסירה.'
    },
    {
        icon: ShieldCheck,
        title: 'אחריות 7 ימים',
        description: 'אם הפרחים לא נשארו טריים לפחות 7 ימים בטיפול תקין — נחליף אותם ללא תשלום, ללא שאלות.'
    },
    {
        icon: RefreshCw,
        title: 'החלפה מהירה',
        description: 'שלחו לנו תמונה ב-WhatsApp ואנחנו נתאם החלפה בהקדם האפשרי — בדרך כלל תוך 24 שעות.'
    }
];

const tips = [
    { emoji: '💧', tip: 'החליפו מים כל יומיים' },
    { emoji: '✂️', tip: 'קצצו את הגבעולים בזווית של 45°' },
    { emoji: '🌡️', tip: 'שמרו הרחק ממקורות חום ושמש ישירה' },
    { emoji: '🍌', tip: 'הרחיקו מפירות (הם פולטים גז אתילן)' },
    { emoji: '🌿', tip: 'הסירו עלים שנמצאים מתחת לקו המים' },
    { emoji: '🌷', tip: 'טמפרטורת חדר מיטבית: 18–22°C' },
];

export default function FreshnessGuaranteePage() {
    return (
        <main className="bg-white min-h-screen pb-24 rtl" dir="rtl">

            {/* Hero */}
            <div className="bg-gradient-to-b from-emerald-50 to-white border-b border-emerald-100/50 pt-16 pb-12 px-6 text-center">
                <div className="w-16 h-16 bg-white border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                    <ShieldCheck className="w-8 h-8 text-david-green" strokeWidth={1.5} />
                </div>
                <h1 className="font-serif text-4xl md:text-5xl text-stone-900 mb-3">אחריות הטריות שלנו</h1>
                <p className="text-stone-500 max-w-md mx-auto text-lg font-light">
                    אנחנו לא מוכרים פרחים — אנחנו מוכרים חוויה. והחוויה מתחילה ומסתיימת בטריות.
                </p>
            </div>

            <div className="max-w-3xl mx-auto px-6 pt-16 space-y-16">

                {/* Promise Badge */}
                <div className="text-center p-10 border-2 border-dashed border-emerald-200 rounded-3xl bg-emerald-50/30">
                    <div className="text-5xl mb-4">🌸</div>
                    <h2 className="font-serif text-3xl text-stone-900 mb-3">ההתחייבות שלנו</h2>
                    <p className="text-stone-600 text-lg font-light max-w-sm mx-auto leading-relaxed">
                        אם הפרחים שלך לא יחזיקו לפחות <strong>7 ימים</strong> — נחליף אותם.
                        <br />פשוט, ברור, ללא דיון.
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-4">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
                    </div>
                </div>

                {/* 4 Pillars */}
                <section>
                    <h2 className="font-serif text-3xl text-stone-900 mb-8">איך אנחנו מבטיחים את הטריות?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {guaranteePoints.map((point) => (
                            <div key={point.title} className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
                                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4">
                                    <point.icon className="w-5 h-5 text-david-green" strokeWidth={1.5} />
                                </div>
                                <h3 className="font-bold text-stone-900 text-xl mb-2">{point.title}</h3>
                                <p className="text-stone-600 leading-relaxed font-light">{point.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Tips for customers */}
                <section>
                    <h2 className="font-serif text-3xl text-stone-900 mb-2">טיפים לשמירה על הפרחים</h2>
                    <p className="text-stone-500 mb-8">לאריכות ימים מירבית של הפרחים שלכם:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {tips.map((tip) => (
                            <div key={tip.tip} className="p-4 bg-stone-50 rounded-2xl border border-stone-100 flex items-center gap-3">
                                <span className="text-2xl shrink-0">{tip.emoji}</span>
                                <p className="text-sm font-medium text-stone-700 leading-snug">{tip.tip}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Claim process */}
                <section className="p-8 bg-amber-50 rounded-3xl border border-amber-100">
                    <h2 className="font-serif text-2xl text-stone-900 mb-5">פרחים לא תקינים? כך תפעלו:</h2>
                    <ol className="space-y-4">
                        {[
                            'צלמו את הפרחים הבעייתיים',
                            'שלחו את התמונה ב-WhatsApp עם מספר ההזמנה',
                            'אנחנו נאשר ונתאם החלפה תוך 24 שעות',
                            'קבלו זר חדש וטרי — קנס פסיכולוגי: אפס 🙂'
                        ].map((step, i) => (
                            <li key={i} className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-black text-david-green shadow-sm shrink-0 mt-0.5">
                                    {i + 1}
                                </div>
                                <p className="text-stone-700 font-medium pt-1">{step}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                {/* CTA */}
                <section className="text-center p-10 bg-david-green rounded-3xl text-white">
                    <h2 className="font-serif text-3xl mb-3">נתחיל?</h2>
                    <p className="text-white/80 mb-6 font-light">בחרו זר, ואנחנו נדאג לשאר.</p>
                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                        <Link
                            href="/shop"
                            className="bg-white text-david-green px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                        >
                            לחנות הפרחים
                        </Link>
                        <a
                            href="https://wa.me/972535879344"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 border border-white/40 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition-all"
                        >
                            <MessageCircle className="w-5 h-5" />
                            שאלה ב-WhatsApp
                        </a>
                    </div>
                </section>
            </div>
        </main>
    );
}

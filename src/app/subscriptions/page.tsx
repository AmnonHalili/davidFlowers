import Image from 'next/image';
import Link from 'next/link';
import { Check, Calendar, Truck, Heart } from 'lucide-react';
import SubscriptionConfigurator from '@/components/subscriptions/SubscriptionConfigurator';

export const metadata = {
    title: 'מנוי פרחים | דוד פרחים',
    description: 'פרחים טריים בבית באופן קבוע. מנוי גמיש ללא התחייבות.',
};

const SUBSCRIPTION_PLANS = [
    {
        id: 'sub-classic',
        name: 'קלאסי',
        price: 120,
        description: 'זר בגודל בינוני, מושלם לשולחן הסלון או לפינת האוכל.',
        features: ['פרחים טריים מהשדה', 'עיצוב משתנה כל שבוע', 'משלוח חינם באשקלון']
    },
    {
        id: 'sub-premium',
        name: 'פרימיום',
        price: 180,
        description: 'זר עשיר ומרשים, מלא בנוכחות וצבע.',
        isPopular: true,
        features: ['מגוון פרחים יוקרתי', 'עיצוב מלא ועשיר', 'משלוח חינם באשקלון', 'כולל אגרטל (במשלוח הראשון)']
    },
    {
        id: 'sub-royal',
        name: 'רויאל',
        price: 250,
        description: 'חוויה של שפע ויוקרה. הזר הכי גדול ומרשים שלנו.',
        features: ['הפרחים הכי מיוחדים', 'גודל ענק ומרשים', 'משלוח חינם VIP', 'כולל אגרטל מעוצב']
    }
];

export default function SubscriptionsPage() {
    return (
        <main className="min-h-screen bg-stone-50 rtl" dir="rtl">
            {/* Hero */}
            <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center">
                <Image
                    src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2940&auto=format&fit=crop"
                    alt="Living room with flowers"
                    fill
                    className="object-cover brightness-[0.85]"
                    priority
                />
                <div className="relative z-10 text-center text-white px-4">
                    <h1 className="font-serif text-5xl md:text-7xl mb-6">הבית תמיד פורח</h1>
                    <p className="text-xl font-light mb-8 max-w-xl mx-auto">
                        הצטרפו למנוי הפרחים שלנו ותהנו מזרים טריים ומעוצבים שיגיעו עד אליכם, בדיוק מתי שתרצו.
                    </p>
                    <a
                        href="#plans"
                        className="bg-david-green text-david-beige px-8 py-4 uppercase tracking-widest font-bold text-sm hover:bg-david-green/90 transition-colors inline-block"
                    >
                        בחרו את המנוי שלכם
                    </a>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-20 px-6 max-w-screen-xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="font-serif text-3xl md:text-4xl text-stone-900 mb-4">איך זה עובד?</h2>
                    <p className="text-stone-500 font-light">פשוט, גמיש וללא התחייבות.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-david-green">
                            <Heart className="w-8 h-8" strokeWidth={1.5} />
                        </div>
                        <h3 className="font-bold text-xl text-stone-900">1. בוחרים את הגודל</h3>
                        <p className="text-stone-500 font-light max-w-xs">
                            בחרו את גודל הזר שמתאים לחלל שלכם - מקלאסי עדין ועד רויאל ענק.
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-david-green">
                            <Calendar className="w-8 h-8" strokeWidth={1.5} />
                        </div>
                        <h3 className="font-bold text-xl text-stone-900">2. קובעים תדירות</h3>
                        <p className="text-stone-500 font-light max-w-xs">
                            כל שבוע או כל שבועיים? ביום שישי או באמצע השבוע? אתם מחליטים.
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-david-green">
                            <Truck className="w-8 h-8" strokeWidth={1.5} />
                        </div>
                        <h3 className="font-bold text-xl text-stone-900">3. אנחנו מגיעים</h3>
                        <p className="text-stone-500 font-light max-w-xs">
                            השליח שלנו יגיע אליכם עם זר טרי ומעוצב שיכניס אור ושמחה לבית.
                        </p>
                    </div>
                </div>
            </section>

            {/* Plans */}
            <section id="plans" className="py-20 bg-white px-6">
                <div className="max-w-screen-xl mx-auto">
                    <h2 className="font-serif text-3xl md:text-4xl text-stone-900 mb-16 text-center">המסלולים שלנו</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {SUBSCRIPTION_PLANS.map((plan) => (
                            <div
                                key={plan.id}
                                className={`relative border p-8 flex flex-col ${plan.isPopular ? 'border-david-green shadow-xl scale-105 bg-white z-10' : 'border-stone-200 bg-stone-50/50'}`}
                            >
                                {plan.isPopular && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-david-green text-david-beige px-4 py-1 text-xs font-bold uppercase tracking-widest">
                                        הכי נמכר
                                    </div>
                                )}
                                <h3 className="font-serif text-2xl text-stone-900 mb-2">{plan.name}</h3>
                                <div className="text-3xl font-bold text-stone-900 mb-4">
                                    ₪{plan.price}
                                    <span className="text-sm font-normal text-stone-500"> / למשלוח</span>
                                </div>
                                <p className="text-stone-500 font-light mb-8 text-sm">{plan.description}</p>

                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-stone-700">
                                            <Check className="w-5 h-5 text-david-green shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <SubscriptionConfigurator plan={plan} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}

import Image from 'next/image';
import { Truck, Clock, MapPin, ShieldCheck } from 'lucide-react';

export const metadata = {
    title: 'משלוחים | דוד פרחים',
    description: 'מדיניות משלוחים, אזורי חלוקה וזמני אספקה - דוד פרחים אשקלון.',
};

export default function DeliveriesPage() {
    return (
        <main className="bg-white min-h-screen pt-32 pb-20 rtl" dir="rtl">
            <div className="max-w-screen-xl mx-auto px-6">

                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <span className="text-xs uppercase tracking-[0.3em] text-stone-500">מדיניות אספקה</span>
                    <h1 className="font-serif text-4xl md:text-5xl text-stone-900">משלוחים ואיסוף עצמי</h1>
                    <p className="font-light text-stone-500 max-w-lg mx-auto">
                        אנו מבצעים משלוחים מבוקרים ומוקפדים כדי להבטיח שהזר יגיע אליכם רענן ומושלם.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">

                    {/* Info Columns */}
                    <div className="space-y-12">

                        {/* Section 1: Areas */}
                        <div className="flex gap-6">
                            <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center shrink-0">
                                <MapPin className="w-6 h-6 text-david-green" strokeWidth={1.5} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-serif text-xl text-stone-900">אזורי חלוקה</h3>
                                <p className="text-stone-600 font-light leading-relaxed">
                                    אנו מבצעים משלוחים כרגע <strong>בעיר אשקלון והסביבה הקרובה בלבד</strong>.
                                    <br />
                                    מושבים וקיבוצים סמוכים: בתיאום טלפוני מראש.
                                </p>
                            </div>
                        </div>

                        {/* Section 2: Cost */}
                        <div className="flex gap-6">
                            <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center shrink-0">
                                <Truck className="w-6 h-6 text-david-green" strokeWidth={1.5} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-serif text-xl text-stone-900">עלויות משלוח</h3>
                                <ul className="text-stone-600 font-light space-y-2">
                                    <li>• <strong>משלוח רגיל באשקלון:</strong> 30 ₪</li>
                                    <li>• <strong>משלוח חינם:</strong> בקנייה מעל 350 ₪</li>
                                    <li>• <strong>איסוף עצמי:</strong> חינם מהחנות (רחבעם זאבי 4, אשקלון)</li>
                                </ul>
                            </div>
                        </div>

                        {/* Section 3: Times */}
                        <div className="flex gap-6">
                            <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center shrink-0">
                                <Clock className="w-6 h-6 text-david-green" strokeWidth={1.5} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-serif text-xl text-stone-900">זמני אספקה</h3>
                                <p className="text-stone-600 font-light leading-relaxed">
                                    <strong>הזמנות עד השעה 14:00:</strong> יסופקו באותו היום (בכפוף למלאי).
                                    <br />
                                    <strong>הזמנות אחרי 14:00:</strong> יסופקו ביום העסקים הבא.
                                    <br />
                                    <strong>ימי שישי וערבי חג:</strong> משלוחים עד שעה לפני כניסת השבת/חג.
                                </p>
                            </div>
                        </div>

                        {/* Section 4: Guarantee */}
                        <div className="flex gap-6">
                            <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-6 h-6 text-david-green" strokeWidth={1.5} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-serif text-xl text-stone-900">אחריות וטריות</h3>
                                <p className="text-stone-600 font-light leading-relaxed">
                                    הפרחים שלנו נשזרים סמוך ככל האפשר למועד המשלוח.
                                    במידה וחלק מהפרחים בתמונה אינם במלאי עקב עונתיות, נחליף אותם בפרחים שווי ערך בצבעים תואמים, תוך שמירה על העיצוב המקורי.
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Image / Map Placeholder */}
                    <div className="relative h-[400px] md:h-full min-h-[500px] bg-stone-100 rounded-sm overflow-hidden">
                        <div className="absolute inset-0 bg-stone-900/10 z-10" />
                        <Image
                            src="https://images.unsplash.com/photo-1615579290074-b5f7d2427a1c?q=80&w=1000&auto=format&fit=crop"
                            alt="Delivery Driver with Flowers"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-stone-900/80 to-transparent z-20 text-white">
                            <p className="font-serif text-2xl mb-2">איסוף עצמי? נשמח לראותכם!</p>
                            <p className="font-light text-sm opacity-90">רחוב רחבעם זאבי 4, אשקלון</p>
                            <a
                                href="https://waze.com/ul?ll=31.66926,34.57149&navigate=yes"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block mt-4 text-xs font-bold uppercase tracking-widest border-b border-white pb-1 hover:text-david-green hover:border-david-green transition-colors"
                            >
                                ניווט עם Waze
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}

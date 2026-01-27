import Link from 'next/link';

export const metadata = {
    title: 'תקנון האתר ומשלוחים | דוד פרחים',
    description: 'תנאי שימוש, מדיניות ביטולים, משלוחים וזמני פעילות באתר דוד פרחים.',
};

export default function RegulationsPage() {
    return (
        <div className="min-h-screen bg-white pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-6" dir="rtl">

                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-serif text-stone-900">תקנון האתר ומשלוחים</h1>
                    <div className="w-20 h-1 bg-david-green mx-auto rounded-full" />
                </div>

                <div className="space-y-12 text-stone-700 leading-relaxed font-light">

                    {/* Intro */}
                    <p className="text-lg text-center max-w-2xl mx-auto font-serif text-david-green">
                        תנאי שימוש באתר פרחי דוד
                    </p>

                    {/* Section 1: Cancellation */}
                    <section className="bg-stone-50 p-8 rounded-xl border border-stone-100 space-y-4">
                        <h2 className="text-2xl font-serif text-stone-900 flex items-center gap-2">
                            <span className="text-david-green font-bold text-3xl">1.</span>
                            ביטול עסקה והחזר כספי
                        </h2>
                        <div className="space-y-3 mr-8">
                            <p>
                                במקרה של חרטה או שינוי דעתך לאחר ביצוע ההזמנה – אנו מבינים, וזה קורה.
                                ניתן לבטל עסקה עד 48 שעות ממועד ביצוע ההזמנה, ובלבד שהמשלוח לא יצא ממרכז ההזמנות ולא הוכן עבור הלקוח.
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-sm bg-white p-4 rounded-lg border border-stone-100">
                                <li>ביטול יבוצע רק אם ההזמנה טרם נשלחה עם שליח.</li>
                                <li>במקרה שהמוצר כבר הוכן או יצא ללקוח, לא ניתן לבטל את ההזמנה או לקבל החזר.</li>
                                <li>החזר כספי יבוצע לאמצעי התשלום שבו בוצעה העסקה, בניכוי 5% משווי העסקה, בהתאם לחוק.</li>
                                <li>לאחר ביצוע הביטול, תישלח אליך חשבונית זיכוי.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 2: Deliveries */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-serif text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                            <span className="text-david-green font-bold text-3xl">2.</span>
                            אספקה ומשלוחים
                        </h2>
                        <div className="space-y-3 mr-8">
                            <p>משלוחים מתבצעים באמצעות שליחים עד הבית או מקום העבודה.</p>
                            <p>המשלוחים נשלחים בהתאם לכתובת שצוינה בטופס ההזמנה באתר או בטלפון.</p>
                            <p>זמני האספקה מוצגים בעמוד התשלום.</p>
                            <div className="flex items-start gap-2 bg-david-beige/10 p-4 rounded-r-lg border-r-4 border-david-green">
                                <span className="text-david-green font-bold">שים לב:</span>
                                <p className="text-sm">הזמנות שיבוצעו לאחר השעה 17:00 יישלחו ביום שלמחרת (למעט אם תואם אחרת טלפונית או מול מרכז ההזמנות).</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Hours */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-serif text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                            <span className="text-david-green font-bold text-3xl">3.</span>
                            זמני הפעילות של החנות ומוקד ההזמנות
                        </h2>
                        <div className="mr-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mb-4">
                                <div className="bg-stone-50 p-4 rounded-lg flex justify-between items-center">
                                    <span className="font-bold">ראשון</span>
                                    <span>10:00 - 19:30</span>
                                </div>
                                <div className="bg-stone-50 p-4 rounded-lg flex justify-between items-center">
                                    <span className="font-bold">שני - חמישי</span>
                                    <span>09:00 - 19:30</span>
                                </div>
                                <div className="bg-stone-50 p-4 rounded-lg flex justify-between items-center">
                                    <span className="font-bold">שישי וערבי חג</span>
                                    <span>08:00 - 14:30</span>
                                </div>
                            </div>
                            <p className="text-sm text-stone-500">
                                * יש לציין שהאתר זמין ופתוח לרכישה 24/7 אך המשלוחים מבוצעים בפועל בשעות הפעילות של החנות.
                                <br />
                                * החנות אינה עובדת בשבתות, חגים ומועדי ישראל.
                            </p>
                        </div>
                    </section>

                    {/* Section 4: Terms */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-serif text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                            <span className="text-david-green font-bold text-3xl">4.</span>
                            תנאים נוספים
                        </h2>
                        <ul className="list-disc list-inside space-y-2 mr-8">
                            <li>ההזמנה באתר נעשית בצורה מאובטחת ע”י ספק הסליקה.</li>
                            <li>משלוחים שחוזרים למרכז ההזמנות עקב אי מסירה – ישלחו מחדש בתיאום נוסף. הלקוח יחויב בשנית בדמי משלוח לאותו יעד ו/או ליעד חדש בהתאם למחירון המשלוחים.</li>
                        </ul>
                    </section>

                    {/* Section 5: Copyright */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-serif text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                            <span className="text-david-green font-bold text-3xl">5.</span>
                            תמונות, עיצוב וזכויות יוצרים
                        </h2>
                        <div className="space-y-2 mr-8 text-sm bg-stone-50 p-4 rounded-lg">
                            <p>התמונות באתר הן להמחשה בלבד. ייתכן שינוי בזמני הפרחים בהתאם לזמינות וזאת תוך שמירה על הגוונים והתאמה עיצובית.</p>
                            <p className="font-bold text-stone-900">כל התמונות באתר מוגנות בזכויות יוצרים ואין להשתמש בהן ללא אישור כתוב ומראש.</p>
                        </div>
                    </section>

                </div>

                <div className="mt-16 pt-8 border-t border-stone-100 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 text-stone-400 hover:text-david-green transition-colors text-sm font-medium">
                        ← חזרה לדף הבית
                    </Link>
                </div>
            </div>
        </div>
    );
}

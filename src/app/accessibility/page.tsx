import { Phone, Mail } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'הצהרת נגישות | דוד פרחים',
    description: 'הצהרת הנגישות של אתר דוד פרחים. אנו מחויבים למתן שירות שוויוני ונגיש לכלל האוכלוסייה.',
};

export default function AccessibilityPage() {
    return (
        <div className="min-h-screen bg-white pt-24 pb-20">
            <div className="max-w-3xl mx-auto px-6" dir="rtl">

                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-serif text-stone-900">הצהרת נגישות</h1>
                    <div className="w-20 h-1 bg-david-green mx-auto rounded-full" />
                </div>

                <div className="space-y-12 text-stone-700 leading-relaxed font-light">

                    {/* Intro */}
                    <section className="space-y-4">
                        <p className="text-lg">
                            אנו רואים חשיבות רבה במתן שירות שוויוני לכלל האזרחים ובשיפור השירות הניתן לאזרחים עם מוגבלות.
                            אנו משקיעים משאבים רבים בהנגשת האתר והנכסים הדיגיטליים שלנו על מנת להפוך את שירותי החברה לזמינים יותר עבור אנשים עם מוגבלות.
                        </p>
                        <p>
                            במדינת ישראל כ-20 אחוזים מקרב האוכלוסייה הינם אנשים עם מוגבלות הזקוקים לנגישות דיגיטלית, על מנת לצרוך מידע ושירותים כללים.
                        </p>
                    </section>

                    {/* How to use */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-serif text-stone-900 border-b border-stone-100 pb-2">כיצד עוברים למצב נגיש?</h2>
                        <p>
                            באתר מוצב אייקון נגישות (בד”כ בדפנות האתר). לחיצה על האייקון מאפשרת פתיחת של תפריט הנגישות. לאחר בחירת הפונקציה המתאימה בתפריט יש להמתין לטעינת הדף ולשינוי הרצוי בתצוגה (במידת הצורך).
                        </p>
                        <p>
                            במידה ומעוניינים לבטל את הפעולה, יש ללחוץ על הפונקציה בתפריט פעם שניה. בכל מצב, ניתן לאפס הגדרות נגישות.
                        </p>
                        <ul className="list-disc list-inside space-y-2 mr-4 bg-stone-50 p-6 rounded-lg text-sm">
                            <li>התוכנה פועלת בדפדפנים הפופולריים: Chrome, Firefox, Safari, Opera.</li>
                            <li>בכפוף (תנאי יצרן) הגלישה במצב נגישות מומלצת בדפדפן כרום.</li>
                            <li>האתר מספק מבנה סמנטי עבור טכנולוגיות מסייעות ותמיכה בדפוס השימוש המקובל להפעלה עם מקלדת בעזרת מקשי החיצים, Enter ו- Esc ליציאה מתפריטים וחלונות.</li>
                        </ul>
                    </section>

                    {/* Exceptions */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-serif text-stone-900 border-b border-stone-100 pb-2">החרגות</h2>
                        <p>
                            חשוב לציין, כי למרות מאמצינו להנגיש את כלל הדפים והאלמנטים באתר, ייתכן שיתגלו חלקים או יכולות שלא הונגשו כראוי או שטרם הונגשו.
                            אנו ממשיכים במאמצים לשפר את נגישות האתר כחלק ממחויבותנו לאפשר שימוש בו עבור כלל האוכלוסייה, כולל אנשים עם מוגבלויות.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="bg-stone-50 p-8 rounded-xl border border-stone-100 space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-serif text-stone-900">יצירת קשר בנושא נגישות</h2>
                            <p>
                                במידה ונתקלתם בבעיה בנושא נגישות באתר, נשמח לקבל הערות ובקשות באמצעות פנייה לרכז הנגישות שלנו.
                                על מנת שנוכל לטפל בבעיה בדרך הטובה ביותר, אנו ממליצים מאוד לצרף פרטים מלאים ככל שניתן:
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <span className="font-bold block">פרטים מומלצים לפנייה:</span>
                                <ul className="list-disc list-inside text-stone-600">
                                    <li>תיאור הבעיה</li>
                                    <li>מהי הפעולה שניסיתם לבצע</li>
                                    <li>קישור לדף שבו גלשתם</li>
                                    <li>סוג הדפדפן וגרסתו</li>
                                    <li>מערכת הפעלה</li>
                                    <li>סוג הטכנולוגיה המסייעת</li>
                                </ul>
                            </div>

                            <div className="space-y-4 md:border-r md:border-stone-200 md:pr-6 md:mr-6 rtl:md:border-l-0 rtl:md:border-r rtl:md:pr-6 rtl:md:mr-6">
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg text-david-green">פרחי ינאי</h3>
                                    <p className="text-xs text-stone-500">
                                        תעשה ככל יכולה על מנת להנגיש את האתר בצורה המיטבית ולענות לפניות בצורה המקצועית והמהירה ביותר.
                                    </p>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center shrink-0">
                                            <span className="font-serif font-bold text-stone-400">ר</span>
                                        </div>
                                        <div>
                                            <div className="text-xs text-stone-400">רכז נגישות</div>
                                            <div className="font-medium">עמירם</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center shrink-0">
                                            <Phone className="w-4 h-4 text-stone-600" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-stone-400">טלפון</div>
                                            <a href="tel:0537286290" className="font-medium hover:text-david-green transition-colors dir-ltr">
                                                053-728-6290
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center shrink-0">
                                            <Mail className="w-4 h-4 text-stone-600" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-stone-400">אימייל</div>
                                            <a href="mailto:amiram2002f@gmail.com" className="font-medium hover:text-david-green transition-colors">
                                                amiram2002f@gmail.com
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
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

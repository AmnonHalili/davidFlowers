import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';

export const metadata = {
    title: 'מדיניות פרטיות | דוד פרחים',
    description: 'מדיניות הפרטיות של אתר דוד פרחים - איסוף מידע, שימוש בנתונים וזכויות המשתמש.',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-white pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-6" dir="rtl">

                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-serif text-stone-900">מדיניות פרטיות</h1>
                    <div className="w-20 h-1 bg-david-green mx-auto rounded-full" />
                </div>

                <div className="space-y-12 text-stone-700 leading-relaxed font-light">

                    {/* Intro */}
                    <div className="bg-stone-50 p-6 rounded-xl border border-stone-100 text-sm space-y-2">
                        <p className="font-bold text-stone-900">פרטי בעל האתר ובעל השליטה במאגר:</p>
                        <p>עמירם פלאום</p>
                        <p>כתובת עסק: אחבעם זאבי 4, אשקלון</p>
                        <p>טלפון: 053-587-9344</p>
                        <p>כתובת הדומיין: https://davidflowers.co.il/</p>
                        <p>כתובת דוא”ל לפניות בנושא פרטיות וזכויות: amiram2002f@gmail.com</p>
                    </div>

                    {/* Section 1: General */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-serif text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                            <span className="text-david-green font-bold text-3xl">1.</span>
                            כללי
                        </h2>
                        <ul className="list-disc list-inside space-y-2 mr-4">
                            <li>אנו מכבדים את פרטיות המשתמשים באתר שלנו. לכן, החלטנו לפרסם מדיניות פרטיות ברורה ושקופה, ואנו מתחייבים לפעול לפיה.</li>
                            <li>מטרת מסמך זה היא להסביר כיצד אנו מתנהלים בנוגע לפרטיות המשתמשים. בין היתר, נסביר איזה מידע נאסף, כיצד אנו משתמשים בו, ואילו זכויות עומדות לרשותך בנוגע למידע זה.</li>
                            <li>מדיניות פרטיות זו מותאמת להוראות סעיף 11 לחוק הגנת הפרטיות, התשמ”א-1981.</li>
                            <li>מסמך זה מנוסח בלשון זכר מטעמי נוחות בלבד, אך הוא מיועד לכל המגדרים.</li>
                            <li>אנו ממליצים לקרוא בעיון את מדיניות הפרטיות. המשך השימוש באתר מהווה אישור לכך שקראת, הבנת ואתה מסכים למדיניות זו. אם אינך מעוניין שהמידע שלך ייאסף בהתאם למדיניות זו, אנא הימנע משימוש באתר.</li>
                            <li>אין חובה חוקית למסור את פרטיך, אך שים לב כי מסירת מידע מסוימת עשויה להיות תנאי לגישה מלאה לתכני האתר, לשירותים שאנו מציעים, או לביצוע רכישות והזמנות.</li>
                        </ul>
                    </section>

                    {/* Section 2: Info Collected */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-serif text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                            <span className="text-david-green font-bold text-3xl">2.</span>
                            המידע שאנו אוספים באתר
                        </h2>
                        <div className="space-y-4 mr-4">
                            <div>
                                <h3 className="font-bold text-lg mb-2">2.1. בעת השימוש בשירותי האתר נאסף מידע על אודותיך, חלקו מזהה אותך אישית:</h3>
                                <ul className="list-disc list-inside space-y-1 text-sm bg-stone-50 p-4 rounded-lg">
                                    <li>פרטי יצירת קשר, כגון שמך, כתובת דואר אלקטרוני, מספר טלפון; כתובת;</li>
                                    <li>מידע שהעברת במסגרת התכתבויות ו/או תקשורת עם האתר;</li>
                                    <li>מידע שהעברת על ההצעות והשירותים שעניינו אותך;</li>
                                    <li>הקלטות שיחה;</li>
                                    <li>רכישות שביצעת באתר;</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2">2.2. חלק מהמידע שנאסף אינו מזהה אישית, למשל:</h3>
                                <ul className="list-disc list-inside space-y-1 text-sm bg-stone-50 p-4 rounded-lg">
                                    <li>סוג הדפדפן שממנו אתה צופה באתר;</li>
                                    <li>סוג המכשיר שממנו אתה צופה באתר;</li>
                                    <li>אופן השימוש באתר ונתוני גלישה – משך זמן שימוש בכל עמוד, באיזה עמודים ביקרת, פעולות שבוצעו באתר;</li>
                                    <li>מוצרים שהתעניינת בהם;</li>
                                    <li>התאמות משתמש כגון שפה מועדפת;</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Collection Method */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-serif text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                            <span className="text-david-green font-bold text-3xl">3.</span>
                            איסוף המידע
                        </h2>
                        <p className="mr-8">
                            הנתונים שיאספו וכן תכנים שהמשתמש מעלה ו/או משתף ו/או יוצר באתר, יישמרו ברשות בעל האתר. מסדי הנתונים מאוחסנים בשרתי אחסון. המשתמש באתר מצהיר כי הוא מסכים לשמירת מידע בשרתים אלו, אשר עשויים להיות בישראל או בחו”ל.
                        </p>
                    </section>

                    {/* Section 4: Purpose */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-serif text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                            <span className="text-david-green font-bold text-3xl">4.</span>
                            מטרות איסוף ושימוש במידע
                        </h2>
                        <div className="mr-8 space-y-2">
                            <p>השימוש במידע שנאסף, ייעשה בהתאם למדיניות פרטיות זו, או בהתאם להוראות כל דין החל, על מנת –</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>מתן שירותים כמפורט באתר;</li>
                                <li>לשפר את השירותים והתכנים המוצעים באתר, לשנותם או לבטלם;</li>
                                <li>שירות לקוחות ומתן מענה לפניות;</li>
                                <li>לאפשר רכישות באתר;</li>
                                <li>פרסום ושיווק מוצרים ו/או שירותים;</li>
                                <li>על מנת להתאים את המודעות שיוצגו בעת ביקורך באתר לתחומי העניין שלך;</li>
                                <li>לצורך אכיפת כללים ונהלים באתר כפי שהם מופיעים בתנאי השימוש;</li>
                                <li>למטרות בקרה – לרבות אבטחה ומניעת הונאות, זיהוי שימוש לא חוקי באתר;</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 5: Legal Basis */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-serif text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                            <span className="text-david-green font-bold text-3xl">5.</span>
                            הבסיס החוקי לאיסוף המידע
                        </h2>
                        <div className="mr-8">
                            <p>אנו נעבד את המידע האישי שלך, לרבות מידע רגיש, רק כאשר יש לנו בסיס חוקי לעשות זאת. הבסיסים המשפטיים לעיבוד הינם:</p>
                            <ul className="list-disc list-inside mt-2">
                                <li>קיבלנו את הסכמתך המפורשת לעיבוד.</li>
                                <li className="list-none font-bold py-1">ו/או</li>
                                <li>עיבוד המידע מותר לפי דין.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 6: Third Party */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-serif text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                            <span className="text-david-green font-bold text-3xl">6.</span>
                            מסירת מידע לצד שלישי
                        </h2>
                        <div className="mr-8 space-y-4">
                            <p>בעל האתר לא יעביר לצדדים שלישיים את פרטיך האישיים והמידע שנאסף על פעילותך באתר אלא במקרים המפורטים להלן:</p>
                            <p>חלק מהשירותים באתר מסופקים על ידי צדדים שלישיים, להם יש תנאי שימוש ומדיניות פרטיות נפרדת:</p>
                            <ul className="list-disc list-inside space-y-1 text-sm bg-stone-50 p-4 rounded-lg">
                                <li>חלק מהמידע מועבר לספק אשר מספק שירותי אחסון לאתר;</li>
                                <li>שם וכתובת המייל מועברים לספק מערכת הדיוור של האתר;</li>
                                <li>שם וכתובת מועברים לחברת שליחויות;</li>
                                <li>הקלטת שיחה – עיבוד ואחסון על ידי הספק;</li>
                                <li>מידע אודות השימוש והפעילות שלך באתר, יעבור לפלטפורמות שיווק כגון META; GOOGLE באמצעות קבצי COOKIES ו/או פיקסלים. כמו כן, יתכן שהאתר יעביר לצדדים שלישיים מידע סטטיסטי כללי בלבד, שאינו אישי או פרטי, לגבי השימוש באתר, כגון המספר הכולל של המבקרים באתר זה ובכל עמוד של האתר וכן שמות הדומיין של נותני שירות האינטרנט של המבקרים באתר;</li>
                                <li>תקשורת באמצעות וואטסאפ כפופה למדיניות הפרטיות של וואטסאפ.</li>
                                <li>במקרה של מחלוקת משפטית בינך לבין בית העסק שתחייב את חשיפת פרטיך;</li>
                                <li>אם תבצע באתר פעולות המנוגדות לחוק;</li>
                                <li>אם יתקבל צו בית משפט המורה למסור את פרטיך או מידע על אודותיך לצד שלישי;</li>
                                <li>העברות בעלות עסקיות, מיזוגים וכיוצא בזה: במקרה של מיזוג, רכישה או העברה של נכסים, המידע האישי שלך עשוי להיות מועבר לצד שלישי כחלק מהעסקה, בתנאי שהתאגיד הנעבר יקבל על עצמו את הוראות מדיניות פרטיות זו;</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 7: Ads */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-serif text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                            <span className="text-david-green font-bold text-3xl">7.</span>
                            פרסומות של צדדים שלישיים
                        </h2>
                        <p className="mr-8">
                            בעל האתר רשאי להתיר לחברות אחרות לנהל את מערך הפרסומות באתר. המודעות שבהן אתה צופה בעת השימוש מגיעות ממחשביהן של אותן חברות.
                        </p>
                    </section>

                    {/* Section 8: Security */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-serif text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                            <span className="text-david-green font-bold text-3xl">8.</span>
                            אבטחת מידע
                        </h2>
                        <p className="mr-8">
                            באתר מיושמות מערכות ונהלים עדכניים לאבטחת מידע. בעוד שמערכות ונהלים אלה מצמצמים את הסיכונים לחדירה בלתי-מורשית, אין הם מעניקים בטחון מוחלט. לכן, בעל האתר לא מתחייב שהאתר ושירותיו יהיו חסינים באופן מוחלט מפני גישה בלתי-מורשית למידע המאוחסן בהם והמשתמש מצהיר כי הוא מודע ומסכים לכך.
                        </p>
                    </section>

                    {/* Section 9: Rights */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-serif text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                            <span className="text-david-green font-bold text-3xl">9.</span>
                            זכויות נושא המידע
                        </h2>
                        <div className="mr-8 space-y-2">
                            <p><strong>9.1. זכות העיון</strong> – על-פי חוק הגנת הפרטיות, התשמ”א – 1981, כל אדם זכאי לעיין במידע על אודותיו, המוחזק במאגר מידע.</p>
                            <p><strong>9.2. זכות לתיקון מידע</strong> – אדם שעיין במידע שעליו ומצא כי אינו נכון, שלם, ברור או מעודכן, רשאי לפנות לבעל מאגר המידע בבקשה לתקן את המידע או למוחקו.</p>
                            <p><strong>9.3. פניות בנושאי זכויות</strong> יש להפנות בדרכי יצירת הקשר הרשומות מעלה.</p>
                        </div>
                    </section>

                    {/* Section 10: Reporting */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-serif text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                            <span className="text-david-green font-bold text-3xl">10.</span>
                            דיווח על פגיעה בפרטיות
                        </h2>
                        <p className="mr-8">
                            אם אתה סבור כי פרטיותך נפגעה במסגרת או בזיקה לפעילות האתר, אנא פנה לבעל האתר ופרט בפנייתך את נסיבות הפגיעה כפי שאתה רואה אותה. כמו כן, אם יש לך שאלות או חששות בנוגע לעיבוד המידע האישי שלך או שתרצה לממש את זכויותיך, בעל האתר יענה תוך זמן סביר לפניותיך ויספק לך את המידע הדרוש לך. ניתן לפנות לבעל האתר באמצעות בדרכי יצירת הקשר הרשומות בראשית מסמך זה.
                        </p>
                    </section>

                    {/* Section 11: Changes */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-serif text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                            <span className="text-david-green font-bold text-3xl">11.</span>
                            שינוים במדיניות הפרטיות
                        </h2>
                        <p className="mr-8">
                            אנו נסקור ונעדכן באופן קבוע את מדיניות הפרטיות שלנו כדי להבטיח שהיא משקפת את נהלי הטיפול הנוכחיים שלנו בנתונים. כל העדכונים יימסרו לך בבירור, ואנו נקבל את הסכמתך ככל ויידרש על פי דין.
                        </p>
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

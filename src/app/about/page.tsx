import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, Sun } from 'lucide-react';

export const metadata = {
    title: 'אודות |פרחי דוד',
    description: 'הסיפור של פרחי דוד - חנות הפרחים האיכותית באשקלון.',
};

export default function AboutPage() {
    return (
        <main className="bg-white min-h-screen pt-8 pb-20 rtl" dir="rtl">
            {/* Hero Section */}
            <section className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
                <Image
                    src="https://images.unsplash.com/photo-1507290439931-a861b5a38200?q=80&w=2832&auto=format&fit=crop"
                    alt="Flower Workshop"
                    fill
                    className="object-cover brightness-[0.7]"
                    priority
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
                    <span className="text-sm md:text-base uppercase tracking-[0.3em] mb-4 text-white/90">הסיפור שלנו</span>
                    <h1 className="font-serif text-5xl md:text-7xl mb-6">סיפור של אהבה ופריחה</h1>
                    <p className="max-w-xl text-lg md:text-xl font-light leading-relaxed text-white/90">
                        מאז ועד היום, אנו שוזרים רגעים של אושר לזרים מרגשים. אהבה לפרחים היא השפה שלנו.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="max-w-screen-xl mx-auto px-6 py-20 md:py-32">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
                    {/* Text Column */}
                    <div className="space-y-8">
                        <h2 className="font-serif text-4xl md:text-5xl text-stone-900 leading-tight">
                            פרחים זה לא רק מקצוע,<br />זו מסורת.
                        </h2>
                        <div className="space-y-6 text-stone-600 font-light leading-relaxed text-lg">
                            <p>
                                "דוד פרחים" הוא מוסד ותיק ומוכר באשקלון, שנולד מתוך תשוקה אמיתית ליופי שבטבע.
                                לאורך השנים, אנו מלווים את תושבי העיר והסביבה ברגעים הכי יפים ומרגשים של חייהם - מימי הולדת וחגיגות משפחתיות, ועד הצעות נישואין וחתונות.
                            </p>
                            <p>
                                כל זר שיוצא מדלת החנות שלנו נשזר בקפידה, במחשבה ובאהבה. אנחנו מאמינים שפרחים הם הדרך היפה ביותר להביע רגש, ולכן אנחנו לא מתפשרים על פחות מהטוב ביותר.
                            </p>
                            <p>
                                החנות שלנו, הממוקמת ברחוב רחבעם זאבי 4 באשקלון, היא בית של צבעים וריחות, ואנחנו מזמינים אתכם להיכנס ולהרגיש את הקסם.
                            </p>
                        </div>
                        <div className="pt-4">
                            <Image
                                src="/David-Logo-removebg-preview.png"
                                alt="David Flowers Signature"
                                width={150}
                                height={60}
                                className="opacity-80"
                            />
                        </div>
                    </div>

                    {/* Image Grid Column */}
                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-4 md:space-y-6 mt-12 md:mt-24">
                            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm">
                                <Image
                                    src="https://images.unsplash.com/photo-1562690868-60bbe7293e94?q=80&w=1000&auto=format&fit=crop"
                                    alt="Fresh Flowers"
                                    fill
                                    className="object-cover hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                            <div className="relative aspect-square w-full overflow-hidden rounded-sm">
                                <Image
                                    src="https://images.unsplash.com/photo-1582794543139-8ac92a9abf30?q=80&w=1000&auto=format&fit=crop"
                                    alt="Bouquet Detail"
                                    fill
                                    className="object-cover hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                        </div>
                        <div className="space-y-4 md:space-y-6">
                            <div className="relative aspect-square w-full overflow-hidden rounded-sm">
                                <Image
                                    src="https://images.unsplash.com/photo-1599818466635-188849b3806a?q=80&w=1000&auto=format&fit=crop"
                                    alt="Florist at work"
                                    fill
                                    className="object-cover hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm">
                                <Image
                                    src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=1000&auto=format&fit=crop"
                                    alt="Beautiful Arrangement"
                                    fill
                                    className="object-cover hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="bg-stone-50 py-20 md:py-28 text-center px-6">
                <div className="max-w-screen-xl mx-auto">
                    <span className="text-xs uppercase tracking-[0.2em] text-stone-500 block mb-12">הערכים שלנו</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Value 1 */}
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 text-david-green">
                                <Sun className="w-8 h-8" strokeWidth={1} />
                            </div>
                            <h3 className="font-serif text-2xl text-stone-900">טריות ללא פשרות</h3>
                            <p className="text-stone-600 font-light max-w-xs mx-auto">
                                אנחנו מקבלים פרחים טריים מדי יום, הישר מהמגדלים הטובים ביותר בארץ, כדי להבטיח שהזר שלכם יחזיק מעמד לאורך זמן.
                            </p>
                        </div>

                        {/* Value 2 */}
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 text-david-green">
                                <Star className="w-8 h-8" strokeWidth={1} />
                            </div>
                            <h3 className="font-serif text-2xl text-stone-900">אמנות השזירה</h3>
                            <p className="text-stone-600 font-light max-w-xs mx-auto">
                                כל זר הוא יצירת אמנות בפני עצמה. השוזרים שלנו בעלי ניסיון רב ועין ייחודית לעיצוב ושילובי צבעים מרהיבים.
                            </p>
                        </div>

                        {/* Value 3 */}
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 text-david-green">
                                <Heart className="w-8 h-8" strokeWidth={1} />
                            </div>
                            <h3 className="font-serif text-2xl text-stone-900">שירות מהלב</h3>
                            <p className="text-stone-600 font-light max-w-xs mx-auto">
                                אנחנו כאן בשבילכם, לכל שאלה, התייעצות או בקשה מיוחדת. היחס האישי הוא חלק בלתי נפרד מהחוויה אצלנו.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Visit Us / CTA Section */}
            <section className="py-20 md:py-32 px-6">
                <div className="max-w-4xl mx-auto bg-david-green text-david-beige p-12 md:p-20 text-center rounded-sm relative overflow-hidden">
                    {/* Background Pattern Hint */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                            <pattern id="pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                <circle cx="2" cy="2" r="1" fill="currentColor" />
                            </pattern>
                            <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern)" />
                        </svg>
                    </div>

                    <div className="relative z-10 space-y-8">
                        <h2 className="font-serif text-4xl md:text-5xl">בואו לבקר אותנו</h2>
                        <p className="text-lg font-light max-w-lg mx-auto text-david-beige/90">
                            אנחנו מחכים לכם בחנות עם חיוך וים של פרחים.
                            <br />
                            רחוב רחבעם זאבי 4, אשקלון.
                        </p>
                        <div className="pt-4 flex flex-col md:flex-row gap-4 justify-center">
                            <Link
                                href="/shop"
                                className="bg-david-beige text-david-green px-10 py-4 uppercase tracking-widest font-bold text-xs hover:bg-white transition-colors"
                            >
                                לקטלוג המשלוחים
                            </Link>
                            <a
                                href="https://waze.com/ul?q=%D7%A8%D7%97%D7%91%D7%A2%D7%9D%20%D7%96%D7%90%D7%91%D7%99%204%2C%20%D7%90%D7%A9%D7%A7%D7%9C%D7%95%D7%9F&navigate=yes"
                                target="_blank"
                                rel="noreferrer"
                                className="border border-david-beige text-david-beige px-10 py-4 uppercase tracking-widest font-bold text-xs hover:bg-david-beige/10 transition-colors"
                            >
                                ניווט לחנות
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

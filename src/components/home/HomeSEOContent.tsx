'use client';

import { motion } from 'framer-motion';
import { MapPin, Truck, Sparkles, Heart } from 'lucide-react';

export default function HomeSEOContent() {
    return (
        <section className="bg-white py-20 px-6 border-t border-stone-100">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                
                {/* Text Content */}
                <div className="space-y-8 text-right" dir="rtl">
                    <div className="space-y-4">
                        <h2 className="font-serif text-3xl md:text-5xl text-david-green leading-tight">
                            פרחי דוד אשקלון <br />
                            <span className="text-stone-400 font-light text-2xl md:text-3xl italic">הבית שלכם למשלוחי פרחים ועיצוב</span>
                        </h2>
                        <div className="w-20 h-1 bg-david-green/20 rounded-full" />
                    </div>

                    <div className="space-y-6 text-stone-600 font-light leading-relaxed text-lg">
                        <p>
                            מחפשים <strong>משלוח פרחים באשקלון</strong> שיעשה את ההבדל? ברוכים הבאים ל"פרחי דוד" - חנות הבוטיק הוותיקה שהפכה לסמל של איכות, טריות ואמנות השזירה בעיר. אנו מתמחים ביצירת זרי פרחים מעוצבים, סידורים יוקרתיים ועציצים שמביאים חיים לכל בית.
                        </p>
                        <p>
                            בזכות הניסיון הרב והאהבה הגדולה שלנו לעולם הפרחים, אנו מקפידים על בחירה ידנית של כל פרח ופרח ישירות מהמגדלים המובילים בארץ. התוצאה? זרים שמחזיקים מעמד לאורך זמן ומפיצים ריח משכר.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                        <div className="flex gap-4 items-start">
                            <div className="bg-david-green/5 p-3 rounded-full text-david-green">
                                <Truck className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-stone-900 text-sm mb-1">משלוחים מהירים</h4>
                                <p className="text-xs text-stone-500 leading-relaxed">משלוח פרחים באשקלון מהיום להיום, כולל באר גנים, ניצן ומושבי הסביבה.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="bg-david-green/5 p-3 rounded-full text-david-green">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-stone-900 text-sm mb-1">טריות מובטחת</h4>
                                <p className="text-xs text-stone-500 leading-relaxed">אנו מתחייבים ל-5 ימי טריות לפחות על כל זר שיוצא מהחנות שלנו.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="bg-david-green/5 p-3 rounded-full text-david-green">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-stone-900 text-sm mb-1">מיקום מרכזי</h4>
                                <p className="text-xs text-stone-500 leading-relaxed">בקרו אותנו במתחם האייקון, רחבעם זאבי 4, אשקלון, לחוויה של ריחות וצבעים.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="bg-david-green/5 p-3 rounded-full text-david-green">
                                <Heart className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-stone-900 text-sm mb-1">שירות אישי</h4>
                                <p className="text-xs text-stone-500 leading-relaxed">צוות השוזרים המקצועי שלנו כאן כדי להתאים לכם את הזר המושלם לכל אירוע.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative Visual Element */}
                <div className="relative hidden lg:block">
                    <div className="absolute inset-0 bg-david-green/5 rounded-[40px] -rotate-3 scale-105" />
                    <div className="relative aspect-square overflow-hidden rounded-[40px] shadow-2xl border border-white/50">
                        <img 
                            src="/hero-bg.jpg" 
                            alt="פרחי דוד - שזירה אמנותית באשקלון" 
                            className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent" />
                    </div>
                </div>
            </div>
        </section>
    );
}

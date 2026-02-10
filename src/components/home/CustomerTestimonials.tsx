'use client';

import { motion } from 'framer-motion';
import { Star, Quote, CheckCircle2, User } from 'lucide-react';


const TESTIMONIALS = [
    {
        id: 1,
        name: 'מיכל כהן',
        location: 'אשקלון',
        text: 'הזר שקיבלתי היה פשוט מרהיב, בדיוק כמו בתמונה! השירות היה מהיר ואדיב. ממליצה בחום לכל מי שרוצה איכות.',
        rating: 5
    },
    {
        id: 2,
        name: 'דוד לוי',
        location: 'אשקלון',
        text: 'הפרחים הגיעו טריים מאוד והחזיקו מעמד שבועיים. תודה רבה על השירות המקצועי והדיוק בשעות המשלוח.',
        rating: 5
    },
    {
        id: 3,
        name: 'יוסי מזרחי',
        location: 'אשקלון',
        text: 'הזמנתי זר ליום ההולדת של אשתי והיא הייתה בעננים. העיצוב היה יוקרתי ומיוחד, רואים שיש כאן יד של אומן.',
        rating: 5
    }
];

export default function CustomerTestimonials() {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="inline-block px-4 py-1.5 bg-david-green/5 border border-david-green/10 rounded-full text-david-green text-[10px] uppercase tracking-[0.2em] font-bold"
                    >
                        Social Proof
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl md:text-5xl font-serif text-stone-900"
                    >
                        מה הלקוחות שלנו אומרים
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-stone-500 font-light max-w-lg mx-auto"
                    >
                        אנחנו גאים להיות חלק מהרגעים המיוחדים שלכם. הנה כמה מילים מהלקוחות שזכינו לשמח.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="group relative bg-[#FAFAFA] p-8 md:p-10 rounded-3xl border border-stone-100 hover:border-david-green/20 hover:bg-white transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)]"
                        >
                            <Quote className="absolute top-8 right-8 w-10 h-10 text-david-green/5 group-hover:text-david-green/10 transition-colors" />

                            <div className="flex gap-1 mb-6">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                ))}
                            </div>

                            <p className="text-stone-700 font-light leading-relaxed mb-8 relative z-10">
                                "{testimonial.text}"
                            </p>

                            <div className="flex items-center gap-4 mt-auto border-t border-stone-100 pt-6">
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <h4 className="font-bold text-stone-900 text-sm">{testimonial.name}</h4>
                                        <CheckCircle2 className="w-3.5 h-3.5 text-david-green" />
                                    </div>
                                    <p className="text-[11px] text-stone-400 uppercase tracking-widest">{testimonial.location} • לקוח/ה מאומת/ת</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="mt-20 pt-12 border-t border-stone-100 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold font-serif">4.9/5</span>
                        <div className="text-[10px] leading-tight font-bold uppercase tracking-widest text-stone-900">
                            דירוג ממוצע <br /> בגוגל
                        </div>
                    </div>
                    <div className="w-[1px] h-8 bg-stone-200 hidden md:block" />
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold font-serif">100%</span>
                        <div className="text-[10px] leading-tight font-bold uppercase tracking-widest text-stone-900">
                            טריות <br /> מובטחת
                        </div>
                    </div>
                    <div className="w-[1px] h-8 bg-stone-200 hidden md:block" />
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold font-serif">10k+</span>
                        <div className="text-[10px] leading-tight font-bold uppercase tracking-widest text-stone-900">
                            לקוחות <br /> מרוצים
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

'use client';

import { motion } from 'framer-motion';

const trustItems = [
    {
        emoji: '🌸',
        title: 'פרחים טריים יומיים',
        subtitle: 'ישירות מהמגדל לבית'
    },
    {
        emoji: '🚗',
        title: 'משלוח מהיר',
        subtitle: 'באשקלון והסביבה'
    },
    {
        emoji: '⭐',
        title: '7 שנות ניסיון',
        subtitle: 'אלפי לקוחות מרוצים'
    },
    {
        emoji: '💳',
        title: 'תשלום מאובטח',
        subtitle: 'חשבונית מס מיד'
    },
    {
        emoji: '🔄',
        title: 'אחריות טריות',
        subtitle: '7 ימים או להחליף'
    }
];

export default function TrustBar() {
    return (
        <div className="relative overflow-hidden bg-white border-b border-stone-100" dir="rtl">
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/40 via-white to-emerald-50/40 pointer-events-none" />

            <div className="relative max-w-6xl mx-auto px-4 py-4 md:py-5">
                {/* Mobile: horizontal scroll */}
                <div className="flex gap-1 md:gap-0 overflow-x-auto scrollbar-hide md:justify-between md:overflow-visible -mx-4 px-4 md:mx-0 md:px-0">
                    {trustItems.map((item, index) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08, duration: 0.4 }}
                            className="shrink-0 md:flex-1 flex flex-col md:flex-row items-center md:justify-center gap-2 md:gap-3 px-4 md:px-3 py-2 md:border-l md:border-stone-100 first:border-none group"
                        >
                            {/* Icon */}
                            <div className="w-10 h-10 md:w-9 md:h-9 bg-emerald-50 rounded-full flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors duration-200">
                                <span className="text-lg md:text-base leading-none">{item.emoji}</span>
                            </div>

                            {/* Text */}
                            <div className="text-center md:text-right">
                                <p className="text-xs font-bold text-stone-800 whitespace-nowrap leading-tight">{item.title}</p>
                                <p className="text-[10px] text-stone-400 whitespace-nowrap leading-tight hidden md:block">{item.subtitle}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

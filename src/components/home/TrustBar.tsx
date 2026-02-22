'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const trustItems = [
    {
        emoji: '🌸',
        title: 'פרחים טריים יומיים',
        subtitle: 'ישירות מהמגדל',
        href: '/freshness-guarantee'
    },
    {
        emoji: '🚗',
        title: 'משלוח מהיר',
        subtitle: 'אשקלון והסביבה',
        href: '/shipping'
    },
    {
        emoji: '⭐',
        title: '7 שנות ניסיון',
        subtitle: 'אלפי לקוחות מרוצים',
        href: '/about'
    },
    {
        emoji: '💳',
        title: 'תשלום מאובטח',
        subtitle: 'חשבונית מס מיידית',
        href: null
    },
    {
        emoji: '🔄',
        title: 'אחריות טריות',
        subtitle: '7 ימים — מובטח',
        href: '/freshness-guarantee'
    },
];

export default function TrustBar() {
    return (
        <div className="bg-stone-50 border-b border-stone-200" dir="rtl">
            <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-5 divide-x divide-x-reverse divide-stone-200">
                    {trustItems.map((item, index) => {
                        const content = (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.06 }}
                                className="group flex flex-col items-center justify-center gap-1 py-3 px-2 text-center hover:bg-white transition-colors cursor-pointer"
                            >
                                <span className="text-xl leading-none">{item.emoji}</span>
                                <p className="text-[11px] font-bold text-stone-800 leading-tight">{item.title}</p>
                                <p className="text-[9px] text-stone-400 leading-tight hidden md:block">{item.subtitle}</p>
                            </motion.div>
                        );

                        return item.href ? (
                            <Link key={item.title} href={item.href}>{content}</Link>
                        ) : (
                            <div key={item.title}>{content}</div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

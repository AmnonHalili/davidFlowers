'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const categories = [
    { name: 'זרי פרחים', image: '/images/mega-menu/bouquets.jpg', href: '/shop/bouquets' },
    { name: 'עציצים', image: '/images/mega-menu/plants.jpg', href: '/shop/plants' },
    { name: 'כלים ואגרטלים', image: '/images/mega-menu/vases.jpg', href: '/shop/vases' },
];

const occasions = [
    { name: 'מתנות ומתוקים', href: '/shop/gifts' },
    { name: 'שוקולדים - מארזי שוקולדים', href: '/shop/chocolates' },
    {
        name: 'חתן וכלה',
        href: '/shop/wedding',
        description: 'סידורי רכב, זרי כלה ועוד'
    },
];

const featured = [
    {
        title: 'אירועים עסקיים',
        linkText: 'הזמן עכשיו',
        href: '/events/corporate',
        image: '/images/mega-menu/featured-1.jpg',
    },
    {
        title: 'מנוי פרחים חודשי',
        linkText: 'הצטרפו למועדון',
        href: '/subscriptions',
        image: '/images/mega-menu/featured-2.jpg',
    },
];

export default function MegaMenu({ isOpen, onMouseEnter, onMouseLeave }: { isOpen: boolean, onMouseEnter: () => void, onMouseLeave: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute top-full left-0 right-0 bg-david-beige border-t border-[#DCDBCF] shadow-lg z-40 overflow-hidden ${!isOpen ? 'pointer-events-none' : ''}`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="max-w-screen-2xl mx-auto px-6 py-12">
                <div className="grid grid-cols-4 gap-8 rtl" dir="rtl">

                    {/* Column 1: Visual Categories */}
                    <div className="space-y-6">
                        <h3 className="font-serif text-xl text-david-green mb-4">קטגוריות</h3>
                        <div className="space-y-4">
                            {categories.map((cat) => (
                                <Link key={cat.name} href={cat.href} className="flex items-center gap-4 group">
                                    <div className="relative w-16 h-16 bg-white overflow-hidden rounded-sm shadow-sm">
                                        {/* Placeholder image if src missing */}
                                        <div className="absolute inset-0 bg-stone-200 flex items-center justify-center text-xs text-stone-400">IMG</div>
                                        {/* <Image src={cat.image} alt={cat.name} fill className="object-cover group-hover:scale-105 transition-transform" /> */}
                                    </div>
                                    <span className="text-david-green font-medium group-hover:underline decoration-david-green/50 underline-offset-4 transition-all">
                                        {cat.name}
                                    </span>
                                </Link>
                            ))}
                        </div>
                        <Link href="/shop" className="inline-block mt-4 text-sm text-david-green/70 underline decoration-1 underline-offset-4 hover:text-david-green">
                            לכל המוצרים
                        </Link>
                    </div>

                    {/* Column 2: Occasions (Text List) */}
                    <div className="space-y-6 border-r border-[#DCDBCF] pr-8">
                        <h3 className="font-serif text-xl text-david-green mb-4">אירועים ומתנות</h3>
                        <ul className="space-y-4">
                            {occasions.map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="block group">
                                        <span className="text-david-green text-lg group-hover:translate-x-1 transition-transform inline-block">
                                            {item.name}
                                        </span>
                                        {item.description && (
                                            <p className="text-sm text-david-green/60 mt-1">{item.description}</p>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <Link href="/shop" className="inline-block mt-8 text-sm text-david-green/70 underline decoration-1 underline-offset-4 hover:text-david-green">
                            הכל לחנות
                        </Link>
                    </div>

                    {/* Column 3: Featured 1 */}
                    <div className="relative h-[300px] group cursor-pointer border-r border-[#DCDBCF] pr-8">
                        <Link href={featured[0].href} className="block h-full relative overflow-hidden">
                            <div className="absolute inset-0 bg-stone-300">
                                {/* Placeholder for featured image */}
                                <div className="absolute inset-0 flex items-center justify-center text-stone-500">Feature Image 1</div>
                                {/* <Image src={featured[0].image} alt={featured[0].title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" /> */}
                            </div>
                            <div className="absolute bottom-6 right-6">
                                <h4 className="text-2xl font-serif text-david-green mb-2 bg-david-beige/80 px-2 py-1 inline-block backdrop-blur-sm">{featured[0].title}</h4>
                                <span className="block text-david-green font-medium underline decoration-1 underline-offset-4">{featured[0].linkText}</span>
                            </div>
                        </Link>
                    </div>

                    {/* Column 4: Featured 2 */}
                    <div className="relative h-[300px] group cursor-pointer border-r border-[#DCDBCF] pr-8">
                        <Link href={featured[1].href} className="block h-full relative overflow-hidden">
                            <div className="absolute inset-0 bg-stone-300">
                                {/* Placeholder for featured image */}
                                <div className="absolute inset-0 flex items-center justify-center text-stone-500">Feature Image 2</div>
                                {/* <Image src={featured[1].image} alt={featured[1].title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" /> */}
                            </div>
                            <div className="absolute bottom-6 right-6">
                                <h4 className="text-2xl font-serif text-david-green mb-2 bg-david-beige/80 px-2 py-1 inline-block backdrop-blur-sm">{featured[1].title}</h4>
                                <span className="block text-david-green font-medium underline decoration-1 underline-offset-4">{featured[1].linkText}</span>
                            </div>
                        </Link>
                    </div>

                </div>
            </div>
        </motion.div>
    );
}

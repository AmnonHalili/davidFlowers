'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ProductCard from '@/components/shop/ProductCard';
import { getProductsByCategory } from '@/app/actions/product-actions';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
    { label: 'זרי פרחים', slug: 'bouquets' },
    { label: 'מתנות ומתוקים', slug: 'gifts' },
    { label: 'בלונים', slug: 'balloons' },
    { label: 'חתן וכלה', slug: 'wedding' },
    { label: 'עציצים', slug: 'plants' },
    { label: 'כלים ואגרטלים', slug: 'vases' },
    { label: 'שוקולדים', slug: 'chocolates' }
];

export default function CategoryExplorer() {
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].slug);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [cache, setCache] = useState<Record<string, any[]>>({});

    useEffect(() => {
        const fetchProducts = async () => {
            // Check cache first
            if (cache[selectedCategory]) {
                setProducts(cache[selectedCategory]);
                setLoading(false);
                return;
            }

            setLoading(true);
            const res = await getProductsByCategory(selectedCategory);

            if (res.success) {
                setProducts(res.products);
                setCache(prev => ({ ...prev, [selectedCategory]: res.products }));
            }
            setLoading(false);
        };

        fetchProducts();
    }, [selectedCategory, cache]);

    return (
        <section className="py-16 md:py-24 bg-white border-t border-stone-100">
            <div className="max-w-screen-2xl mx-auto space-y-8 md:space-y-12">

                {/* Header & Tabs */}
                <div className="space-y-6 px-4 md:px-6">
                    {/* Modern 'Split Divider' Header */}
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-stone-500 font-medium">
                            משלוח טרי ומהיר באשקלון והסביבה
                        </span>

                        <div className="w-full flex items-center justify-center gap-4 md:gap-8">
                            <div className="h-[1px] bg-[#C5A572]/40 flex-1 max-w-[20vw] md:max-w-xs"></div>
                            <h2 className="font-serif text-3xl md:text-4xl text-stone-900 font-medium text-center shrink-0">
                                הבחירות שלכם
                            </h2>
                            <div className="h-[1px] bg-[#C5A572]/40 flex-1 max-w-[20vw] md:max-w-xs"></div>
                        </div>
                    </div>

                    {/* Scrollable Tabs (Mobile) / Centered Row (Desktop) */}
                    <div className="relative -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto md:overflow-visible no-scrollbar">
                        <div className="flex md:flex-wrap md:justify-center gap-2 md:gap-3 min-w-max md:min-w-0 pb-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.slug}
                                    onClick={() => setSelectedCategory(cat.slug)}
                                    className={`
                                        px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap border
                                        ${selectedCategory === cat.slug
                                            ? 'bg-[#1B3322] text-white border-[#1B3322] shadow-md'
                                            : 'bg-white text-stone-900 border-stone-200 hover:border-[#D4AF37] hover:text-[#1B3322]'
                                        }
                                    `}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="min-h-[400px] relative">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10 h-[400px]"
                            >
                                <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-stone-300 animate-spin" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key={selectedCategory}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="relative"
                            >
                                {products.length > 0 ? (
                                    /* Mobile: Stick to Grid | Desktop: Grid */
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-8 px-4 md:px-6">
                                        {products.slice(0, 8).map((product) => (
                                            <ProductCard
                                                key={product.id}
                                                id={product.id}
                                                name={product.name}
                                                price={product.price}
                                                salePrice={product.salePrice}
                                                image={product.images[0]?.url || '/placeholder.jpg'}
                                                hoverImage={product.images[1]?.url}
                                                slug={product.slug}
                                                stock={product.stock}
                                                saleStartDate={product.saleStartDate}
                                                saleEndDate={product.saleEndDate}
                                                availableFrom={product.availableFrom}
                                                allowPreorder={product.allowPreorder}
                                                isVariablePrice={product.isVariablePrice}
                                                variations={product.variations}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center h-[300px] text-stone-400 space-y-4 px-4">
                                        <p>לא נמצאו מוצרים בקטגוריה זו כרגע.</p>
                                        <Link
                                            href="/shop"
                                            className="text-stone-900 underline underline-offset-4 hover:text-stone-600"
                                        >
                                            לחנות המלאה
                                        </Link>
                                    </div>
                                )}
                                {/* View All Link (Bottom Centered) */}
                                <div className="mt-12 text-center">
                                    <Link
                                        href={`/category/${selectedCategory}`}
                                        className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-stone-600 hover:text-stone-900 transition-colors group"
                                    >
                                        <span className="border-b border-transparent group-hover:border-stone-900 pb-0.5 transition-all">לכל הקולקציה</span>
                                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}

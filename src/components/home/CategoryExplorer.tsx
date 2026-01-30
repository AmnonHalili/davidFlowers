'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ProductCard from '@/components/shop/ProductCard';
import { getProductsByCategory } from '@/app/actions/product-actions';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
    { label: 'זרי פרחים', slug: 'bouquets' },
    { label: 'עציצים', slug: 'plants' },
    { label: 'מתנות ומתוקים', slug: 'gifts' },
    { label: 'שוקולדים', slug: 'chocolates' },
    { label: 'בלונים', slug: 'balloons' },
    { label: 'חתן וכלה', slug: 'wedding' },
    { label: 'כלים ואגרטלים', slug: 'vases' }
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
    }, [selectedCategory]); // Removed cache dependency to avoid infinite loop implications if cache changes

    return (
        <section className="py-16 md:py-24 bg-white border-t border-stone-100">
            <div className="max-w-screen-2xl mx-auto space-y-8 md:space-y-12">

                {/* Header & Tabs */}
                <div className="space-y-6 px-4 md:px-6">
                    <div className="flex flex-col md:flex-row justify-center md:justify-between items-center md:items-end gap-4">
                        <div className="flex flex-col items-center text-center space-y-3">
                            <span className="block text-[10px] md:text-xs uppercase tracking-[0.2em] text-stone-500 font-medium">
                                משלוח טרי ומהיר באשקלון והסביבה
                            </span>
                            <h2 className="font-serif text-4xl md:text-5xl text-stone-900 leading-tight">
                                הבחירות שלכם
                            </h2>
                        </div>
                        <Link
                            href={`/category/${selectedCategory}`}
                            className="hidden md:flex items-center gap-2 text-xs uppercase tracking-widest hover:text-stone-500 transition-colors"
                        >
                            לכל המוצרים בקטגוריה <ArrowLeft className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Scrollable Tabs */}
                    <div className="relative -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto no-scrollbar">
                        <div className="flex gap-2 md:gap-3 min-w-max pb-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.slug}
                                    onClick={() => setSelectedCategory(cat.slug)}
                                    className={`
                                        px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap
                                        ${selectedCategory === cat.slug
                                            ? 'bg-[#1B3322] text-white shadow-md'
                                            : 'bg-white text-stone-900 border border-stone-200 hover:bg-stone-50'
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
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}

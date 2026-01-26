'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useDebounce } from '@/hooks/use-debounce'; // Assuming this hook exists based on open files
import { searchProducts } from '@/app/actions/product-actions';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const debouncedQuery = useDebounce(query, 500);

    const POPULAR_SEARCHES = ['ורדים', 'זר ליום הולדת', 'סחלבים', 'מארז שוקולד', 'עציצים'];

    // Auto focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Perform search
    useEffect(() => {
        const performSearch = async () => {
            if (debouncedQuery.length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const data = await searchProducts(debouncedQuery);
                setResults(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [debouncedQuery]);

    // Block body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setQuery('');
            setResults([]);
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md overflow-hidden flex flex-col"
                >
                    {/* Header / Input */}
                    <div className="container mx-auto px-4 pt-6 pb-4 border-b border-stone-100">
                        <div className="flex items-center gap-4">
                            <Search className="w-6 h-6 text-stone-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="מה תרצו לחפש היום? (לדוגמה: ורדים, יום הולדת)"
                                className="flex-1 text-xl md:text-2xl font-serif bg-transparent border-none outline-none placeholder:text-stone-300 text-stone-900"
                            />
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-stone-100 transition-colors"
                            >
                                <X className="w-6 h-6 text-stone-500" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto container mx-auto px-4 py-8">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 text-david-green animate-spin" />
                            </div>
                        ) : query.length > 0 && results.length === 0 ? (
                            <div className="text-center py-12 text-stone-500">
                                <p className="text-lg">לא מצאנו תוצאות עבור &quot;{query}&quot;</p>
                                <p className="text-sm mt-2">נסה לחפש משהו אחר...</p>
                            </div>
                        ) : results.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                {results.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/product/${product.slug}`}
                                        onClick={onClose}
                                        className="group"
                                    >
                                        <div className="aspect-[3/4] relative bg-stone-50 mb-3 overflow-hidden rounded-lg">
                                            {product.images[0] && (
                                                <Image
                                                    src={product.images[0].url}
                                                    alt={product.name}
                                                    fill
                                                    className={`object-cover transition-transform duration-500 group-hover:scale-105 ${product.availableFrom && new Date(product.availableFrom) > new Date() && !product.allowPreorder ? 'grayscale opacity-50' : ''}`}
                                                />
                                            )}
                                            {/* Status Badge */}
                                            {(() => {
                                                const isFuture = product.availableFrom && new Date(product.availableFrom) > new Date();
                                                const isLocked = isFuture && !product.allowPreorder;
                                                const isPreorder = isFuture && product.allowPreorder;

                                                if (isLocked) return (
                                                    <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex items-center justify-center p-2 text-center">
                                                        <span className="bg-stone-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">בקרוב</span>
                                                    </div>
                                                );
                                                if (isPreorder) return (
                                                    <div className="absolute top-2 right-2">
                                                        <span className="bg-david-green text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm">PRE-ORDER</span>
                                                    </div>
                                                );
                                                return null;
                                            })()}
                                        </div>
                                        <h3 className="font-serif text-stone-900 group-hover:text-david-green transition-colors">{product.name}</h3>
                                        <p className="text-sm text-stone-500">
                                            {Number(product.salePrice) > 0 ? (
                                                <span className="flex items-center gap-2">
                                                    <span className="text-rose-600 font-medium">₪{Number(product.salePrice).toFixed(0)}</span>
                                                    <span className="line-through text-[10px] opacity-50">₪{Number(product.price).toFixed(0)}</span>
                                                </span>
                                            ) : (
                                                `₪${Number(product.price).toFixed(0)}`
                                            )}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            // Default State: Popular Searches
                            <div className="max-w-2xl mx-auto">
                                <h3 className="text-sm font-medium text-stone-400 mb-6 uppercase tracking-wider">חיפושים נפוצים</h3>
                                <div className="flex flex-wrap gap-3">
                                    {POPULAR_SEARCHES.map((term) => (
                                        <button
                                            key={term}
                                            onClick={() => setQuery(term)}
                                            className="px-4 py-2 bg-stone-50 border border-stone-100 rounded-full text-stone-600 hover:border-david-green hover:text-david-green transition-colors"
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

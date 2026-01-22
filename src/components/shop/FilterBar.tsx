'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

export default function FilterBar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initial States from URL
    const initialSort = searchParams.get('sort') || 'recommended';
    const initialMin = searchParams.get('min') || '';
    const initialMax = searchParams.get('max') || '';

    const [isOpen, setIsOpen] = useState(false);
    const [sort, setSort] = useState(initialSort);
    const [minPrice, setMinPrice] = useState(initialMin);
    const [maxPrice, setMaxPrice] = useState(initialMax);

    // Debounce price updates to avoid too many refreshes
    const debouncedMin = useDebounce(minPrice, 500);
    const debouncedMax = useDebounce(maxPrice, 500);

    // Effect to update URL
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());

        // Update Sort
        if (sort && sort !== 'recommended') params.set('sort', sort);
        else params.delete('sort');

        // Update Min Price
        if (debouncedMin) params.set('min', debouncedMin);
        else params.delete('min');

        // Update Max Price
        if (debouncedMax) params.set('max', debouncedMax);
        else params.delete('max');

        router.replace(`?${params.toString()}`, { scroll: false });
    }, [sort, debouncedMin, debouncedMax, router, searchParams]);

    return (
        <div className="mb-12">
            {/* Mobile Filter Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden w-full flex items-center justify-between p-4 bg-[#F5F5F0] text-david-green font-serif text-lg rounded-sm"
            >
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5" />
                    <span>סינון ומיון</span>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Filter Content */}
            <div className={`
                md:flex md:items-end md:justify-between md:gap-8 md:opacity-100 md:h-auto
                overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                ${isOpen ? 'h-auto opacity-100 mt-4' : 'h-0 opacity-0 md:mt-0'}
            `}>

                {/* Sort Options */}
                <div className="relative group min-w-[200px]">
                    <label className="block text-xs font-bold text-david-green/80 mb-2 uppercase tracking-widest">מיון לפי</label>
                    <div className="relative">
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="w-full appearance-none bg-transparent border-b border-david-green/30 text-david-green text-lg font-serif py-2 pl-8 pr-2 focus:outline-none focus:border-david-green transition-colors cursor-pointer rounded-none"
                        >
                            <option value="recommended">מומלץ</option>
                            <option value="price_asc">מחיר: מהנמוך לגבוה</option>
                            <option value="price_desc">מחיר: מהגבוה לנמוך</option>
                            <option value="newest">חדש באתר</option>
                        </select>
                        <ChevronDown className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-david-green pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>

                {/* Price Range */}
                <div className="mt-6 md:mt-0 flex-1 md:flex md:justify-end">
                    <div className="flex items-end gap-4">
                        <div className="w-[120px]">
                            <label className="block text-xs font-bold text-david-green/80 mb-2 uppercase tracking-widest">מחיר מ-</label>
                            <div className="relative group">
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="w-full bg-transparent border-b border-david-green/30 text-david-green text-lg font-sans py-2 pl-6 pr-2 focus:outline-none focus:border-david-green transition-colors placeholder:text-david-green/30"
                                />
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-david-green/50 text-sm">₪</span>
                            </div>
                        </div>
                        <span className="text-david-green/30 mb-3">–</span>
                        <div className="w-[120px]">
                            <label className="block text-xs font-bold text-david-green/80 mb-2 uppercase tracking-widest">עד מחיר</label>
                            <div className="relative group">
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="הכל"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="w-full bg-transparent border-b border-david-green/30 text-david-green text-lg font-sans py-2 pl-6 pr-2 focus:outline-none focus:border-david-green transition-colors placeholder:text-david-green/30"
                                />
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-david-green/50 text-sm">₪</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

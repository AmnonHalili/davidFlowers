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
        <div className="mb-6 md:mb-8">
            {/* Mobile Filter Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden w-full flex items-center justify-between p-3 bg-stone-100/50 text-david-green font-serif text-base rounded-sm border border-stone-200/50"
            >
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>סינון ומיון</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
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
                <div className="mt-6 md:mt-0 flex-1 flex flex-col items-start md:items-end">
                    <label className="block text-xs font-bold text-david-green/80 mb-3 uppercase tracking-widest self-start md:self-auto">טווח מחירים</label>

                    {/* Range Chips */}
                    <div className="flex flex-wrap gap-2 mb-6 md:justify-end">
                        {[
                            { label: 'עד 150 ₪', min: '', max: '150' },
                            { label: '150 - 250 ₪', min: '150', max: '250' },
                            { label: '250 - 400 ₪', min: '250', max: '400' },
                            { label: '400+ ₪', min: '400', max: '' }
                        ].map((range) => {
                            const isActive = minPrice === range.min && maxPrice === range.max;
                            return (
                                <button
                                    key={range.label}
                                    onClick={() => {
                                        if (isActive) {
                                            setMinPrice('');
                                            setMaxPrice('');
                                        } else {
                                            setMinPrice(range.min);
                                            setMaxPrice(range.max);
                                        }
                                    }}
                                    className={`
                                        px-4 py-1.5 rounded-full border text-xs tracking-wide transition-all duration-300
                                        ${isActive
                                            ? 'bg-david-green text-white border-david-green shadow-md translate-y-[-1px]'
                                            : 'bg-white text-david-green/70 border-david-green/10 hover:border-david-green/30 hover:bg-david-green/5'}
                                    `}
                                >
                                    {range.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-end gap-3 w-full md:w-auto">
                        <div className="w-full md:w-[100px]">
                            <label className="block text-[10px] font-bold text-david-green/50 mb-1 uppercase tracking-widest">מ-</label>
                            <div className="relative group">
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="w-full bg-transparent border-b border-david-green/20 text-david-green text-base font-sans py-1.5 pl-6 pr-1 focus:outline-none focus:border-david-green transition-colors placeholder:text-david-green/20"
                                />
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-david-green/40 text-xs">₪</span>
                            </div>
                        </div>
                        <span className="text-david-green/20 mb-2">/</span>
                        <div className="w-full md:w-[100px]">
                            <label className="block text-[10px] font-bold text-david-green/50 mb-1 uppercase tracking-widest">עד-</label>
                            <div className="relative group">
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="הכל"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="w-full bg-transparent border-b border-david-green/20 text-david-green text-base font-sans py-1.5 pl-6 pr-1 focus:outline-none focus:border-david-green transition-colors placeholder:text-david-green/20"
                                />
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-david-green/40 text-xs">₪</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

'use client';

import { CATEGORIES as HARDCODED_CATEGORIES } from '@/lib/categories';
import { Check } from 'lucide-react';
import { useState } from 'react';

interface CategoryMultiSelectProps {
    defaultSelected?: string[];
    availableCategories?: any[];
}

export default function CategoryMultiSelect({ defaultSelected = [], availableCategories = [] }: CategoryMultiSelectProps) {
    const [selected, setSelected] = useState<string[]>(defaultSelected);

    // Combine hardcoded fallback if needed, or just use what's passed if populated.
    // Logic: If availableCategories is passed and has items, use it. Else fall back to hardcoded.
    // This allows gradual migration and failsafe.
    const categoriesToDisplay = (availableCategories && availableCategories.length > 0)
        ? availableCategories
        : HARDCODED_CATEGORIES;

    const toggleCategory = (slug: string) => {
        setSelected(prev =>
            prev.includes(slug)
                ? prev.filter(s => s !== slug)
                : [...prev, slug]
        );
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {categoriesToDisplay.map((cat) => {
                    const isSelected = selected.includes(cat.slug);
                    return (
                        <button
                            key={cat.slug}
                            type="button"
                            onClick={() => toggleCategory(cat.slug)}
                            className={`
                                inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all border
                                ${isSelected
                                    ? 'bg-stone-900 text-white border-stone-900'
                                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                                }
                            `}
                        >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                            <span>{cat.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* Hidden inputs to submit data via FormData */}
            {selected.length === 0 && (
                <input type="hidden" name="categories" value="" />
            )}
            {selected.map(slug => (
                <input key={slug} type="hidden" name="categories" value={slug} />
            ))}

            <p className="text-xs text-stone-400">
                {selected.length === 0 ? 'לא נבחרו קטגוריות' : `נבחרו ${selected.length} קטגוריות`}
            </p>
        </div>
    );
}

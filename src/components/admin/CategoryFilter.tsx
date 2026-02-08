'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Filter } from 'lucide-react';

interface CategoryFilterProps {
    categories: {
        id: string;
        name: string;
        slug: string;
    }[];
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentCategory = searchParams.get('category') || '';

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        const params = new URLSearchParams(searchParams);

        if (value) {
            params.set('category', value);
        } else {
            params.delete('category');
        }

        router.replace(`?${params.toString()}`);
    };

    return (
        <div className="relative">
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            <select
                value={currentCategory}
                onChange={handleChange}
                className="w-full md:w-[200px] pr-10 pl-4 py-2 bg-stone-50 border-none rounded-md focus:ring-1 focus:ring-stone-900 text-sm appearance-none cursor-pointer text-stone-600"
            >
                <option value="">כל הקטגוריות</option>
                {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                        {category.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

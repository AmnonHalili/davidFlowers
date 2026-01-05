'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

export default function SearchInput() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [text, setText] = useState(searchParams.get('search')?.toString() || '');
    const query = useDebounce(text, 300);

    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        if (query) {
            params.set('search', query);
        } else {
            params.delete('search');
        }
        router.replace(`?${params.toString()}`);
    }, [query, router, searchParams]);

    return (
        <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
                type="text"
                placeholder="חיפוש לפי שם זר..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-stone-50 border-none rounded-md focus:ring-1 focus:ring-stone-900 text-sm"
            />
        </div>
    );
}

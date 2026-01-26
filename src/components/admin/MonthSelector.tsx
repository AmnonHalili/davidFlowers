'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function MonthSelector() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const selectedYear = Number(searchParams.get('year')) || currentYear;
    const selectedMonth = Number(searchParams.get('month')) || currentMonth;

    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    const months = [
        { value: 1, label: 'ינואר' },
        { value: 2, label: 'פברואר' },
        { value: 3, label: 'מרץ' },
        { value: 4, label: 'אפריל' },
        { value: 5, label: 'מאי' },
        { value: 6, label: 'יוני' },
        { value: 7, label: 'יולי' },
        { value: 8, label: 'אוגוסט' },
        { value: 9, label: 'ספטמבר' },
        { value: 10, label: 'אוקטובר' },
        { value: 11, label: 'נובמבר' },
        { value: 12, label: 'דצמבר' },
    ];

    const handleChange = (key: 'year' | 'month', value: string) => {
        const params = new URLSearchParams(searchParams);
        params.set(key, value);
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex gap-4">
            <select
                value={selectedMonth}
                onChange={(e) => handleChange('month', e.target.value)}
                className="bg-white border border-stone-200 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-stone-900"
            >
                {months.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                ))}
            </select>
            <select
                value={selectedYear}
                onChange={(e) => handleChange('year', e.target.value)}
                className="bg-white border border-stone-200 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-stone-900"
            >
                {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                ))}
            </select>
        </div>
    );
}

'use client';

import { Download } from 'lucide-react';

interface ExportButtonProps {
    data: any[];
    filename?: string;
}

export default function ExportButton({ data, filename = 'report' }: ExportButtonProps) {
    const handleExport = () => {
        if (!data || data.length === 0) {
            alert('אין נתונים לייצוא');
            return;
        }

        // CSV Header
        const headers = ['Order ID', 'Date', 'Customer', 'Amount', 'Status'];

        // CSV Rows
        const rows = data.map(row => [
            row.id,
            new Date(row.date).toLocaleDateString('he-IL'),
            `"${row.customer}"`, // Quote to handle commas in names
            row.amount,
            row.status
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Download logic
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors"
        >
            <Download className="w-4 h-4" />
            <span>ייצוא ל-CSV</span>
        </button>
    );
}

'use client';

import { Printer } from "lucide-react";

export default function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="bg-stone-900 text-white px-6 py-3 rounded-full shadow-xl font-bold flex items-center gap-2 hover:bg-stone-800 transition-colors"
        >
            <Printer className="w-5 h-5" />
            לחץ כאן להדפסה
        </button>
    );
}

'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Global Error Boundary caught:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500">
                <AlertCircle className="w-10 h-10" />
            </div>

            <h2 className="text-3xl font-serif text-stone-800 mb-3">משהו השתבש...</h2>

            <p className="text-stone-500 max-w-md mb-8">
                נתקלנו בבעיה בלתי צפויה. אנחנו עובדים על תיקון התקלה.
                בינתיים, ניתן לנסות לרענן את העמוד.
            </p>

            <button
                onClick={reset}
                className="flex items-center gap-2 bg-stone-900 text-white px-8 py-3 rounded-full hover:bg-stone-700 transition-colors shadow-lg font-medium"
            >
                <RefreshCcw className="w-4 h-4" />
                נסה שוב
            </button>

            {process.env.NODE_ENV === 'development' && (
                <div className="mt-12 p-4 bg-gray-100 rounded-lg text-left text-xs font-mono max-w-2xl w-full overflow-auto text-red-800 border border-red-200">
                    <p className="font-bold border-b border-red-200 pb-2 mb-2">Error Details (Dev Mode Only):</p>
                    {error.message}
                    {error.stack && <pre className="mt-2 text-gray-600">{error.stack}</pre>}
                </div>
            )}
        </div>
    );
}

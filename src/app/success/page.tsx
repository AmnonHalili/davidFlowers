import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function SuccessPage({
    searchParams,
}: {
    searchParams?: {
        orderId?: string;
    };
}) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>

            <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">תודה על ההזמנה!</h1>
            <p className="text-stone-500 max-w-md mb-8">
                ההזמנה התקבלה בהצלחה ונשלח אליך אישור למייל בקרוב.
                {searchParams?.orderId && <span className="block mt-2 font-mono text-xs">מספר הזמנה: #{searchParams.orderId.slice(-6).toUpperCase()}</span>}
            </p>

            <div className="flex gap-4">
                <Link
                    href="/account"
                    className="px-6 py-3 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
                >
                    צפייה בהזמנה שלי
                </Link>
                <Link
                    href="/shop"
                    className="px-6 py-3 border border-stone-200 text-stone-900 rounded-lg hover:bg-stone-50 transition-colors"
                >
                    חזרה לחנות
                </Link>
            </div>
        </div>
    );
}

import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function CancelPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <XCircle className="w-8 h-8 text-red-600" />
            </div>

            <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">ההזמנה בוטלה</h1>
            <p className="text-stone-500 max-w-md mb-8">
                תהליך התשלום לא הושלם. לא חויבת עבור הזמנה זו.
                אם נתקלת בבעיה, נשמח לעזור לך בצ'אט או בטלפון.
            </p>

            <div className="flex gap-4">
                <Link
                    href="/shop"
                    className="px-6 py-3 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
                >
                    חזרה לחנות
                </Link>
            </div>
        </div>
    );
}

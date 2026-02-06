import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
            <h1 className="text-9xl font-serif text-stone-200 font-bold mb-4 select-none">404</h1>
            <h2 className="text-3xl font-serif text-stone-800 mb-4">העמוד לא נמצא</h2>
            <p className="text-stone-500 max-w-md mb-8">
                מצטערים, אך העמוד שחיפשת אינו קיים או שהוסר.
                ייתכן והקישור שגוי או שהדף כבר לא איתנו. 🥀
            </p>
            <Link
                href="/"
                className="flex items-center gap-2 bg-[#2d5016] text-white px-8 py-3 rounded-full hover:bg-[#1f3f0e] transition-colors shadow-lg shadow-[#2d5016]/20 font-medium"
            >
                <Home className="w-4 h-4" />
                חזרה לדף הבית
            </Link>
        </div>
    );
}

import HeroSettingsManager from '@/components/admin/HeroSettingsManager';
import { DEFAULT_HERO_CONFIG } from '@/types/hero';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldAlert } from 'lucide-react';

export const metadata = {
    title: 'דמו בדיקה - ניהול מסך Hero | פרחי דוד',
};

export default function DemoHeroPage() {
    return (
        <div className="min-h-screen bg-stone-100/60 p-4 md:p-8" dir="rtl">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Demo Notice Banner */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-amber-900 shadow-xs">
                    <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <h1 className="font-bold text-sm">
                                דף הדגמה ובדיקה: ניהול מסך ה-Hero (פתוח לבדיקה מקומית מיידית)
                            </h1>
                            <p className="text-xs text-amber-700 mt-0.5">
                                דף זה מאפשר לך לנסות, לשנות מצבים (תמונות בגלילה אופקית / סרטונים מתחלפים), לבדוק מהירויות, אפקטים ותצוגה מקדימה חיה ללא צורך בהתחברות לאדמין.
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/"
                        className="flex items-center gap-1.5 text-xs font-bold text-david-green hover:underline shrink-0"
                    >
                        <span>מעבר לדף הבית של החנות</span>
                        <ArrowRight className="w-4 h-4 rotate-180" />
                    </Link>
                </div>

                {/* Manager Component */}
                <HeroSettingsManager initialConfig={DEFAULT_HERO_CONFIG} isDemo={true} />
            </div>
        </div>
    );
}

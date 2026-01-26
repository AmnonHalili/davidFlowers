'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { getOrderStatus } from '@/app/actions/order-actions';
import OrderTimeline from '@/components/orders/OrderTimeline';
import { AlertCircle, Link, PackageSearch, ArrowRight } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TrackOrderPage() {
    const { isSignedIn, isLoaded } = useUser();
    const router = useRouter();

    // State
    const [statusResult, setStatusResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Form Handler
    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        setStatusResult(null);

        const orderId = formData.get('orderId') as string;
        const email = formData.get('email') as string;

        try {
            const result = await getOrderStatus(orderId, email);
            if (result.success) {
                setStatusResult(result.order);
            } else {
                setError(result.error || 'שגיאה לא ידועה');
            }
        } catch (e) {
            setError('אירעה שגיאה בבדיקת ההזמנה');
        } finally {
            setLoading(false);
        }
    }

    // Redirect logged in users
    useEffect(() => {
        if (isLoaded && isSignedIn) {
            // Optional: Auto redirect or just show a banner. The plan said redirect.
            redirectTimer = setTimeout(() => router.push('/account'), 3000);
        }
        return () => clearTimeout(redirectTimer);
    }, [isLoaded, isSignedIn, router]);

    let redirectTimer: NodeJS.Timeout;

    if (!isLoaded) return null;

    if (isSignedIn) {
        return (
            <div className="min-h-screen pt-32 pb-20 px-6 bg-stone-50 flex items-center justify-center">
                <div className="text-center space-y-4 max-w-md mx-auto">
                    <div className="w-16 h-16 bg-david-green/10 text-david-green rounded-full flex items-center justify-center mx-auto mb-4">
                        <PackageSearch className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <h1 className="font-serif text-3xl text-stone-900">כבר מחובר למערכת</h1>
                    <p className="text-stone-500">
                        זיהינו שאתה מחובר. אתה מועבר לאזור האישי לצפייה בכל ההזמנות שלך.
                    </p>
                    <button
                        onClick={() => router.push('/account')}
                        className="text-david-green font-bold hover:underline"
                    >
                        מעבר מיידי לאזור האישי
                    </button>
                    {/* Allow staying? Maybe cancel redirect implies logout or guest track which is weird */}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 px-6 bg-stone-50" dir="rtl">
            <div className="max-w-md mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="font-serif text-4xl text-stone-900">מעקב משלוחים</h1>
                    <p className="text-stone-500 font-light">
                        הזינו את מספר ההזמנה והאימייל כדי לראות את סטטוס המשלוח
                    </p>
                </div>

                {/* Tracking Form */}
                <div className="bg-white p-8 rounded-lg shadow-sm border border-stone-100">
                    <form action={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="orderId" className="block text-xs font-bold uppercase tracking-wider text-stone-500">
                                מספר הזמנה
                            </label>
                            <input
                                type="text"
                                name="orderId"
                                id="orderId"
                                placeholder="לדוגמה: clr..."
                                required
                                className="w-full bg-stone-50 border-b border-stone-200 p-3 focus:outline-none focus:border-david-green transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-stone-500">
                                אימייל (שאיתו בוצעה ההזמנה)
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                placeholder="name@example.com"
                                required
                                className="w-full bg-stone-50 border-b border-stone-200 p-3 focus:outline-none focus:border-david-green transition-colors"
                            />
                        </div>

                        <SubmitButton loading={loading} />
                    </form>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 text-red-800 text-sm flex items-start gap-3 rounded-md animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}
                </div>

                {/* Result Section */}
                {statusResult && (
                    <div className="bg-white p-8 rounded-lg shadow-lg border border-david-green/20 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
                            <div>
                                <h2 className="font-serif text-2xl text-stone-900">הזמנה #{statusResult.id.slice(-6).toUpperCase()}</h2>
                                <p className="text-sm text-stone-500 mt-1">
                                    סה״כ: ₪{Number(statusResult.totalAmount).toFixed(2)}
                                </p>
                            </div>
                        </div>

                        <OrderTimeline status={statusResult.status} />

                        <div className="mt-8 bg-stone-50 p-4 rounded text-sm text-stone-600">
                            <p className="font-bold mb-2 text-stone-900">פרטי משלוח:</p>
                            <p>{statusResult.shippingCity}, {statusResult.shippingAddress}</p>
                            <p>{statusResult.recipientName} - {statusResult.recipientPhone}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function SubmitButton({ loading }: { loading: boolean }) {
    return (
        <button
            type="submit"
            disabled={loading}
            className="w-full bg-david-green text-white py-4 font-bold uppercase tracking-widest hover:bg-david-green/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
            {loading ? (
                <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    בודק סטטוס...
                </>
            ) : (
                <>
                    <span>איתור הזמנה</span>
                    <ArrowRight className="w-4 h-4" />
                </>
            )}
        </button>
    );
}

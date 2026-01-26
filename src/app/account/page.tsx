import { syncUser } from '@/lib/user-sync';
import { SignOutButton } from '@clerk/nextjs';
import { Package, Calendar, Settings, LogOut, ShoppingBag, Clock, CheckCircle, XCircle } from 'lucide-react';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import OrderHistoryItem from '@/components/account/OrderHistoryItem';

const prisma = new PrismaClient();

export default async function AccountPage() {
    const user = await syncUser();

    if (!user) {
        return <div>Connecting...</div>;
    }

    // Fetch Real Data
    const orders = await prisma.order.findMany({
        where: { userId: user.id },
        include: {
            items: {
                include: { product: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const activeSubscription = await prisma.subscription.findFirst({
        where: { userId: user.id, isActive: true },
        include: { product: true }
    });

    return (
        <div className="min-h-screen bg-[#FAFAFA] pt-8 pb-20">
            <div className="max-w-screen-lg mx-auto px-6 space-y-12">

                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-stone-200">
                    <div>
                        <h1 className="font-serif text-4xl text-stone-900 mb-2">שלום, {user.name?.split(' ')[0]}</h1>
                        <p className="text-stone-500 font-light">
                            ברוכים הבאים לאזור האישי. כאן תוכלו לנהל את המנויים וההזמנות שלכם.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="bg-stone-900 text-white px-6 py-2 text-sm rounded-full text-center">
                            {user.role === 'ADMIN' ? 'מנהל מערכת' : 'חבר מועדון'}
                        </div>
                        {user.role === 'ADMIN' && (
                            <Link href="/admin" className="text-xs text-center border-b border-stone-900 pb-0.5 hover:opacity-70">
                                כניסה לממשק ניהול ←
                            </Link>
                        )}
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Active Subscription Card */}
                    <div className="bg-white p-8 border border-stone-100 shadow-sm relative overflow-hidden group">
                        <div className="relative z-10 w-full">
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center text-stone-900">
                                    <Calendar strokeWidth={1.5} />
                                </div>
                                {activeSubscription && (
                                    <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-bold tracking-wide">
                                        פעיל
                                    </span>
                                )}
                            </div>

                            <h2 className="font-serif text-2xl text-stone-900 mb-4">המנוי שלי</h2>

                            {activeSubscription ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-stone-50 rounded-lg border border-stone-100">
                                        <h3 className="font-medium text-stone-900 mb-1">{activeSubscription.product.name}</h3>
                                        <div className="flex gap-4 text-sm text-stone-500">
                                            <span>תדירות: {activeSubscription.frequency === 'WEEKLY' ? 'שבועי' : 'דו-שבועי'}</span>
                                            <span>|</span>
                                            <span>יום משלוח: {getDayName(activeSubscription.deliveryDay)}</span>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-stone-200/50 flex justify-between items-center bg-white p-3 rounded shadow-sm">
                                            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">משלוח קרוב</span>
                                            <span className="text-stone-900 font-medium">{new Date(activeSubscription.nextDeliveryDate).toLocaleDateString('he-IL')}</span>
                                        </div>
                                    </div>
                                    <button className="text-red-500 text-sm hover:underline">
                                        ביטול מנוי / הקפאה
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-stone-500 font-light">אין מנוי פעיל כרגע. הצטרפו למנוי הפרחים שלנו ותהנו מפרחים טריים בבית קבוע.</p>
                                    <Link href="/subscriptions" className="inline-block text-stone-900 border-b border-stone-900 pb-0.5 text-sm hover:opacity-70 transition-opacity">
                                        התחל מנוי חדש ←
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Profile Details Card */}
                    <div className="bg-white p-8 border border-stone-100 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center text-stone-900">
                                <Settings strokeWidth={1.5} />
                            </div>
                        </div>
                        <h2 className="font-serif text-2xl text-stone-900 mb-4">פרטים אישיים</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-stone-400 uppercase tracking-wider block mb-1">אימייל</label>
                                <p className="text-stone-900 font-medium">{user.email}</p>
                            </div>
                            <div>
                                <label className="text-xs text-stone-400 uppercase tracking-wider block mb-1">טלפון</label>
                                <p className="text-stone-900 font-medium">{user.phone || '—'}</p>
                            </div>
                            <div>
                                <label className="text-xs text-stone-400 uppercase tracking-wider block mb-1">כתובת למשלוח</label>
                                <p className="text-stone-900 font-medium">{user.address || '—'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions / Stats */}
                    <div className="space-y-4">
                        <div className="bg-stone-900 text-white p-6 shadow-sm flex flex-col justify-between min-h-[140px]">
                            <ShoppingBag className="w-6 h-6 opacity-80" strokeWidth={1.5} />
                            <div>
                                <span className="text-3xl font-serif">{orders.length}</span>
                                <p className="text-white/60 text-sm mt-1">סה״כ הזמנות</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 border border-stone-100 shadow-sm flex items-center gap-4 cursor-pointer hover:bg-stone-50 transition-colors text-red-500">
                            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                                <LogOut strokeWidth={1.5} className="w-5 h-5" />
                            </div>
                            <SignOutButton>
                                <div className="w-full text-right">
                                    <h3 className="font-serif text-lg">התנתקות</h3>
                                </div>
                            </SignOutButton>
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="space-y-6">
                    <h2 className="font-serif text-2xl text-stone-900">היסטוריית הזמנות</h2>
                    {orders.length > 0 ? (
                        <div className="bg-white border border-stone-100 rounded-lg overflow-hidden divide-y divide-stone-100">
                            {orders.map((order) => (
                                <OrderHistoryItem key={order.id} order={order} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white border border-stone-100 rounded-lg">
                            <Package className="w-12 h-12 mx-auto text-stone-300 mb-4" strokeWidth={1} />
                            <p className="text-stone-500 font-light">טרם ביצעת הזמנות.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}



function getDayName(day: string) {
    const days: Record<string, string> = {
        SUNDAY: 'ראשון',
        MONDAY: 'שני',
        TUESDAY: 'שלישי',
        WEDNESDAY: 'רביעי',
        THURSDAY: 'חמישי',
        FRIDAY: 'שישי',
        SATURDAY: 'שבת',
    };
    return days[day] || day;
}

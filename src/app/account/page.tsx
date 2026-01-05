import { syncUser } from '@/lib/user-sync';
import { SignOutButton } from '@clerk/nextjs';
import { Package, Calendar, Settings, LogOut } from 'lucide-react';

export default async function AccountPage() {
    const user = await syncUser();

    if (!user) {
        return <div>Connecting...</div>;
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] pt-32 pb-20">
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
                            <a href="/admin" className="text-xs text-center border-b border-stone-900 pb-0.5 hover:opacity-70">
                                כניסה לממשק ניהול ←
                            </a>
                        )}
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Active Subscription Card */}
                    <div className="bg-white p-8 border border-stone-100 shadow-sm md:col-span-2 relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center mb-6 text-stone-900">
                                <Calendar strokeWidth={1.5} />
                            </div>
                            <h2 className="font-serif text-2xl text-stone-900 mb-2">המנוי שלי</h2>

                            {/* Empty State */}
                            <div className="space-y-4">
                                <p className="text-stone-500 font-light">אין מנוי פעיל כרגע.</p>
                                <button className="text-stone-900 border-b border-stone-900 pb-0.5 text-sm hover:opacity-70 transition-opacity">
                                    התחל מנוי חדש ←
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-4">
                        <div className="bg-white p-6 border border-stone-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-stone-300 transition-colors">
                            <div className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center text-stone-900">
                                <Package strokeWidth={1.5} className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-serif text-lg">הזמנות קודמות</h3>
                                <p className="text-xs text-stone-400">צפייה בהיסטוריית רכישות</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 border border-stone-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-stone-300 transition-colors">
                            <div className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center text-stone-900">
                                <Settings strokeWidth={1.5} className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-serif text-lg">הגדרות חשבון</h3>
                                <p className="text-xs text-stone-400">כתובות ופרטי תשלום</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 border border-stone-100 shadow-sm flex items-center gap-4 cursor-pointer hover:bg-stone-50 transition-colors text-red-500">
                            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                                <LogOut strokeWidth={1.5} className="w-5 h-5" />
                            </div>
                            <SignOutButton>
                                <div className="w-full">
                                    <h3 className="font-serif text-lg">התנתקות</h3>
                                </div>
                            </SignOutButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

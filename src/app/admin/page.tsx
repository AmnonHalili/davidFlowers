import { Package, ShoppingCart, TrendingUp, Users } from 'lucide-react';

export default function AdminDashboard() {
    return (
        <div className="p-10 space-y-10">

            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">לוח בקרה</h1>
                    <p className="text-stone-500 mt-2">סקירה כללית של ביצועי החנות היום.</p>
                </div>
                <div className="text-sm text-stone-400 font-mono">
                    {new Date().toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatsCard
                    title="הכנסות החודש"
                    value="₪42,500"
                    trend="+12%"
                    icon={TrendingUp}
                />
                <StatsCard
                    title="הזמנות חדשות"
                    value="18"
                    trend="+5%"
                    icon={ShoppingCart}
                />
                <StatsCard
                    title="מנויים פעילים"
                    value="124"
                    trend="+3"
                    icon={Users}
                />
                <StatsCard
                    title="סה״כ מוצרים"
                    value="32"
                    trend=""
                    icon={Package}
                />
            </div>

            <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-sm h-96 flex items-center justify-center text-stone-400">
                [גרף מכירות יופיע כאן]
            </div>

        </div>
    );
}

function StatsCard({ title, value, trend, icon: Icon }: any) {
    return (
        <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-sm transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-stone-50 rounded-lg text-stone-900">
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                </div>
                {trend && (
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full dir-ltr">
                        {trend}
                    </span>
                )}
            </div>
            <div className="space-y-1">
                <h3 className="text-stone-500 text-sm font-medium">{title}</h3>
                <p className="text-2xl font-bold text-stone-900 font-serif">{value}</p>
            </div>
        </div>
    )
}

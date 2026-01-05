import { Package, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getStats() {
    const totalRevenue = await prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: 'CANCELLED' } }
    });

    const pendingOrders = await prisma.order.count({
        where: { status: 'PENDING' }
    });

    const totalProducts = await prisma.product.count();

    const lowStockProducts = await prisma.product.count({
        where: { stock: { lte: 5 } }
    });

    return {
        revenue: totalRevenue._sum.totalAmount || 0,
        pendingOrders,
        totalProducts,
        lowStockProducts
    };
}

export default async function AdminDashboard() {
    const stats = await getStats();

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
                    title="הכנסות (סה״כ)"
                    value={`₪${Number(stats.revenue).toLocaleString()}`}
                    trend="" // Todo: Calculate trend vs last month
                    icon={TrendingUp}
                />
                <StatsCard
                    title="הזמנות להכנה"
                    value={stats.pendingOrders.toString()}
                    trend={stats.pendingOrders > 0 ? "דרוש טיפול" : "הכל מוכן"}
                    icon={ShoppingCart}
                />
                <StatsCard
                    title="מוצרים במלאי נמוך"
                    value={stats.lowStockProducts.toString()}
                    trend={stats.lowStockProducts > 0 ? "הזמן סחורה" : "מלאי תקין"}
                    icon={Users} // Keeping icon visually consistent but logic changed
                />
                <StatsCard
                    title="סה״כ מוצרים בקטלוג"
                    value={stats.totalProducts.toString()}
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

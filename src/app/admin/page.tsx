import { Package, ShoppingCart, TrendingUp, Users, DollarSign } from 'lucide-react';
import prisma from '@/lib/prisma';
import SalesChart from '@/components/admin/SalesChart';
import RecentOrdersTable from '@/components/admin/RecentOrdersTable';
import HotProducts from '@/components/admin/HotProducts';

async function getStats() {
    // 1. Overall Stats
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

    // 2. Sales Chart Data (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const ordersLast30Days = await prisma.order.findMany({
        where: {
            createdAt: { gte: thirtyDaysAgo },
            status: { not: 'CANCELLED' }
        },
        select: {
            createdAt: true,
            totalAmount: true
        },
        orderBy: { createdAt: 'asc' }
    });

    // Group by Date for Chart
    const salesMap = new Map<string, number>();
    // Initialize last 30 days
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        salesMap.set(d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' }), 0);
    }

    ordersLast30Days.forEach(order => {
        const dateKey = order.createdAt.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' });
        const current = salesMap.get(dateKey) || 0;
        salesMap.set(dateKey, current + Number(order.totalAmount));
    });

    // Convert map back to array and reverse to have oldest first
    const salesData = Array.from(salesMap.entries())
        .map(([date, amount]) => ({ date, amount }))
        .reverse();


    // 3. Recent Orders
    const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { name: true, email: true } },
            items: true
        }
    });

    const formattedRecentOrders = recentOrders.map(order => ({
        id: order.id,
        customerName: order.recipientName || order.user?.name || order.user?.email || 'Unknown',
        total: Number(order.totalAmount),
        status: order.status,
        date: order.createdAt.toLocaleDateString('he-IL'),
        itemsCount: order.items.reduce((acc, item) => acc + item.quantity, 0)
    }));


    // 4. Hot Products
    // Prisma doesn't support easy joining on groupBy, so we do two steps
    const topItems = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: {
            quantity: true,
            price: true // Approximate revenue share
        },
        orderBy: {
            _sum: {
                quantity: 'desc'
            }
        },
        take: 5
    });

    const productIds = topItems.map(item => item.productId);
    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: { images: { where: { isMain: true }, take: 1 } }
    });

    const hotProducts = topItems.map(item => {
        const product = products.find(p => p.id === item.productId);
        const quantity = item._sum.quantity || 0;
        const revenue = product ? Number(product.price) * quantity : 0;

        return {
            id: item.productId,
            name: product?.name || 'Unknown',
            sales: quantity,
            revenue: revenue,
            image: product?.images[0]?.url || ''
        };
    });

    return {
        revenue: Number(totalRevenue._sum.totalAmount) || 0,
        pendingOrders,
        totalProducts,
        lowStockProducts,
        salesData: salesData,
        recentOrders: formattedRecentOrders,
        hotProducts
    };
}

export default async function AdminDashboard() {
    const stats = await getStats();

    return (
        <div className="p-10 space-y-10 max-w-[1600px] mx-auto">

            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900 font-serif">לוח בקרה</h1>
                    <p className="text-stone-500 mt-2">סקירה כללית של ביצועי החנות</p>
                </div>
                <div className="text-sm text-stone-400 font-mono bg-stone-50 px-3 py-1 rounded-full border border-stone-100">
                    {new Date().toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="הכנסות (סה״כ)"
                    value={`₪${Number(stats.revenue).toLocaleString()}`}
                    icon={DollarSign}
                    trend="הכנסות כלליות"
                />
                <StatsCard
                    title="הזמנות להכנה"
                    value={stats.pendingOrders.toString()}
                    icon={ShoppingCart}
                    trend={stats.pendingOrders > 0 ? "דרוש טיפול" : "הכל מוכן"}
                    trendColor={stats.pendingOrders > 0 ? "text-orange-600 bg-orange-50" : "text-green-600 bg-green-50"}
                />
                <StatsCard
                    title="מוצרים במלאי נמוך"
                    value={stats.lowStockProducts.toString()}
                    icon={TrendingUp}
                    trend={stats.lowStockProducts > 0 ? "הזמן סחורה" : "מלאי תקין"}
                />
                <StatsCard
                    title="סה״כ מוצרים"
                    value={stats.totalProducts.toString()}
                    icon={Package}
                    trend="בקטלוג"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <SalesChart data={stats.salesData} />
                </div>
                <div>
                    <HotProducts products={stats.hotProducts} />
                </div>
            </div>

            {/* Recent Orders */}
            <div>
                <RecentOrdersTable orders={stats.recentOrders} />
            </div>

        </div>
    );
}

function StatsCard({ title, value, trend, icon: Icon, trendColor = "text-emerald-600 bg-emerald-50" }: any) {
    return (
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-stone-50 rounded-lg text-stone-900 border border-stone-100">
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                </div>
                {trend && (
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${trendColor}`}>
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

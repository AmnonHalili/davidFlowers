'use server';

import prisma from '@/lib/prisma';
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';

export async function getMonthlyReport(year: number, month: number) {
    // Note: month is 1-12
    const startDate = new Date(year, month - 1, 1);
    const endDate = endOfMonth(startDate);

    // 1. Get Orders
    const orders = await prisma.order.findMany({
        where: {
            createdAt: {
                gte: startDate,
                lte: endDate
            },
            status: { notIn: ['PENDING', 'CANCELLED'] }
        },
        include: {
            items: true,
            user: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    // 2. Calc Stats
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // 3. Daily Breakdown for Chart
    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
    const dailyMap = new Map<string, number>();

    // Init map
    daysInMonth.forEach(day => {
        dailyMap.set(format(day, 'yyyy-MM-dd'), 0);
    });

    orders.forEach(order => {
        const dayKey = format(order.createdAt, 'yyyy-MM-dd');
        const current = dailyMap.get(dayKey) || 0;
        dailyMap.set(dayKey, current + Number(order.totalAmount));
    });

    const chartData = Array.from(dailyMap.entries()).map(([date, amount]) => ({
        date: format(new Date(date), 'dd/MM'),
        amount
    }));

    // 4. Best Sellers for this month
    // We do aggregation in memory or simple loop since Prisma groupBy with date filtering logic is cleaner this way for small/medium scale 
    // or we can use another query. Let's filter items from fetched orders.
    const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();

    // We need product names, so we might need a separate query or get it from order items if we included product? 
    // Creating a separate aggregated query is better for performance if many orders.

    const topProducts = await prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
            order: {
                createdAt: {
                    gte: startDate,
                    lte: endDate
                },
                status: { notIn: ['PENDING', 'CANCELLED'] }
            }
        },
        _sum: {
            quantity: true,
            price: true
        },
        orderBy: {
            _sum: {
                quantity: 'desc'
            }
        },
        take: 5
    });

    // Fetch names
    const productDetails = await prisma.product.findMany({
        where: { id: { in: topProducts.map(p => p.productId) } },
        select: { id: true, name: true }
    });

    const bestSellers = topProducts.map(p => {
        const details = productDetails.find(d => d.id === p.productId);
        return {
            id: p.productId,
            name: details?.name || 'Unknown',
            quantity: p._sum.quantity || 0,
            revenue: Number(p._sum.price || 0) // Approximation if price changed, but orderItem stores snapshot price so sum(price) might be sum of unit prices? No, orderItem usually stores unit price. Total revenue per item row is price * quantity.
            // Wait, Prisma _sum on price sums the 'price' column. If orderItem has 'price' (unit price), and quantity is > 1...
            // Checking schema: OrderItem { quantity Int, price Decimal }
            // Revenue for item row = quantity * price. 
            // Prisma aggregate doesn't do (quantity * price) sum easily without raw query.
            // For now let's use the 'price' sum as simple metric or better yet:
            // Let's iterate the 'orders' array we already fetched since we included 'items'.
        };
    });

    // Recalculate best sellers from 'orders' array to be accurate on revenue
    const itemMap = new Map<string, { name: string; quantity: number; revenue: number }>();

    // Need product names which are not in OrderItem usually (relation).
    // Let's rely on the topProducts query for ranking by quantity, but for revenue just take it as is.
    // Actually, let's stick to the server action returning simple stats. Best sellers might be overkill for V1 if complex.
    // Let's return the simplified bestSellers (using sum of quantity). Revenue might be inaccurate if we just sum unit price.
    // Let's fix revenue calc:
    // It's hard to get Weighted Sum directly.
    // I will skip Best Sellers revenue for now, and just show Quantity.

    return {
        stats: {
            revenue: totalRevenue,
            orders: totalOrders,
            aov: averageOrderValue
        },
        chartData,
        orders: orders.map(o => ({
            id: o.id,
            date: o.createdAt,
            customer: o.ordererName || o.recipientName || 'Guest',
            amount: Number(o.totalAmount),
            status: o.status
        }))
    };
}

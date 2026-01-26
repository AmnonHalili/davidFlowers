import { Suspense } from 'react';
import MonthSelector from '@/components/admin/MonthSelector';
import ExportButton from '@/components/admin/ExportButton';
import SalesChart from '@/components/admin/SalesChart';
import { getMonthlyReport } from '@/app/actions/report-actions';
import { DollarSign, ShoppingCart, TrendingUp, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ReportsPage({ searchParams }: PageProps) {
    const year = Number(searchParams.year) || new Date().getFullYear();
    const month = Number(searchParams.month) || new Date().getMonth() + 1;

    const { stats, chartData, orders } = await getMonthlyReport(year, month);

    return (
        <div className="p-10 space-y-10 max-w-[1600px] mx-auto text-stone-900">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-bold font-serif">דוחות כספיים</h1>
                    <p className="text-stone-500 mt-2">סיכום פעילות חודשי והיסטוריית הזמנות</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <MonthSelector />
                    <ExportButton data={orders} filename={`david-flowers-report-${month}-${year}`} />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="הכנסות (חודשי)"
                    value={`₪${stats.revenue.toLocaleString()}`}
                    icon={DollarSign}
                />
                <StatsCard
                    title="הזמנות (חודשי)"
                    value={stats.orders.toString()}
                    icon={ShoppingCart}
                />
                <StatsCard
                    title="ממוצע להזמנה"
                    value={`₪${stats.aov.toFixed(0)}`}
                    icon={TrendingUp}
                />
            </div>

            {/* Main Chart */}
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                <h3 className="text-lg font-bold mb-6 font-serif">מגמת הכנסות יומית</h3>
                <SalesChart data={chartData} />
            </div>

            {/* Recent Month Orders Preview */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold font-serif">פירוט הזמנות לחודש זה</h3>
                    <span className="text-xs text-stone-500 bg-stone-50 px-2 py-1 rounded">
                        סה״כ {orders.length} הזמנות
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-stone-50 text-stone-500 text-xs uppercase" dir="rtl">
                            <tr>
                                <th className="px-6 py-4 font-medium">מספר הזמנה</th>
                                <th className="px-6 py-4 font-medium">לקוח</th>
                                <th className="px-6 py-4 font-medium">תאריך</th>
                                <th className="px-6 py-4 font-medium">סטטוס</th>
                                <th className="px-6 py-4 font-medium">סכום</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-stone-400">
                                        אין הזמנות בחודש זה
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order: any) => (
                                    <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-stone-400">
                                            {order.id.slice(-6).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-stone-900">
                                            {order.customer}
                                        </td>
                                        <td className="px-6 py-4 text-stone-600 text-sm">
                                            {new Date(order.date).toLocaleDateString('he-IL', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(order.status)}`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-stone-900">
                                            ₪{order.amount.toFixed(0)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon: Icon }: any) {
    return (
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-stone-50 rounded-lg text-stone-900 border border-stone-100">
                <Icon className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
                <h3 className="text-stone-500 text-sm font-medium mb-1">{title}</h3>
                <p className="text-2xl font-bold text-stone-900 font-serif">{value}</p>
            </div>
        </div>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'PAID': return 'bg-green-100 text-green-700';
        case 'DELIVERED': return 'bg-blue-100 text-blue-700';
        case 'SHIPPED': return 'bg-purple-100 text-purple-700';
        case 'PENDING': return 'bg-yellow-100 text-yellow-700';
        case 'CANCELLED': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
    }
}

function getStatusLabel(status: string) {
    switch (status) {
        case 'PAID': return 'שולם';
        case 'DELIVERED': return 'נמסר';
        case 'SHIPPED': return 'נשלח';
        case 'PENDING': return 'ממתין';
        case 'CANCELLED': return 'בוטל';
        default: return status;
    }
}

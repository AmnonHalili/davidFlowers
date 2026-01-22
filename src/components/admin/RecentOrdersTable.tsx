'use client';

import Link from 'next/link';
import { Eye } from 'lucide-react';

interface RecentOrdersTableProps {
    orders: {
        id: string;
        customerName: string;
        total: number;
        status: string;
        date: string;
        itemsCount: number;
    }[];
}

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'DELIVERED': return 'bg-green-50 text-green-700 border-green-100';
            case 'SHIPPED': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'PENDING': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
            case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            'PAID': 'שולם',
            'DELIVERED': 'נמסר',
            'SHIPPED': 'נשלח',
            'PENDING': 'ממתין',
            'CANCELLED': 'בוטל'
        };
        return labels[status] || status;
    };

    return (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                <h3 className="font-serif text-lg font-bold text-stone-900">הזמנות אחרונות</h3>
                <Link href="/admin/orders" className="text-sm text-david-green hover:underline font-medium">
                    לכל ההזמנות &larr;
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                    <thead className="bg-stone-50 text-stone-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">מספר הזמנה</th>
                            <th className="px-6 py-4">לקוח</th>
                            <th className="px-6 py-4">תאריך</th>
                            <th className="px-6 py-4">סכום</th>
                            <th className="px-6 py-4">סטטוס</th>
                            <th className="px-6 py-4">פעולות</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-stone-500">
                                    אין הזמנות חדשות
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-stone-600">#{order.id.slice(-6).toUpperCase()}</td>
                                    <td className="px-6 py-4 font-medium text-stone-900">{order.customerName}</td>
                                    <td className="px-6 py-4 text-stone-500">{order.date}</td>
                                    <td className="px-6 py-4 font-bold text-stone-900">₪{order.total.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link
                                            href={`/admin/orders/${order.id}`}
                                            className="inline-flex items-center gap-1 text-stone-500 hover:text-david-green transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

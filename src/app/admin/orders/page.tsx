import { getOrders } from "@/app/actions/order-actions";
import StatusBadge from "@/components/admin/StatusBadge";
import Link from "next/link";
import { Eye } from "lucide-react";
import { format } from "date-fns";

export default async function AdminOrdersPage() {
    const orders = await getOrders();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-serif text-stone-900">ניהול הזמנות</h1>
            </div>

            <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-right">
                    <thead className="bg-stone-50 text-stone-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">מספר הזמנה</th>
                            <th className="px-6 py-4">לקוח</th>
                            <th className="px-6 py-4">תאריך</th>
                            <th className="px-6 py-4">סה"כ</th>
                            <th className="px-6 py-4">סטטוס</th>
                            <th className="px-6 py-4">פעולות</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-stone-500">
                                    אין הזמנות כרגע.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-stone-400">
                                        {order.id.slice(-8)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-stone-900">{order.recipientName}</div>
                                        <div className="text-xs text-stone-400">{order.user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-stone-600">
                                        {format(new Date(order.createdAt), 'dd/MM/yyyy')}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-stone-900">
                                        ₪{Number(order.totalAmount).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={order.status} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link
                                            href={`/admin/orders/${order.id}`}
                                            className="inline-flex items-center gap-1 text-david-green hover:underline text-xs font-medium"
                                        >
                                            <Eye className="w-3 h-3" />
                                            צפייה
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

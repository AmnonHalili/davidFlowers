import { getOrders } from '@/app/actions/order-actions';
import { StatusBadge } from '@/components/admin/StatusBadge';
import OrderStatusSelect from '@/components/admin/OrderStatusSelect';
import { Clock, MapPin, Package, User } from 'lucide-react';
import Link from 'next/link';

// Client component for the button to avoid making the page dynamic if not needed, 
// strictly speaking server actions can be called from client components.
import { DemoOrderButton } from '@/components/admin/DemoOrderButton';

export default async function AdminOrdersPage() {
    const { success, data: orders } = await getOrders();

    if (!success || !orders) {
        return (
            <div className="p-10 text-center text-red-500">
                שגיאה בטעינת ההזמנות. נסה לרענן את העמוד.
            </div>
        );
    }

    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">ניהול הזמנות</h1>
                    <p className="text-stone-500 mt-2">מעקב וטיפול בהזמנות ({orders.length} סה"כ)</p>
                </div>
                <DemoOrderButton />
            </div>

            {/* Orders List / Table */}
            <div className="bg-white rounded-lg border border-stone-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-stone-50 border-b border-stone-200">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-bold text-stone-500 uppercase tracking-wider">מס' הזמנה</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-stone-500 uppercase tracking-wider">לקוח</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-stone-500 uppercase tracking-wider">פריטים</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-stone-500 uppercase tracking-wider">משלוח ל...</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-stone-500 uppercase tracking-wider">סה"כ</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-stone-500 uppercase tracking-wider">סטטוס</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <Link href={`/admin/orders/${order.id}`} className="font-mono text-sm text-stone-900 font-bold hover:text-blue-600 hover:underline">
                                                #{order.id.slice(-6).toUpperCase()}
                                            </Link>
                                            <span className="text-xs text-stone-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(order.createdAt).toLocaleDateString('he-IL')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-stone-900">{order.user.name || 'אורח'}</div>
                                                <div className="text-xs text-stone-500">{order.user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="text-sm text-stone-600 flex items-center gap-2">
                                                    <Package className="w-3 h-3 text-stone-400" />
                                                    <span>{item.quantity}x {item.product.name}</span>
                                                </div>
                                            ))}
                                            {order.cardMessage && (
                                                <div className="text-xs text-stone-400 italic mt-1 border-r-2 border-stone-200 pr-2">
                                                    "{order.cardMessage}"
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-sm text-stone-900 font-medium">{order.recipientName}</div>
                                            <div className="text-xs text-stone-500 flex items-start gap-1">
                                                <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                                                {order.shippingAddress}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-stone-900">
                                            ₪{Number(order.totalAmount).toFixed(2)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-stone-400">
                                        אין הזמנות כרגע.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

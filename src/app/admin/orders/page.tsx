import { getOrders } from "@/app/actions/order-actions";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import Link from "next/link";
import { Eye, Calendar, User, Package, ChevronRight, Phone, Mail, Truck, MapPin, Clock, Ghost } from "lucide-react";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { getDeliverySlot } from "@/lib/date-utils";
import { OrderStatus } from "@prisma/client";

export default async function AdminOrdersPage({
    searchParams
}: {
    searchParams: { status?: string }
}) {
    const status = searchParams.status as OrderStatus | undefined;
    const orders = await getOrders(status);
    const TIME_ZONE = 'Asia/Jerusalem';

    return (
        <div className="space-y-8 pb-12 rtl" dir="rtl">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">ניהול הזמנות</h1>
                    <p className="text-stone-500 font-medium tracking-tight">מעקב וניהול סטטוסים בזמן אמת</p>
                </div>

                {/* Status Tabs */}
                <div className="flex bg-stone-100 p-1 rounded-2xl border border-stone-200 shadow-sm self-start">
                    <Link
                        href="/admin/orders"
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${!status ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                        הזמנות פעילות
                    </Link>
                    <Link
                        href="/admin/orders?status=PENDING"
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${status === 'PENDING' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                        <Ghost className="w-3.5 h-3.5" />
                        עגלות נטושות
                    </Link>
                </div>

                <div className="bg-white px-4 py-2 rounded-2xl border border-stone-200 shadow-sm inline-flex items-center gap-2">
                    <span className="w-2 h-2 bg-david-green rounded-full animate-pulse" />
                    <span className="text-sm font-bold text-stone-600">{orders.length} {status === 'PENDING' ? 'עגלות נטושות' : 'הזמנות פעילות'}</span>
                </div>
            </div>

            {/* Empty State */}
            {orders.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-20 text-center">
                    <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-stone-300" />
                    </div>
                    <h3 className="text-lg font-bold text-stone-900 mb-1">אין הזמנות כרגע</h3>
                    <p className="text-stone-500">כשיוזמנו מוצרים, הם יופיעו כאן בצורה מרוכזת.</p>
                </div>
            ) : (
                <>
                    {/* MOBILE CARD VIEW (Visible only on small screens) */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {orders.map((order) => {
                            const dateIsrael = toZonedTime(new Date(order.createdAt), TIME_ZONE);
                            const isPickup = order.shippingAddress === 'Self Pickup';

                            return (
                                <div key={order.id} className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden active:scale-[0.98] transition-all">
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 text-stone-400 font-mono text-[10px] mb-1">
                                                    <span>#{order.id.slice(-8).toUpperCase()}</span>
                                                    <span>•</span>
                                                    <span>{format(dateIsrael, 'HH:mm')}</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-stone-900">{order.recipientName}</h3>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-black text-stone-900">₪{Number(order.totalAmount).toFixed(0)}</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-5">
                                            <div className="flex items-center gap-2.5 text-stone-500">
                                                <div className="p-1.5 bg-stone-50 rounded-lg">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-sm font-medium">{format(dateIsrael, 'dd/MM/yyyy')}</span>
                                            </div>

                                            <div className={`flex items-center gap-2.5 ${isPickup ? 'text-amber-600' : 'text-david-green'}`}>
                                                <div className={`p-1.5 rounded-lg ${isPickup ? 'bg-amber-50' : 'bg-green-50'}`}>
                                                    {isPickup ? <MapPin className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />}
                                                </div>
                                                <span className="text-sm font-bold">{isPickup ? 'איסוף עצמי' : 'משלוח'}</span>
                                            </div>

                                            {order.ordererPhone && (
                                                <div className="flex items-center gap-2.5 text-stone-500 col-span-2">
                                                    <div className="p-1.5 bg-stone-50 rounded-lg">
                                                        <Phone className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-sm font-medium" dir="ltr">{order.ordererPhone}</span>
                                                </div>
                                            )}

                                            {order.desiredDeliveryDate && (
                                                <div className="flex items-center gap-2.5 text-david-green col-span-2 pt-2 border-t border-david-green/10">
                                                    <div className="p-1.5 bg-green-50 rounded-lg">
                                                        <Clock className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-bold uppercase opacity-60">מועד מבוקש:</div>
                                                        <span className="text-sm font-bold">
                                                            {format(toZonedTime(new Date(order.desiredDeliveryDate), TIME_ZONE), 'dd/MM/yyyy')} {getDeliverySlot(new Date(order.desiredDeliveryDate))}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                                            <div className="flex-1">
                                                <OrderStatusSelect orderId={order.id} currentStatus={order.status} isPickup={isPickup} fullWidth />
                                            </div>
                                            <Link
                                                href={`/admin/orders/${order.id}`}
                                                className="w-12 h-12 bg-stone-900 text-white rounded-2xl flex items-center justify-center shadow-lg active:bg-stone-800 transition-colors"
                                            >
                                                <ChevronRight className="w-6 h-6 rotate-180" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* DESKTOP TABLE VIEW (Visible only on medium screens and above) */}
                    <div className="hidden md:block bg-white border border-stone-200 rounded-[2rem] shadow-sm overflow-hidden text-right">
                        <table className="w-full text-sm">
                            <thead className="bg-stone-50/80 text-stone-500 font-bold uppercase tracking-wider text-[11px] border-b border-stone-100">
                                <tr>
                                    <th className="px-8 py-5 text-right font-bold">מספר הזמנה</th>
                                    <th className="px-8 py-5 text-right font-bold">לקוח</th>
                                    <th className="px-8 py-5 text-center font-bold">סוג</th>
                                    <th className="px-8 py-5 text-center font-bold">מועד אספקה</th>
                                    <th className="px-8 py-5 text-center font-bold">תאריך הזמנה</th>
                                    <th className="px-8 py-5 text-center font-bold">סה"כ</th>
                                    <th className="px-8 py-5 text-right font-bold">סטטוס</th>
                                    <th className="px-8 py-5 text-left font-bold">פעולות</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {orders.map((order) => {
                                    const dateIsrael = toZonedTime(new Date(order.createdAt), TIME_ZONE);
                                    const isPickup = order.shippingAddress === 'Self Pickup';

                                    return (
                                        <tr key={order.id} className="group hover:bg-stone-50/50 transition-all">
                                            <td className="px-8 py-5 font-mono text-[11px] text-stone-400 group-hover:text-stone-900 transition-colors">
                                                #{order.id.slice(-8).toUpperCase()}
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-500 font-bold">
                                                        {order.recipientName[0]}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-stone-900">{order.recipientName}</div>
                                                        <div className="text-xs text-stone-400 font-medium">{order.user?.email || order.ordererEmail}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${isPickup ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-david-green'
                                                    }`}>
                                                    {isPickup ? <MapPin className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                                                    {isPickup ? 'איסוף' : 'משלוח'}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                {order.desiredDeliveryDate ? (
                                                    <>
                                                        <div className="font-bold text-david-green">{format(toZonedTime(new Date(order.desiredDeliveryDate), TIME_ZONE), 'dd/MM/yyyy')}</div>
                                                        <div className="text-[11px] text-david-green/70 font-mono font-bold">{getDeliverySlot(new Date(order.desiredDeliveryDate))}</div>
                                                    </>
                                                ) : (
                                                    <span className="text-stone-300 italic text-xs">לא צוין</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <div className="font-medium text-stone-600">{format(dateIsrael, 'dd/MM/yyyy')}</div>
                                                <div className="text-[11px] text-stone-400 font-mono">{format(dateIsrael, 'HH:mm:ss')}</div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className="inline-flex items-center px-3 py-1 bg-stone-100 rounded-full font-black text-stone-900">
                                                    ₪{Number(order.totalAmount).toFixed(0)}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <OrderStatusSelect orderId={order.id} currentStatus={order.status} isPickup={isPickup} />
                                            </td>
                                            <td className="px-8 py-5 text-left">
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="inline-flex items-center gap-2 bg-stone-50 text-stone-600 hover:bg-david-green hover:text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    צפייה
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}



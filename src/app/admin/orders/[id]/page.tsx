import { getOrder } from "@/app/actions/order-actions";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { ArrowRight, MapPin, Phone, Mail, CreditCard, Package } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function OrderPage({ params }: { params: { id: string } }) {
    const order = await getOrder(params.id);

    if (!order) {
        notFound();
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header / Nav */}
            <div className="flex items-center gap-4 text-stone-500 mb-8">
                <Link href="/admin/orders" className="hover:text-david-green transition-colors">
                    <ArrowRight className="w-5 h-5" />
                </Link>
                <span className="text-sm">חזרה לרשימת ההזמנות</span>
            </div>

            {/* Title & Status */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-stone-200">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-serif text-stone-900">הזמנה #{order.id.slice(-8)}</h1>
                        <span className="bg-stone-100 text-stone-500 px-2 py-0.5 rounded text-xs font-mono">
                            {order.id}
                        </span>
                    </div>
                    <p className="text-stone-500">
                        התקבלה ב-{format(new Date(order.createdAt), "d בMMMM yyyy, HH:mm", { locale: he })}
                    </p>
                </div>

                <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Items */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                        <div className="bg-stone-50 px-6 py-4 border-b border-stone-100 flex items-center gap-2">
                            <Package className="w-5 h-5 text-stone-400" />
                            <h2 className="font-semibold text-stone-900">פריטים בהזמנה</h2>
                        </div>
                        <div className="divide-y divide-stone-100">
                            {order.items.map((item) => (
                                <div key={item.id} className="p-6 flex gap-4">
                                    <div className="w-20 h-24 bg-stone-100 rounded-lg shrink-0 overflow-hidden relative">
                                        {item.product.images[0] && (
                                            <img
                                                src={item.product.images[0].url}
                                                alt={item.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <h3 className="font-medium text-stone-900">{item.product.name}</h3>
                                            <span className="font-medium text-stone-900">₪{Number(item.price).toFixed(2)}</span>
                                        </div>
                                        <p className="text-sm text-stone-500 mb-2">כמות: {item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-stone-50 px-6 py-6 border-t border-stone-100 space-y-2">
                            <div className="flex justify-between text-sm text-stone-600">
                                <span>סה"כ פריטים</span>
                                <span>₪{Number(order.totalAmount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-stone-600">
                                <span>משלוח</span>
                                <span>₪0.00</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg text-stone-900 pt-2 border-t border-stone-200 mt-2">
                                <span>סה"כ לתשלום</span>
                                <span>₪{Number(order.totalAmount).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Message */}
                    {order.cardMessage && (
                        <div className="bg-white rounded-xl border border-stone-200 p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-1 h-full bg-david-green" />
                            <h3 className="font-semibold text-stone-900 mb-2">הודעה לכרטיס ברכה</h3>
                            <p className="text-stone-600 italic leading-relaxed">"{order.cardMessage}"</p>
                        </div>
                    )}
                </div>

                {/* Sidebar: Customer Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-6">
                        <h2 className="font-semibold text-stone-900 border-b border-stone-100 pb-3">פרטי משלוח</h2>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-stone-400 mt-0.5" />
                                <div>
                                    <div className="text-xs text-stone-400 mb-0.5">כתובת למשלוח</div>
                                    <div className="font-medium text-stone-900">{order.recipientName}</div>
                                    <div className="text-stone-600 text-sm leading-relaxed">{order.shippingAddress}</div>
                                    {order.deliveryNotes && (
                                        <div className="mt-2 text-amber-700 bg-amber-50 p-2 rounded text-xs border border-amber-100">
                                            <span className="font-bold block mb-1">הערות לשליח:</span>
                                            {order.deliveryNotes}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-stone-400" />
                                <div>
                                    <div className="text-xs text-stone-400 mb-0.5">טלפון מקבל</div>
                                    <div className="text-stone-900 text-sm dir-ltr text-right">
                                        <a href={`tel:${order.recipientPhone}`} className="hover:text-david-green hover:underline">
                                            {order.recipientPhone}
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {order.desiredDeliveryDate && (
                                <div className="flex items-center gap-3 border-t border-stone-100 pt-3 mt-3">
                                    <Package className="w-5 h-5 text-stone-400" />
                                    <div>
                                        <div className="text-xs text-stone-400 mb-0.5">מועד משלוח מבוקש</div>
                                        <div className="text-stone-900 text-sm font-medium">
                                            {format(new Date(order.desiredDeliveryDate), "EEEE, d בMMMM, HH:mm", { locale: he })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-6">
                        <h2 className="font-semibold text-stone-900 border-b border-stone-100 pb-3">פרטי המזמין</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-stone-400" />
                                <div>
                                    <div className="text-xs text-stone-400 mb-0.5">דוא"ל</div>
                                    <div className="text-stone-900 text-sm">{order.user?.email || order.ordererEmail}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-stone-400" />
                                <div>
                                    <div className="text-xs text-stone-400 mb-0.5">טלפון מזמין</div>
                                    <div className="text-stone-900 text-sm dir-ltr text-right">
                                        {order.ordererPhone ? (
                                            <a href={`tel:${order.ordererPhone}`} className="hover:text-david-green hover:underline">
                                                {order.ordererPhone}
                                            </a>
                                        ) : (
                                            <span className="text-stone-400 italic">לא צוין</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <CreditCard className="w-5 h-5 text-stone-400" />
                                <div>
                                    <div className="text-xs text-stone-400 mb-0.5">אמצעי תשלום</div>
                                    <div className="text-stone-900 text-sm">
                                        כרטיס אשראי
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { getOrder } from '@/app/actions/order-actions';
import OrderStatusSelect from '@/components/admin/OrderStatusSelect';
import { ArrowRight, Calendar, CreditCard, Mail, MapPin, Package, Phone, Printer, User } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
    const { success, data: order } = await getOrder(params.id);

    if (!success || !order) {
        notFound();
    }

    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 pb-24 md:pb-10">
            {/* Navigation & Header */}
            <div>
                <Link
                    href="/admin/orders"
                    className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors mb-6 group"
                >
                    <ArrowRight className="w-4 h-4 group-hover:-mr-1 transition-all" />
                    <span>חזרה להזמנות</span>
                </Link>

                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-stone-900 font-mono">#{order.id.slice(-6).toUpperCase()}</h1>
                            <span className="bg-stone-100 text-stone-600 text-xs px-2 py-1 rounded-full border border-stone-200">
                                {new Date(order.createdAt).toLocaleDateString('he-IL')}
                            </span>
                        </div>
                        <p className="text-stone-500">הזמנה מאת <span className="font-medium text-stone-900">{order.user.name || 'אורח'}</span></p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Status Select Wrapper */}
                        <div className="bg-white p-1 rounded-lg border border-stone-200 shadow-sm">
                            <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                        </div>

                        {/* Print Button - Future Implementation */}
                        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 transition-colors font-medium text-sm">
                            <Printer className="w-4 h-4" />
                            <span className="hidden sm:inline">הדפס הזמנה</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Items & Totals */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Order Items */}
                    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-stone-100 bg-stone-50/50">
                            <h2 className="font-bold text-stone-900 flex items-center gap-2">
                                <Package className="w-5 h-5 text-stone-400" />
                                פריטים בהזמנה
                            </h2>
                        </div>
                        <div className="divide-y divide-stone-100">
                            {order.items.map((item) => (
                                <div key={item.id} className="p-6 flex gap-4 md:gap-6 items-center">
                                    <div className="w-20 h-20 bg-stone-100 rounded-lg shrink-0 overflow-hidden border border-stone-100">
                                        {/* Placeholder for Item Image if we had it in OrderItem, falling back to basic icon or fetch */}
                                        <div className="w-full h-full flex items-center justify-center bg-stone-50 text-stone-300">
                                            <Package className="w-8 h-8" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-stone-900 text-lg">{item.product.name}</h3>
                                        <p className="text-sm text-stone-500">כמות: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-stone-900">₪{Number(item.price).toFixed(2)}</p>
                                        <span className="text-xs text-stone-400">סה"כ</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-4">
                        <div className="flex justify-between text-stone-600">
                            <span>סכום ביניים</span>
                            <span>₪{Number(order.totalAmount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-stone-600">
                            <span>משלוח</span>
                            <span>₪0.00</span>
                        </div>
                        <div className="pt-4 border-t border-stone-100 flex justify-between items-center text-lg font-bold text-stone-900">
                            <span>סה"כ לתשלום</span>
                            <span>₪{Number(order.totalAmount).toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Card Message */}
                    {order.cardMessage && (
                        <div className="bg-amber-50 rounded-xl border border-amber-100 p-6 space-y-2">
                            <h3 className="font-bold text-amber-900 text-sm uppercase tracking-wide">ברכה מצורפת</h3>
                            <p className="text-amber-800 font-serif text-lg leading-relaxed">
                                "{order.cardMessage}"
                            </p>
                        </div>
                    )}
                </div>

                {/* Sidebar: Customer & Shipping */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-stone-100 bg-stone-50/50">
                            <h2 className="font-bold text-stone-900 flex items-center gap-2 text-sm">
                                <User className="w-4 h-4 text-stone-400" />
                                פרטי לקוח
                            </h2>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                                    <span className="font-bold">{order.user.name?.[0] || '?'}</span>
                                </div>
                                <div>
                                    <div className="font-medium text-stone-900">{order.user.name || 'אורח'}</div>
                                    <div className="text-xs text-stone-500">לקוח רשום</div>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <a href={`mailto:${order.user.email}`} className="flex items-center gap-2 text-stone-600 hover:text-stone-900 p-2 rounded-md hover:bg-stone-50 transition-colors">
                                    <Mail className="w-4 h-4" />
                                    {order.user.email}
                                </a>
                                <div className="flex items-center gap-2 text-stone-600 p-2">
                                    <Phone className="w-4 h-4" />
                                    <span>050-0000000</span> {/* Placeholder phone */}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-stone-100 bg-stone-50/50">
                            <h2 className="font-bold text-stone-900 flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-stone-400" />
                                פרטי משלוח
                            </h2>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <span className="text-xs text-stone-400 uppercase tracking-wide">מקבל המשלוח</span>
                                <p className="font-medium text-stone-900">{order.recipientName}</p>
                            </div>
                            <div>
                                <span className="text-xs text-stone-400 uppercase tracking-wide">כתובת</span>
                                <p className="text-stone-700 leading-relaxed">{order.shippingAddress}</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="flex-1 bg-stone-900 text-white text-xs py-2 rounded hover:bg-stone-800 transition-colors">
                                    נווט לכתובת
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

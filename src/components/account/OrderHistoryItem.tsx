'use client';

import { useState } from 'react';
import { ChevronDown, Package } from 'lucide-react';
import Link from 'next/link';
import OrderTimeline from '@/components/orders/OrderTimeline';

import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

interface OrderHistoryItemProps {
    order: any;
}

export default function OrderHistoryItem({ order }: OrderHistoryItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const { addItem } = useCart();

    const isPickup = order.shippingAddress === 'Self Pickup';

    const statusLabels: Record<string, string> = {
        PENDING: 'ממתין',
        PAID: 'שולם',
        SHIPPED: isPickup ? 'מוכן לאיסוף' : 'נשלח',
        DELIVERED: isPickup ? 'נאסף' : 'נמסר',
        CANCELLED: 'בוטל',
    };

    const statusColors: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        PAID: 'bg-green-100 text-green-800',
        SHIPPED: 'bg-blue-100 text-blue-800',
        DELIVERED: 'bg-purple-100 text-purple-800',
        CANCELLED: 'bg-red-100 text-red-800',
    };

    const handleBuyAgain = (e: React.MouseEvent) => {
        e.stopPropagation();

        let count = 0;
        order.items.forEach((item: any) => {
            if (item.product) {
                addItem({
                    id: item.product.id,
                    productId: item.product.id,
                    name: item.product.name,
                    price: Number(item.price),
                    image: item.product.images?.[0]?.url || '/placeholder.jpg',
                    quantity: item.quantity,
                    type: 'ONETIME',
                    selectedSize: item.selectedSize, // Assuming this field exists on OrderItem or mapped correctly
                    sizeLabel: item.selectedSize // Simplified for now, mapped from selectedSize
                });
                count++;
            }
        });

        if (count > 0) {
            toast.success(`${count} פריטים נוספו לסל בהצלחה`);
        } else {
            toast.error('לא ניתן לשחזר את ההזמנה (ייתכן שהמוצרים הוסרו)');
        }
    };

    return (
        <div className="border-b border-stone-100 last:border-0">
            {/* Summary Row */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="grid grid-cols-2 md:grid-cols-6 gap-4 p-4 items-center cursor-pointer hover:bg-stone-50 transition-colors"
            >
                {/* Mobile: Top Row with ID and Status */}
                <div className="col-span-2 md:col-span-1 flex items-center gap-2">
                    <div className={`p-1 rounded-full bg-stone-100 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown className="w-4 h-4 text-stone-500" />
                    </div>
                    <span className="font-mono text-stone-500 text-sm">#{order.id.slice(-6).toUpperCase()}</span>
                </div>

                <div className="col-span-1 text-sm text-stone-600 hidden md:block">
                    {new Date(order.createdAt).toLocaleDateString('he-IL')}
                </div>

                <div className="col-span-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                        {statusLabels[order.status] || order.status}
                    </span>
                </div>

                <div className="col-span-1 text-sm font-medium hidden md:block">
                    ₪{Number(order.totalAmount).toFixed(2)}
                </div>

                <div className="col-span-2 md:col-span-1 text-sm text-stone-500 truncate hidden md:block">
                    {order.items.length} {order.items.length === 1 ? 'פריט' : 'פריטים'}
                </div>

                <div className="col-span-2 md:col-span-1 flex items-center justify-end gap-3 hidden md:flex">
                    <button
                        onClick={handleBuyAgain}
                        className="text-stone-900 text-xs font-bold border border-stone-200 px-3 py-1.5 rounded-full hover:bg-stone-900 hover:text-white transition-colors"
                    >
                        הזמן שוב
                    </button>
                    <Link
                        href={`/success?orderId=${order.id}`}
                        onClick={(e) => e.stopPropagation()} // Prevent expansion when clicking link
                        className="text-david-green text-xs font-bold hover:underline"
                    >
                        קבלה
                    </Link>
                </div>
            </div>

            {/* Expanded Details */}
            <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="p-6 bg-stone-50/50 space-y-6">
                        {/* Timeline */}
                        <div className="bg-white p-6 rounded-lg border border-stone-100 shadow-sm">
                            <h4 className="font-bold text-stone-900 mb-4 text-sm uppercase tracking-wider">
                                {isPickup ? 'סטטוס איסוף' : 'סטטוס משלוח'}
                            </h4>
                            <OrderTimeline status={order.status} isPickup={isPickup} />
                        </div>

                        {/* Order Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Items List */}
                            <div className="space-y-3">
                                <h4 className="font-bold text-stone-900 text-sm uppercase tracking-wider">פריטים בהזמנה</h4>
                                {order.items.map((item: any) => (
                                    <div key={item.id} className="flex gap-4 p-3 bg-white border border-stone-100 rounded-lg">
                                        <div className="w-12 h-12 bg-stone-100 rounded-sm relative overflow-hidden shrink-0">
                                            {item.product.images && item.product.images.length > 0 && (
                                                <img src={item.product.images[0].url} className="w-full h-full object-cover" alt={item.product.name} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-serif text-stone-900">{item.product.name}</p>
                                            <p className="text-xs text-stone-500">
                                                {item.quantity} x ₪{Number(item.price).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Shipping Info */}
                            <div className="space-y-3">
                                <h4 className="font-bold text-stone-900 text-sm uppercase tracking-wider">
                                    {isPickup ? 'פרטי איסוף' : 'פרטי משלוח'}
                                </h4>
                                <div className="bg-white p-4 border border-stone-100 rounded-lg text-sm space-y-2 text-stone-600">
                                    <p><span className="font-bold">נמען:</span> {order.recipientName}</p>
                                    <p><span className="font-bold">טלפון:</span> {order.recipientPhone}</p>
                                    <p>
                                        <span className="font-bold">{isPickup ? 'מיקום:' : 'כתובת:'}</span>{' '}
                                        {isPickup ? 'איסוף עצמי מהחנות (אשקלון)' : `${order.shippingAddress}`}
                                    </p>
                                    {order.notes && <p><span className="font-bold text-david-green">הערות:</span> {order.notes}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Mobile Actions */}
                        <div className="flex md:hidden justify-between items-center pt-2">
                            <button
                                onClick={handleBuyAgain}
                                className="text-stone-900 text-sm font-bold border border-stone-200 px-4 py-2 rounded-full hover:bg-stone-900 hover:text-white transition-colors"
                            >
                                הזמן שוב
                            </button>

                            <Link
                                href={`/success?orderId=${order.id}`}
                                className="text-david-green text-sm font-bold border border-david-green px-4 py-2 rounded-full"
                            >
                                צפייה בקבלה מלאה
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

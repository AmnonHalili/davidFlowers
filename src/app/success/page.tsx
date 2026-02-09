import Link from 'next/link';
import { CheckCircle2, Package, MapPin, Calendar, ArrowLeft } from 'lucide-react';
import { PrismaClient } from '@prisma/client';
import Image from 'next/image';
import PurchaseEvent from '@/components/analytics/PurchaseEvent';

const prisma = new PrismaClient();

async function getOrder(orderId: string) {
    return await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            images: true
                        }
                    }
                }
            }
        }
    });
}

export default async function SuccessPage({
    searchParams,
}: {
    searchParams?: {
        orderId?: string;
    };
}) {
    const orderId = searchParams?.orderId;

    if (!orderId) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-2xl font-bold mb-4">הזמנה לא נמצאה</h1>
                <Link href="/" className="text-david-green hover:underline">חזרה לדף הבית</Link>
            </div>
        );
    }

    const order = await getOrder(orderId);

    if (!order) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-2xl font-bold mb-4">שגיאה בטעינת ההזמנה</h1>
                <p className="text-stone-500 mb-6">לא הצלחנו למצוא את פרטי ההזמנה המבוקשת.</p>
                <Link href="/" className="text-david-green hover:underline">חזרה לדף הבית</Link>
            </div>
        );
    }

    const isPickup = order.shippingAddress === 'Self Pickup';

    return (
        <div className="min-h-screen bg-stone-50 pt-32 pb-20 px-4 rtl" dir="rtl">
            <div className="max-w-2xl mx-auto">

                {/* Status Card */}
                <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-8 text-center mb-6">
                    <PurchaseEvent
                        orderId={order.id}
                        total={Number(order.totalAmount)}
                        items={order.items.map(item => ({
                            item_id: item.productId,
                            item_name: item.product?.name || 'Unknown',
                            price: Number(item.price),
                            quantity: item.quantity
                        }))}
                    />
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="font-serif text-3xl font-bold text-stone-900 mb-2">תודה על ההזמנה!</h1>
                    <p className="text-stone-500 max-w-md mx-auto">
                        אישור הזמנה מספר <span className="font-mono font-bold text-stone-900">#{order.id.slice(-6).toUpperCase()}</span> נשלח אליך למייל.
                    </p>
                </div>

                {/* Delivery/Pickup Info */}
                <div className="bg-david-green/5 border border-david-green/10 rounded-xl p-6 mb-6 flex items-start gap-4">
                    <div className="p-2 bg-white rounded-full shrink-0">
                        {isPickup ? <MapPin className="w-5 h-5 text-david-green" /> : <Package className="w-5 h-5 text-david-green" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-david-green mb-1">
                            {isPickup ? 'מתי לאסוף?' : 'מתי זה מגיע?'}
                        </h3>
                        <p className="text-sm text-david-green/80 leading-relaxed">
                            {isPickup ? (
                                <>
                                    ההזמנה שלך התקבלה ותטופל בהקדם.
                                    <br />
                                    ניצור איתך קשר כשההזמנה תהיה מוכנה לאיסוף מהחנות.
                                </>
                            ) : (
                                <>
                                    ההזמנה שלך התקבלה ותטופל בהקדם.
                                    <br />
                                    משלוחים לאשקלון מגיעים בדרך כלל תוך 2-4 שעות מרגע האישור (בשעות הפעילות).
                                </>
                            )}
                        </p>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
                    <div className="p-6 border-b border-stone-100 bg-stone-50/50">
                        <h2 className="font-bold text-stone-900 flex items-center gap-2">
                            <Package className="w-4 h-4 text-stone-400" />
                            סיכום הזמנה
                        </h2>
                    </div>
                    <div className="divide-y divide-stone-100">
                        {order.items.map((item) => {
                            const image = item.product?.images?.[0]?.url || 'https://via.placeholder.com/100';
                            return (
                                <div key={item.id} className="p-6 flex gap-4 items-center">
                                    <div className="relative w-16 h-16 bg-stone-100 rounded-md overflow-hidden shrink-0">
                                        <Image
                                            src={image}
                                            alt="Product"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-serif text-stone-900 font-medium">{item.product?.name || 'מוצר ללא שם'}</h3>
                                        <p className="text-xs text-stone-500">כמות: {item.quantity}</p>
                                    </div>
                                    <div className="font-medium text-stone-900">
                                        ₪{Number(item.price).toFixed(0)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="p-6 bg-stone-50/50 space-y-3">
                        <div className="flex justify-between text-sm text-stone-600">
                            <span>סכום ביניים</span>
                            {/* We need to re-calc subtotal to show it, or assume total - shipping? 
                                Actually, checking order.items sum is safer if we don't have subtotal field. 
                            */}
                            <span>₪{order.items.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0).toFixed(2)}</span>
                        </div>

                        {!isPickup && (
                            <div className="flex justify-between text-sm text-stone-600">
                                <span>משלוח</span>
                                {/* Try to deduce shipping cost: Total - Subtotal - Discount? 
                                    Or just use the logic: if > 350 Free, else 30? 
                                    The user wanted to NOT show it for pickup. 
                                    For delivery, the previous logic was simple ternary. 
                                    Let's keep it simple for now or try to be more accurate if possible. 
                                    Let's stick to the previous hardcoded logic for now as requested fix was for Pickup.
                                */}
                                <span>{Number(order.totalAmount) - order.items.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0) <= 0 ? 'חינם' : `₪${(Number(order.totalAmount) - order.items.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0)).toFixed(2)}`}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-lg font-bold text-stone-900 pt-3 border-t border-stone-200">
                            <span>סה"כ לתשלום</span>
                            <span>₪{Number(order.totalAmount).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex gap-4 justify-center">
                    <Link
                        href="/shop"
                        className="flex items-center gap-2 text-stone-500 hover:text-david-green transition-colors px-6 py-3"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        חזרה לחנות
                    </Link>
                    <Link
                        href="/account/orders"
                        className="bg-stone-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-stone-800 transition-colors shadow-sm"
                    >
                        צפייה בהזמנות שלי
                    </Link>
                </div>

            </div>
        </div>
    );
}

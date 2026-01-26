'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, Lock, ShoppingBag, CheckCircle2, Loader2, Tag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import { getUpsellProducts } from '@/app/actions/product-actions';
import { getHolidayStatus } from '@/lib/holidays';

// Store Hours Utility Functions
function generateTimeSlots(dateString: string): string[] {
    if (!dateString) return [];

    const date = new Date(dateString);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

    // Check holiday status
    const holidayStatus = getHolidayStatus(date);

    // 1. Holiday (Chag) or Saturday -> Closed
    if (holidayStatus === 'CLOSED' || dayOfWeek === 6) {
        return [];
    }

    // Define slots based on day
    let slots: string[] = [];

    // 2. Friday OR Erev Chag -> Partial Day
    if (holidayStatus === 'FRIDAY_LIKE' || dayOfWeek === 5) {
        slots = [
            '08:00 - 11:00',
            '11:00 - 14:00'
        ];
    } else {
        // 3. Regular Days (Sunday - Thursday)
        slots = [
            '10:00 - 13:00',
            '13:00 - 16:00',
            '16:00 - 19:00'
        ];
    }

    // Filter out past slots if today
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
        const currentHour = now.getHours();

        slots = slots.filter(slot => {
            // Parse start time of the slot (e.g. "10:00" from "10:00 - 13:00")
            const startTimePart = slot.split(' - ')[0];
            const startHour = parseInt(startTimePart.split(':')[0], 10);

            return startHour > currentHour;
        });
    }

    return slots;
}


export default function CartDrawer() {
    const { isOpen, closeCart, items, removeItem, addItem, updateQuantity, cartTotal } = useCart();
    const [shippingMethod, setShippingMethod] = useState<'pickup' | 'delivery'>('delivery');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [address, setAddress] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [recipientPhone, setRecipientPhone] = useState('');

    // Orderer Details
    const [ordererName, setOrdererName] = useState('');
    const [ordererPhone, setOrdererPhone] = useState('');
    const [ordererEmail, setOrdererEmail] = useState('');

    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [deliveryNotes, setDeliveryNotes] = useState(''); // 🆕 הערות למשלוח
    const [upsellItems, setUpsellItems] = useState<any[]>([]);
    const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details'>('cart');

    // Coupon State
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; amount: number; type: string; id: string } | null>(null);
    const [couponLoading, setCouponLoading] = useState(false);

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setCouponLoading(true);
        const { validateCoupon } = await import('@/app/actions/coupon-actions');

        // Calculate subtotal for coupon validation
        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const res = await validateCoupon(couponCode, subtotal);
        if (res.success) {
            setAppliedCoupon({
                code: res.code!,
                amount: res.discountAmount!,
                type: res.discountType!,
                id: res.couponId!
            });
            toast.success('קופון הופעל בהצלחה');
        } else {
            toast.error(res.error || 'קופון לא תקין');
            setAppliedCoupon(null);
        }
        setCouponLoading(false);
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        toast.info('הקופון הוסר');
    };

    // Calculate available time slots based on selected date
    const availableTimeSlots = useMemo(() => generateTimeSlots(date), [date]);

    // Reset time when date changes if selected time is no longer valid
    useEffect(() => {
        if (date && time && !availableTimeSlots.includes(time)) {
            setTime('');
        }
    }, [date, availableTimeSlots, time]);


    useEffect(() => {
        if (isOpen) {
            // Load Upsells
            getUpsellProducts().then(res => {
                if (res.success) {
                    setUpsellItems(res.products.map(p => ({
                        id: p.id,
                        productId: p.id,
                        name: p.name,
                        price: Number(p.price),
                        image: p.images.find(i => i.isMain)?.url || p.images[0]?.url || '',
                        type: 'ONETIME',
                        quantity: 1
                    })));
                }
            });

            // Load User Profile (Address/Phone pre-fill)
            import('@/app/actions/user-actions').then(({ getUserProfile }) => {
                getUserProfile().then(user => {
                    if (user) {
                        setIsLoggedIn(true);
                        if (user.name) {
                            setOrdererName(user.name);
                        }
                        if (user.phone) {
                            setOrdererPhone(user.phone);
                        }
                        if (user.email) setOrdererEmail(user.email);
                        if (user.address) setAddress(user.address);
                    }
                });
            });
        }
    }, [isOpen]);

    const FREE_SHIPPING_THRESHOLD = 350;
    // Calculate totals locally to include discount
    const subtotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);
    const finalTotal = subtotal - (appliedCoupon?.amount || 0);

    const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
    const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

    const handleAddUpsell = (item: any) => {
        addItem({ ...item, id: `${item.id}-${Date.now()}` }); // Ensure unique ID
    };

    const handleCheckout = async () => {
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items,
                    shippingMethod,
                    shippingAddress: shippingMethod === 'delivery' ? address : 'Self Pickup',
                    recipientName,
                    recipientPhone,
                    ordererName,
                    ordererPhone,
                    ordererEmail,
                    desiredDeliveryDate: date && time ? new Date(`${date}T${time}`).toISOString() : null,
                    deliveryNotes: shippingMethod === 'delivery' ? deliveryNotes : null, // 🆕
                    couponId: appliedCoupon?.id,
                    shippingCost: shippingMethod === 'delivery' ? 30 : 0
                }),
            });

            if (!response.ok) throw new Error('Checkout failed');

            const data = await response.json();

            // Clear cart logic should be here (via context ideally, but maybe done in success page if we redirect)
            // For now, assume redirect handles it or user manually clears? 
            // In a better flow, backend doesn't clear cart. Frontend does if success.
            // But we'll just follow the redirect.
            window.location.href = data.url;
        } catch (error) {
            console.error('Checkout error:', error);
            alert('אירעה שגיאה במעבר לתשלום. אנא נסה שנית.');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeCart}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 bottom-0 w-full max-w-[500px] bg-white z-[70] flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-white z-10">
                            <h2 className="font-serif text-2xl text-stone-900">העגלה שלך</h2>
                            <button
                                onClick={closeCart}
                                className="p-2 -mr-2 text-stone-400 hover:text-stone-900 transition-colors rounded-full hover:bg-stone-50"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Free Shipping Progress Bar */}
                        <div className="px-8 py-5 bg-stone-50/50 border-b border-stone-100">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-medium text-stone-700">משלוח חינם</span>
                                <span className="text-xs text-stone-500 font-mono">{progress.toFixed(0)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5 }}
                                    className="h-full bg-david-green"
                                />
                            </div>
                            <p className="text-xs text-stone-500 mt-2 text-center">
                                {progress === 100 ? (
                                    <span className="text-david-green font-medium">מעולה! קיבלת משלוח חינם 🎉</span>
                                ) : (
                                    <span>עוד <span className="font-bold text-stone-900">₪{remainingForFreeShipping.toFixed(0)}</span> למשלוח חינם</span>
                                )}
                            </p>
                        </div>

                        {/* Items - Extended Scroll Area */}
                        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 scrollbar-hide">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 text-stone-300">
                                    <ShoppingBag className="w-16 h-16 opacity-20" strokeWidth={1} />
                                    <div className="space-y-2">
                                        <p className="text-stone-900 font-medium">העגלה שלך ריקה</p>
                                        <p className="text-sm">נראה שלא הוספת פריטים עדיין</p>
                                    </div>
                                    <button
                                        onClick={closeCart}
                                        className="text-stone-900 text-sm font-bold border-b-2 border-stone-900 pb-1 hover:text-david-green hover:border-david-green transition-colors"
                                    >
                                        התחל לקנות
                                    </button>
                                </div>
                            ) : (
                                <AnimatePresence mode="wait">
                                    {/* Step 1: Product List */}
                                    {checkoutStep === 'cart' && (
                                        <motion.div
                                            key="cart-step"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-6"
                                        >
                                            {items.map((item) => (
                                                <div key={item.id} className="flex gap-5 group">
                                                    {/* Image */}
                                                    <div className="relative w-24 h-32 bg-stone-100 shrink-0 overflow-hidden rounded-sm">
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                        />
                                                    </div>

                                                    {/* Details */}
                                                    <div className="flex-1 flex flex-col justify-between py-1">
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between items-start">
                                                                <h3 className="font-serif text-lg text-stone-900 leading-tight">{item.name}</h3>
                                                                <button
                                                                    onClick={() => removeItem(item.id)}
                                                                    className="text-stone-300 hover:text-red-400 transition-colors p-1"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                            {item.type === 'SUBSCRIPTION' ? (
                                                                <div className="inline-flex items-center gap-2 bg-stone-100 px-2 py-1 rounded text-[10px] font-medium text-stone-600">
                                                                    <span>מנוי {item.frequency === 'WEEKLY' ? 'שבועי' : 'דו-שבועי'}</span>
                                                                    <span className="w-1 h-1 bg-stone-400 rounded-full" />
                                                                    <span>{item.deliveryDay === 'THURSDAY' ? 'חמישי' : 'שישי'}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-stone-400">רכישה חד-פעמית</span>
                                                            )}
                                                        </div>

                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center border border-stone-200 rounded-sm">
                                                                <button
                                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                    className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                                                                >
                                                                    <Minus className="w-3 h-3" />
                                                                </button>
                                                                <span className="w-8 text-center text-sm font-medium text-stone-900">{item.quantity}</span>
                                                                <button
                                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                    className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                                                                >
                                                                    <Plus className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                            <span className="font-medium text-stone-900 text-lg">₪{(Number(item.price) || 0).toFixed(0)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Unified Upsell Section */}
                                            <div className="pt-8 border-t border-stone-100">
                                                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">לא לשכוח להוסיף</h3>
                                                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-8 px-8 snap-x">
                                                    {upsellItems.map((item) => (
                                                        <div key={item.id} className="snap-center min-w-[140px] border border-stone-200 rounded-lg p-3 flex flex-col gap-2 hover:border-stone-300 transition-colors bg-white">
                                                            <div className="aspect-square bg-stone-50 rounded-md overflow-hidden relative">
                                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                                <button
                                                                    onClick={() => handleAddUpsell(item)}
                                                                    className="absolute bottom-2 left-2 bg-white/90 p-1.5 rounded-full shadow-sm hover:bg-david-green hover:text-white transition-colors"
                                                                >
                                                                    <Plus className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-xs font-bold text-stone-900 line-clamp-1">{item.name}</h4>
                                                                <span className="text-xs text-stone-500">₪{item.price}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 2: Checkout Form */}
                                    {checkoutStep === 'details' && (
                                        <motion.div
                                            key="details-step"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-6"
                                        >
                                            <button
                                                onClick={() => setCheckoutStep('cart')}
                                                className="flex items-center text-sm text-stone-500 hover:text-stone-900 transition-colors"
                                            >
                                                <span className="ml-1">→</span> חזרה לעגלה
                                            </button>


                                            {/* Sleek Shipping Selector */}
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button
                                                        onClick={() => setShippingMethod('pickup')}
                                                        className={`p-4 rounded-lg border text-right transition-all duration-200 relative ${shippingMethod === 'pickup'
                                                            ? 'border-stone-900 bg-stone-900 text-white shadow-md'
                                                            : 'border-stone-200 text-stone-500 hover:border-stone-300 bg-white'
                                                            }`}
                                                    >
                                                        <span className="block text-sm font-bold mb-0.5">איסוף עצמי</span>
                                                        <span className={`text-[10px] ${shippingMethod === 'pickup' ? 'text-white/60' : 'text-stone-400'}`}>מהחנות באשקלון</span>
                                                        <span className="absolute top-4 left-4 text-xs font-bold">חינם</span>
                                                    </button>

                                                    <button
                                                        onClick={() => setShippingMethod('delivery')}
                                                        className={`p-4 rounded-lg border text-right transition-all duration-200 relative ${shippingMethod === 'delivery'
                                                            ? 'border-stone-900 bg-stone-900 text-white shadow-md'
                                                            : 'border-stone-200 text-stone-500 hover:border-stone-300 bg-white'
                                                            }`}
                                                    >
                                                        <span className="block text-sm font-bold mb-0.5">משלוח</span>
                                                        <span className={`text-[10px] ${shippingMethod === 'delivery' ? 'text-white/60' : 'text-stone-400'}`}>אשקלון בלבד</span>
                                                        <span className="absolute top-4 left-4 text-xs font-bold">₪30</span>
                                                    </button>
                                                </div>

                                                {/* Contact Details Split */}
                                                <div className="space-y-6 pt-2 border-t border-stone-100">

                                                    {/* 1. Orderer Details */}
                                                    <div className="space-y-3">
                                                        <p className="text-sm font-bold text-stone-900 flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-stone-900" />
                                                            פרטי המזמין
                                                        </p>
                                                        <div className="space-y-3">
                                                            <input
                                                                type="text"
                                                                value={ordererName}
                                                                onChange={(e) => setOrdererName(e.target.value)}
                                                                placeholder="שם מלא *"
                                                                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all placeholder:text-stone-400"
                                                            />
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <input
                                                                    type="tel"
                                                                    value={ordererPhone}
                                                                    onChange={(e) => setOrdererPhone(e.target.value)}
                                                                    placeholder="טלפון נייד *"
                                                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all placeholder:text-stone-400 text-right"
                                                                />
                                                                <input
                                                                    type="email"
                                                                    value={ordererEmail}
                                                                    onChange={(e) => setOrdererEmail(e.target.value)}
                                                                    placeholder="אימייל *"
                                                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all placeholder:text-stone-400 text-right"
                                                                />
                                                            </div>

                                                            {/* Create Account Checkbox - Only for Guests */}
                                                            {!isLoggedIn && (
                                                                <div className="flex items-center gap-2 pt-1">
                                                                    <input
                                                                        type="checkbox"
                                                                        id="create-account"
                                                                        className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                                                                    />
                                                                    <label htmlFor="create-account" className="text-xs text-stone-600 cursor-pointer select-none">
                                                                        פתח חשבון לשמירת הפרטים לפעם הבאה (אופציונלי)
                                                                    </label>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* 2. Recipient Details */}
                                                    <div className="space-y-3">
                                                        <p className="text-sm font-bold text-stone-900 flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-stone-900" />
                                                            פרטי מקבל המשלוח
                                                        </p>
                                                        <div className="space-y-3">
                                                            <input
                                                                type="text"
                                                                value={recipientName}
                                                                onChange={(e) => setRecipientName(e.target.value)}
                                                                placeholder="שם המקבל *"
                                                                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all placeholder:text-stone-400"
                                                            />
                                                            <input
                                                                type="tel"
                                                                value={recipientPhone}
                                                                onChange={(e) => setRecipientPhone(e.target.value)}
                                                                placeholder="טלפון המקבל *"
                                                                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all placeholder:text-stone-400 text-right"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Address Input - Moved Up */}
                                                <AnimatePresence>
                                                    {shippingMethod === 'delivery' && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden border-b border-stone-100 pb-3"
                                                        >
                                                            <input
                                                                type="text"
                                                                value={address}
                                                                onChange={(e) => setAddress(e.target.value)}
                                                                placeholder="כתובת למשלוח (רחוב, מספר, עיר) *"
                                                                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all placeholder:text-stone-400"
                                                            />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {/* Delivery Notes - Shows only for delivery */}
                                                <AnimatePresence>
                                                    {shippingMethod === 'delivery' && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="space-y-1 pt-3">
                                                                <label className="text-xs text-stone-500">
                                                                    הערות למשלוח (אופציונלי)
                                                                </label>
                                                                <textarea
                                                                    value={deliveryNotes}
                                                                    onChange={(e) => setDeliveryNotes(e.target.value)}
                                                                    placeholder="למשל: קוד כניסה לבניין, להשאיר ליד הדלת, לא לצלצל בפעמון..."
                                                                    maxLength={200}
                                                                    rows={3}
                                                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all placeholder:text-stone-400 resize-none"
                                                                />
                                                                <p className="text-xs text-stone-400 text-left">
                                                                    {deliveryNotes.length}/200 תווים
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {/* Delivery Date & Time Selection */}
                                                <div className="space-y-3 pt-2 border-t border-stone-100">
                                                    <p className="text-sm font-bold text-stone-900">מועד {shippingMethod === 'delivery' ? 'משלוח' : 'איסוף'} רצוי</p>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-stone-500">תאריך</label>
                                                            <input
                                                                type="date"
                                                                value={date}
                                                                min={(() => {
                                                                    const today = new Date();
                                                                    today.setDate(today.getDate() + 1);
                                                                    return today.toISOString().split('T')[0];
                                                                })()}
                                                                onChange={(e) => setDate(e.target.value)}
                                                                className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all text-stone-900"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-stone-500">
                                                                שעה
                                                            </label>
                                                            <select
                                                                value={time}
                                                                onChange={(e) => setTime(e.target.value)}
                                                                disabled={!date || availableTimeSlots.length === 0}
                                                                className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all text-stone-900 dir-rtl disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <option value="">בחירת שעה</option>
                                                                {availableTimeSlots.map((slot) => (
                                                                    <option key={slot} value={slot}>
                                                                        {slot}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            {date && availableTimeSlots.length === 0 && (
                                                                <p className="text-xs text-red-500 mt-1">
                                                                    אין משלוחים זמינים למועד זה.
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Payment Info Notice */}
                                                <div className="pt-2 border-t border-stone-100">
                                                    <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Lock className="w-4 h-4 text-stone-600" />
                                                            <p className="text-sm font-bold text-stone-900">תשלום מאובטח</p>
                                                        </div>
                                                        <p className="text-xs text-stone-500">התשלום יתבצע בכרטיס אשראי בסביבה מוצפנת ומאובטחת</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            )}
                        </div>

                        {/* Footer - Fixed at bottom */}
                        {items.length > 0 && (
                            <div className="p-8 border-t border-stone-100 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20 space-y-6">
                                <AnimatePresence mode="wait">
                                    {/* Totals Box for Cart View */}
                                    {checkoutStep === 'cart' && (
                                        <motion.div
                                            key="cart-footer"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 20 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-6"
                                        >
                                            <div className="space-y-4 pt-2">
                                                {/* Coupon Input */}
                                                {!appliedCoupon ? (
                                                    <div className="flex gap-2">
                                                        <div className="relative flex-1">
                                                            <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                                            <input
                                                                type="text"
                                                                value={couponCode}
                                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                                                placeholder="יש לך קוד קופון?"
                                                                className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 pr-10 pl-3 text-sm focus:outline-none focus:border-david-green uppercase"
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={handleApplyCoupon}
                                                            disabled={!couponCode || couponLoading}
                                                            className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                                                        >
                                                            {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'החל'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between bg-green-50 border border-green-100 p-3 rounded-lg animate-in fade-in zoom-in-95">
                                                        <div className="flex items-center gap-2 text-green-700">
                                                            <Tag className="w-4 h-4" />
                                                            <span className="font-bold text-sm tracking-wide">{appliedCoupon.code}</span>
                                                            <span className="text-xs bg-white px-1.5 py-0.5 rounded shadow-sm">
                                                                -{appliedCoupon.type === 'PERCENTAGE' ? '' : '₪'}{appliedCoupon.amount}{appliedCoupon.type === 'PERCENTAGE' ? '%' : ''}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={handleRemoveCoupon}
                                                            className="text-green-700 hover:bg-green-100 p-1.5 rounded-full transition-colors"
                                                            title="הסר קופון"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}

                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-center text-sm text-stone-600">
                                                        <span>סכום ביניים</span>
                                                        <span>₪{subtotal.toFixed(2)}</span>
                                                    </div>
                                                    {appliedCoupon && (
                                                        <div className="flex justify-between items-center text-sm text-green-600 font-medium">
                                                            <span>הנחה</span>
                                                            <span>-₪{appliedCoupon.amount.toFixed(2)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between items-center text-xl font-serif font-bold text-stone-900 pt-2 border-t border-stone-100">
                                                        <span>סה"כ לתשלום</span>
                                                        <span>₪{finalTotal.toFixed(2)}</span>
                                                    </div>
                                                    <p className="text-xs text-stone-500">לא כולל משלוח (יחושב בשלב הבא)</p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setCheckoutStep('details')}
                                                className="w-full bg-david-green text-david-beige py-4 text-sm font-bold tracking-widest uppercase hover:bg-david-green/90 transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
                                            >
                                                <span>המשך לפרטי משלוח</span>
                                                <span className="text-lg">→</span>
                                            </button>
                                        </motion.div>
                                    )}

                                    {/* Totals & Checkout Button for Details View */}
                                    {checkoutStep === 'details' && (
                                        <motion.div
                                            key="details-footer"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 20 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-6"
                                        >
                                            <div className="space-y-2 pt-2">
                                                <div className="flex justify-between text-stone-500 text-sm">
                                                    <span>סכום ביניים</span>
                                                    <span>₪{cartTotal.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-stone-500 text-sm">
                                                    <span>משלוח</span>
                                                    <span>{shippingMethod === 'delivery' ? '₪30.00' : 'חינם'}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xl font-serif font-bold text-stone-900 pt-3 border-t border-stone-100">
                                                    <span>סה"כ</span>
                                                    <span>₪{(cartTotal + (shippingMethod === 'delivery' ? 30 : 0)).toFixed(2)}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleCheckout}
                                                disabled={
                                                    recipientName.length < 2 ||
                                                    recipientPhone.length < 9 ||
                                                    ordererName.length < 2 ||
                                                    ordererPhone.length < 9 ||
                                                    ordererEmail.length < 5 ||
                                                    !date ||
                                                    !time ||
                                                    (shippingMethod === 'delivery' && address.length < 5)
                                                }
                                                className="w-full bg-david-green text-david-beige py-4 text-sm font-bold tracking-widest uppercase hover:bg-david-green/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
                                            >
                                                <Lock className="w-4 h-4" />
                                                <span>מעבר לתשלום מאובטח</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function ShoppingBagIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    )
}

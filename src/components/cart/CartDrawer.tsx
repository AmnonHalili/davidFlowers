/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, Lock, ShoppingBag, Loader2, Tag, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import { getUpsellProducts } from '@/app/actions/product-actions';
import { getUserProfile } from '@/app/actions/user-actions';
import { validateCoupon } from '@/app/actions/coupon-actions';
import { getHolidayStatus } from '@/lib/holidays';

// Store Hours Utility Functions
// Store Hours Utility Functions
function generateTimeSlots(dateString: string): { slots: string[], reason?: string } {
    if (!dateString) return { slots: [] };

    const date = new Date(dateString);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

    // Check holiday status
    const holidayStatus = getHolidayStatus(date);

    // 1. Holiday (Chag) or Saturday -> Closed
    if (holidayStatus === 'CLOSED') {
        return { slots: [], reason: 'החנות סגורה בחגים ומועדים.' };
    }

    if (dayOfWeek === 6) {
        return { slots: [], reason: 'החנות סגורה בשבת.' };
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

        // Cutoff for same-day delivery: 18:00 on weekdays, 12:00 on Friday
        const cutoffHour = (holidayStatus === 'FRIDAY_LIKE' || dayOfWeek === 5) ? 12 : 18;

        if (currentHour >= cutoffHour) {
            return { slots: [], reason: 'תם הזמן למשלוחים להיום. נא לבחור ויום אחר.' };
        }

        slots = slots.filter(slot => {
            // Parse end time of the slot (e.g. "13:00" from "10:00 - 13:00")
            const endTimePart = slot.split(' - ')[1];
            const endHour = parseInt(endTimePart.split(':')[0], 10);

            // Allow selecting a slot if it hasn't ended yet
            return endHour > currentHour;
        });

        if (slots.length === 0) {
            return { slots: [], reason: 'אין חלונות זמן פנויים להיום.' };
        }
    }

    return { slots };
}


const SHIPPING_COSTS: Record<string, number> = {
    'אשקלון': 25,
    'באר גנים': 45,
    'ניצנים': 45,
    'ניצן': 45,
    'הודיה': 45,
    'ברכיה': 45,
    'ניר ישראל': 45,
    'בית שקמה': 45,
    'בת הדר': 45,
    'כפר סילבר': 45
};

export default function CartDrawer() {
    const { isOpen, closeCart, items, removeItem, addItem, updateQuantity, cartTotal } = useCart();
    const { user: clerkUser, isSignedIn } = useUser();
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
    const [selectedCity, setSelectedCity] = useState('');
    const [deliveryNotes, setDeliveryNotes] = useState(''); // 🆕 הערות למשלוח
    const [newsletterConsent, setNewsletterConsent] = useState(true); // 🆕 הסכמה לדיוור
    interface UpsellItem {
        id: string;
        productId: string;
        name: string;
        price: number;
        image: string;
        type: 'ONETIME' | 'SUBSCRIPTION';
        quantity: number;
        originalPrice?: number;
    }
    const [upsellItems, setUpsellItems] = useState<UpsellItem[]>([]);
    const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details'>('cart');

    // Coupon State
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; amount: number; type: string; id: string } | null>(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [addedUpsellId, setAddedUpsellId] = useState<string | null>(null);

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setCouponLoading(true);
        // Calculate subtotal for coupon validation
        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // Calculate the "Constraint Date" for pre-orders
    const preOrderConstraintDate = useMemo(() => {
        const futureItems = items.filter(item => item.availableFrom && new Date(item.availableFrom) > new Date());
        if (futureItems.length === 0) return null;

        // Get the latest availableFrom date
        const latestLaunch = new Date(Math.max(...futureItems.map(item => new Date(item.availableFrom!).getTime())));
        return latestLaunch;
    }, [items]);

    const minDeliveryDate = useMemo(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        if (preOrderConstraintDate) {
            // Compare timestamps to be safe
            if (preOrderConstraintDate.getTime() > today.getTime()) {
                return preOrderConstraintDate.toISOString().split('T')[0];
            }
        }
        return todayStr;
    }, [preOrderConstraintDate]);

    // Reset time when date changes if selected time is no longer valid
    useEffect(() => {
        if (date && time && !availableTimeSlots.slots.includes(time)) {
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

            // 1. FAST PRE-FILL FROM CLERK (Immediate)
            if (isSignedIn && clerkUser) {
                setIsLoggedIn(true);
                if (!ordererName && clerkUser.fullName) setOrdererName(clerkUser.fullName);
                if (!ordererEmail && clerkUser.primaryEmailAddress?.emailAddress) {
                    setOrdererEmail(clerkUser.primaryEmailAddress.emailAddress);
                }
            }

            // 2. DETAILED PRE-FILL FROM DATABASE (Address, Phone)
            // 2. DETAILED PRE-FILL FROM DATABASE (Address, Phone)
            getUserProfile().then(user => {
                if (user) {
                    setIsLoggedIn(true);
                    if (user.name && !ordererName) setOrdererName(user.name);
                    if (user.phone && !ordererPhone) setOrdererPhone(user.phone);
                    if (user.email && !ordererEmail) setOrdererEmail(user.email);
                    if (user.address && !address) setAddress(user.address);
                }
            });
        }
    }, [isOpen, isSignedIn, clerkUser, address, ordererEmail, ordererName, ordererPhone]);

    const FREE_SHIPPING_THRESHOLD = 350;
    // Calculate totals locally to include discount
    const subtotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);

    // Calculate dynamic shipping cost
    const currentShippingCost = shippingMethod === 'delivery'
        ? (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : (SHIPPING_COSTS[selectedCity] || 45)) // Fallback to 45 (non-Ashkelon default)
        : 0;

    const finalTotal = subtotal - (appliedCoupon?.amount || 0);

    const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
    const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

    const handleAddUpsell = (item: UpsellItem) => {
        addItem({ ...item, id: `${item.id}-${Date.now()}` }); // Ensure unique ID
        setAddedUpsellId(item.id);
        setTimeout(() => setAddedUpsellId(null), 2000);
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
                    recipientName: shippingMethod === 'delivery' ? recipientName : ordererName,
                    recipientPhone: shippingMethod === 'delivery' ? recipientPhone : ordererPhone,
                    ordererName,
                    ordererPhone,
                    ordererEmail,
                    desiredDeliveryDate: date && time ? new Date(`${date}T${time.split(' - ')[0]}`).toISOString() : null,
                    deliveryNotes: shippingMethod === 'delivery' ? deliveryNotes : null, // 🆕
                    couponId: appliedCoupon?.id,
                    selectedCity: shippingMethod === 'delivery' ? selectedCity : null,
                    shippingCost: currentShippingCost,
                    newsletterConsent: newsletterConsent // 🆕
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
                                                            ) : null}
                                                            {item.personalizationText && (
                                                                <div className="mt-1 flex items-start gap-1 text-xs text-stone-500 bg-stone-50 p-1.5 rounded border border-stone-100">
                                                                    <span className="font-medium text-stone-700 min-w-fit">כיתוב:</span>
                                                                    <span className="italic break-words">"{item.personalizationText}"</span>
                                                                </div>
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
                                                            <div className="flex flex-col items-end">
                                                                <span className={`text-lg font-medium ${item.originalPrice && item.originalPrice > item.price ? 'text-rose-600' : 'text-stone-900'}`}>
                                                                    ₪{(Number(item.price) || 0).toFixed(0)}
                                                                </span>
                                                                {item.originalPrice && item.originalPrice > item.price && (
                                                                    <div className="flex items-center gap-1.5 opacity-60">
                                                                        <span className="text-xs bg-rose-100 text-rose-700 px-1 rounded font-bold">SALE</span>
                                                                        <span className="text-sm text-stone-400 line-through decoration-stone-300">₪{item.originalPrice.toFixed(0)}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
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
                                                        <span className={`text-[10px] ${shippingMethod === 'delivery' ? 'text-white/60' : 'text-stone-400'}`}>אשקלון והסביבה</span>
                                                        <span className="absolute top-4 left-4 text-xs font-bold">
                                                            {subtotal >= FREE_SHIPPING_THRESHOLD ? 'חינם' : selectedCity ? `₪${SHIPPING_COSTS[selectedCity] || 45}` : 'מ-₪25'}
                                                        </span>
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
                                                            {!isSignedIn && (
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

                                                            {/* Newsletter Opt-in (NEW) */}
                                                            <div className="flex items-start gap-2 pt-2 pb-1">
                                                                <input
                                                                    type="checkbox"
                                                                    id="newsletter"
                                                                    checked={newsletterConsent}
                                                                    onChange={(e) => setNewsletterConsent(e.target.checked)}
                                                                    className="w-4 h-4 mt-0.5 rounded border-stone-300 text-david-green focus:ring-david-green cursor-pointer"
                                                                />
                                                                <label htmlFor="newsletter" className="text-xs text-stone-600 cursor-pointer select-none leading-relaxed">
                                                                    אשמח לקבל עדכונים על מבצעים, הנחות ומוצרים חדשים (ניוזלטר) 💐
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 2. Recipient Details - Only for Delivery */}
                                                    <AnimatePresence>
                                                        {shippingMethod === 'delivery' && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="space-y-3 pt-3 border-t border-stone-100">
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
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
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
                                                            <div className="space-y-3">
                                                                <div className="space-y-1">
                                                                    <label className="text-xs text-stone-500">עיר / יישוב *</label>
                                                                    <select
                                                                        value={selectedCity}
                                                                        onChange={(e) => setSelectedCity(e.target.value)}
                                                                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all text-stone-900 dir-rtl"
                                                                    >
                                                                        <option value="">בחירת עיר...</option>
                                                                        {Object.keys(SHIPPING_COSTS).sort().map(city => (
                                                                            <option key={city} value={city}>
                                                                                {city} ({subtotal >= FREE_SHIPPING_THRESHOLD ? 'חינם' : `₪${SHIPPING_COSTS[city]}`})
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-xs text-stone-500">כתובת (רחוב ומספר בית) *</label>
                                                                    <input
                                                                        type="text"
                                                                        value={address}
                                                                        onChange={(e) => setAddress(e.target.value)}
                                                                        placeholder="לדוגמה: הרצל 10"
                                                                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all placeholder:text-stone-400"
                                                                    />
                                                                </div>
                                                            </div>
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
                                                                    return minDeliveryDate;
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
                                                                disabled={!date || availableTimeSlots.slots.length === 0}
                                                                className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all text-stone-900 dir-rtl disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <option value="">בחירת שעה</option>
                                                                {availableTimeSlots.slots.map((slot) => (
                                                                    <option key={slot} value={slot}>
                                                                        {slot}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            {date && availableTimeSlots.slots.length === 0 && (
                                                                <p className="text-xs text-red-500 mt-1 font-medium bg-red-50 p-2 rounded border border-red-100">
                                                                    {availableTimeSlots.reason || 'אין משלוחים זמינים למועד זה.'}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {preOrderConstraintDate && (
                                                        <div className="bg-david-green/5 border border-david-green/10 p-3 rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                                                            <div className="bg-david-green text-white text-[8px] font-bold px-1.5 py-0.5 rounded mt-0.5">INFO</div>
                                                            <p className="text-[11px] text-david-green/80 leading-relaxed">
                                                                מועד המשלוח הוגבל ל-{preOrderConstraintDate.toLocaleDateString('he-IL')} ומעלה עקב מוצרים בהזמנה מוקדמת הנמצאים בסל.
                                                            </p>
                                                        </div>
                                                    )}
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

                        {/* Footer - Fixed at bottom with Glassmorphism */}
                        {items.length > 0 && (
                            <div className="p-8 border-t border-white/50 bg-white/85 backdrop-blur-md shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-20 space-y-6">
                                {/* Coupon Input (Always Visible) */}
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
                                            {/* Upsell Section - Horizontal Scroll */}
                                            {upsellItems.length > 0 && (
                                                <div className="space-y-3 border-b border-stone-100/50 pb-5">
                                                    <div className="flex items-center justify-between px-1">
                                                        <h3 className="text-[10px] font-bold text-stone-900 uppercase tracking-widest opacity-80">שדרוגים מומלצים</h3>
                                                        <span className="text-[9px] text-stone-400">גלול למטה</span>
                                                    </div>
                                                    <div className="flex gap-2.5 overflow-x-auto scrollbar-hide py-1 -mx-2 px-2 snap-x mask-linear-fade">
                                                        {upsellItems.map((item) => (
                                                            <div key={item.id} className="snap-start shrink-0 w-16 flex flex-col gap-1 group cursor-pointer" onClick={() => handleAddUpsell(item)}>
                                                                <div className={`relative aspect-square rounded-md overflow-hidden bg-stone-50 border transition-all duration-300 ${addedUpsellId === item.id ? 'border-david-green ring-1 ring-david-green' : 'border-stone-200 group-hover:border-stone-400'}`}>
                                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />

                                                                    {/* Add Button / Success State */}
                                                                    <div className={`absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center transition-all duration-300 ${addedUpsellId === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                                                        <div className={`rounded-full p-1 shadow-sm transition-all duration-300 ${addedUpsellId === item.id ? 'bg-david-green text-white scale-110' : 'bg-white text-stone-900 scale-90'}`}>
                                                                            {addedUpsellId === item.id ? (
                                                                                <Check className="w-3 h-3" strokeWidth={3} />
                                                                            ) : (
                                                                                <Plus className="w-3 h-3" strokeWidth={2} />
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-center space-y-0.5 px-0.5">
                                                                    <p className="text-[9px] leading-tight font-medium text-stone-900 line-clamp-1">{item.name}</p>
                                                                    <p className="text-[9px] text-stone-500 font-mono">₪{item.price}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
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
                                                    <span>{'סה"כ לתשלום'}</span>
                                                    <span>₪{finalTotal.toFixed(2)}</span>
                                                </div>
                                                <p className="text-xs text-stone-500">לא כולל משלוח (יחושב בשלב הבא)</p>
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
                                                    <span>{currentShippingCost > 0 ? `₪${currentShippingCost.toFixed(2)}` : 'חינם'}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xl font-serif font-bold text-stone-900 pt-3 border-t border-stone-100">
                                                    <span>{'סה"כ'}</span>
                                                    <span>₪{(finalTotal + currentShippingCost).toFixed(2)}</span>
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
                                                    !time ||
                                                    (shippingMethod === 'delivery' && (!address || !selectedCity))
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
            )
            }
        </AnimatePresence >
    );
}

function ShoppingBagIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    )
}

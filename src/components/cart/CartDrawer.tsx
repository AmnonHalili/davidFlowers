/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, Lock, ShoppingBag, Loader2, Tag, Check, User, MapPin, Truck, ArrowLeft, ChevronRight } from 'lucide-react';
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
import { toZonedTime } from 'date-fns-tz';

// Store Hours Utility Functions
function generateTimeSlots(dateString: string): { slots: string[], reason?: string } {
    if (!dateString) return { slots: [] };

    // Parse the selected date (input is YYYY-MM-DD from date input)
    // We treat this string as a date in Israel Time
    const selectedDate = new Date(dateString);
    const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 6 = Saturday

    // Check holiday status
    const holidayStatus = getHolidayStatus(selectedDate);

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

    // Filter out past slots if today (Using Israel Time)
    const TIME_ZONE = 'Asia/Jerusalem';
    const nowWorld = new Date();
    const nowIsrael = toZonedTime(nowWorld, TIME_ZONE);

    // Check if selected date is "Today" in Israel
    const selectedDateStr = dateString; // YYYY-MM-DD

    // Format nowIsrael to YYYY-MM-DD manually or using string slice
    // toZonedTime returns a Date object representing the time in that zone
    const isToday = selectedDateStr === nowIsrael.toISOString().split('T')[0];

    if (isToday) {
        const currentHour = nowIsrael.getHours();

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
    const [cardMessage, setCardMessage] = useState(''); // ✉️ כרטיס ברכה
    const [isAnonymous, setIsAnonymous] = useState(false); // 🕵️‍♂️ הזמנה אנונימית
    const [newsletterConsent, setNewsletterConsent] = useState(true); // 🆕 הסכמה לדיוור

    const [upsellItems, setUpsellItems] = useState<UpsellItem[]>([]);
    const [checkoutStep, setCheckoutStep] = useState<'cart' | 'contact' | 'delivery'>('cart');

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
        const TIME_ZONE = 'Asia/Jerusalem';
        const nowWorld = new Date();
        const nowIsrael = toZonedTime(nowWorld, TIME_ZONE);

        const year = nowIsrael.getFullYear();
        const month = String(nowIsrael.getMonth() + 1).padStart(2, '0');
        const day = String(nowIsrael.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        if (preOrderConstraintDate) {
            // Check if constraint date is in the future relative to Israel Time logic
            const constraintTime = preOrderConstraintDate.getTime();
            const nowIsraelTime = nowIsrael.getTime();

            if (constraintTime > nowIsraelTime) {
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

    // -------------------------------------------------------------------------
    // 💾 AUTO-FILL FEATURE (Professional Implementation)
    // -------------------------------------------------------------------------

    // 1. Load from Storage on Mount (only if fields are empty and user is not fully logged in with conflicting data)
    useEffect(() => {
        if (isOpen && !isSignedIn) {
            try {
                const savedData = localStorage.getItem('davidFlowers_customerInfo');
                if (savedData) {
                    const parsed = JSON.parse(savedData);
                    // Only fill if state is currently empty to avoid overwriting user input
                    if (parsed.name && !ordererName) setOrdererName(parsed.name);
                    if (parsed.phone && !ordererPhone) setOrdererPhone(parsed.phone);
                    if (parsed.email && !ordererEmail) setOrdererEmail(parsed.email);
                    if (parsed.city && !selectedCity) setSelectedCity(parsed.city);
                    if (parsed.address && !address) setAddress(parsed.address);
                }
            } catch (error) {
                console.error('Failed to load saved customer info', error);
            }
        }
    }, [isOpen, isSignedIn]); // Run once when drawer opens

    // 2. Save to Storage on Change (Debounced for performance)
    useEffect(() => {
        // Don't save empty states if they haven't been touched, but here we just save what we have.
        // We only save if there is at least some data to avoid wiping storage on initial render
        if (!isOpen) return;

        const timer = setTimeout(() => {
            if (ordererName || ordererPhone || ordererEmail || address || selectedCity) {
                const infoToSave = {
                    name: ordererName,
                    phone: ordererPhone,
                    email: ordererEmail,
                    city: selectedCity,
                    address: address,
                    lastUpdated: new Date().toISOString()
                };
                localStorage.setItem('davidFlowers_customerInfo', JSON.stringify(infoToSave));
            }
        }, 1000); // 1 second debounce

        return () => clearTimeout(timer);
    }, [ordererName, ordererPhone, ordererEmail, address, selectedCity, isOpen]);

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
                    cardMessage: isAnonymous ? `${cardMessage}\n(נשלח באופן אנונימי)` : cardMessage, // ✉️
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
                        className="fixed top-0 right-0 bottom-0 w-full md:max-w-[500px] h-[100dvh] bg-stone-50 md:bg-white z-[70] flex flex-col shadow-2xl overflow-hidden"
                    >
                        {/* Mobile Step Header */}
                        <div className="md:hidden pt-4 pb-2 px-6 bg-white border-b border-stone-100">
                            <div className="flex justify-between items-center gap-2 mb-2">
                                {[
                                    { step: 'cart', label: 'עגלה' },
                                    { step: 'contact', label: 'פרטים' },
                                    { step: 'delivery', label: shippingMethod === 'delivery' ? 'משלוח' : 'איסוף' }
                                ].map((item, idx) => (
                                    <div key={item.step} className="flex-1 flex flex-col items-center gap-1.5">
                                        <div className={`h-1 w-full rounded-full transition-all duration-300 ${(checkoutStep === 'cart' && idx === 0) ||
                                            (checkoutStep === 'contact' && idx <= 1) ||
                                            (checkoutStep === 'delivery' && idx <= 2)
                                            ? 'bg-david-green' : 'bg-stone-100'
                                            }`} />
                                        <span className={`text-[10px] font-bold ${checkoutStep === item.step ? 'text-david-green' : 'text-stone-400'
                                            }`}>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Header */}
                        <div className="p-5 md:p-6 border-b border-stone-100 flex justify-between items-center bg-white z-10 shrink-0">
                            <div className="flex items-center gap-3">
                                {checkoutStep !== 'cart' && (
                                    <button
                                        onClick={() => setCheckoutStep(checkoutStep === 'delivery' ? 'contact' : 'cart')}
                                        className="p-1 -ml-1 text-stone-400 hover:text-stone-900 transition-colors"
                                    >
                                        <ChevronRight className="w-6 h-6 rotate-180" />
                                    </button>
                                )}
                                <h2 className="font-serif text-xl md:text-2xl text-stone-900">
                                    {checkoutStep === 'cart' ? 'העגלה שלך' :
                                        checkoutStep === 'contact' ? 'פרטי המזמין' : (shippingMethod === 'delivery' ? 'פרטי משלוח' : 'פרטי איסוף')}
                                </h2>
                            </div>
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
                                    {/* Step 1: Product List (Review) */}
                                    {checkoutStep === 'cart' && (
                                        <motion.div
                                            key="cart-step"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-6 pb-6"
                                        >
                                            {/* Shipping Type Toggle */}
                                            <div className="grid grid-cols-2 gap-4 p-1.5 bg-stone-100 rounded-2xl">
                                                <button
                                                    onClick={() => setShippingMethod('pickup')}
                                                    className={`py-3.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${shippingMethod === 'pickup' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                                                        }`}
                                                >
                                                    <MapPin className="w-4 h-4" />
                                                    איסוף עצמי
                                                </button>
                                                <button
                                                    onClick={() => setShippingMethod('delivery')}
                                                    className={`py-3.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${shippingMethod === 'delivery' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                                                        }`}
                                                >
                                                    <Truck className="w-4 h-4" />
                                                    משלוח
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {items.map((item) => (
                                                    <div key={item.id} className="flex gap-4 p-3 bg-white md:bg-transparent rounded-2xl md:rounded-none border border-stone-100 md:border-0 shadow-sm md:shadow-none group">
                                                        {/* Image */}
                                                        <div className="relative w-20 h-24 md:w-24 md:h-32 bg-stone-100 shrink-0 overflow-hidden rounded-xl md:rounded-sm">
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                            />
                                                        </div>

                                                        {/* Details */}
                                                        <div className="flex-1 flex flex-col justify-between py-0.5">
                                                            <div className="space-y-1">
                                                                <div className="flex justify-between items-start">
                                                                    <h3 className="font-serif text-base md:text-lg text-stone-900 leading-tight">{item.name}</h3>
                                                                    <button
                                                                        onClick={() => removeItem(item.id)}
                                                                        className="text-stone-300 hover:text-red-400 transition-colors p-1"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                                {item.type === 'SUBSCRIPTION' ? (
                                                                    <div className="inline-flex items-center gap-1.5 bg-stone-100 px-2 py-0.5 rounded text-[9px] font-bold text-stone-600">
                                                                        <span>מנוי {item.frequency === 'WEEKLY' ? 'שבועי' : 'דו-שבועי'}</span>
                                                                        <span className="w-1 h-1 bg-stone-400 rounded-full" />
                                                                        <span>{item.deliveryDay === 'THURSDAY' ? 'חמישי' : 'שישי'}</span>
                                                                    </div>
                                                                ) : null}
                                                                {item.personalizationText && (
                                                                    <div className="mt-1 flex items-start gap-1 text-[10px] md:text-xs text-stone-500 bg-stone-50 p-1.5 rounded border border-stone-100">
                                                                        <span className="font-medium text-stone-700 min-w-fit">כיתוב:</span>
                                                                        <span className="italic break-words">"{item.personalizationText}"</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex justify-between items-center mt-2">
                                                                <div className="flex items-center bg-stone-50 md:bg-white border border-stone-200 rounded-lg md:rounded-sm overflow-hidden">
                                                                    <button
                                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                        className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                                                                    >
                                                                        <Minus className="w-3 h-3" />
                                                                    </button>
                                                                    <span className="w-8 text-center text-xs font-bold text-stone-900">{item.quantity}</span>
                                                                    <button
                                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                        className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                                                                    >
                                                                        <Plus className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                                <div className="flex flex-col items-end">
                                                                    <span className={`text-base font-bold ${item.originalPrice && item.originalPrice > item.price ? 'text-rose-600' : 'text-stone-900'}`}>
                                                                        ₪{(Number(item.price) || 0).toFixed(0)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 2: Contact Details */}
                                    {checkoutStep === 'contact' && (
                                        <motion.div
                                            key="contact-step"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-8"
                                        >
                                            {/* Orderer Section */}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-8 h-8 bg-david-green/10 text-david-green rounded-full flex items-center justify-center">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-stone-900">פרטי המזמין</h3>
                                                </div>

                                                <div className="grid grid-cols-1 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[11px] font-bold text-stone-500 mr-1 italic">שם מלא *</label>
                                                        <input
                                                            type="text"
                                                            value={ordererName}
                                                            onChange={(e) => setOrdererName(e.target.value)}
                                                            placeholder="מי המזמין?"
                                                            className="w-full p-4 bg-white border border-stone-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-david-green/20 focus:border-david-green transition-all placeholder:text-stone-300"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-1.5">
                                                            <label className="text-[11px] font-bold text-stone-500 mr-1 italic">טלפון נייד *</label>
                                                            <input
                                                                type="tel"
                                                                value={ordererPhone}
                                                                onChange={(e) => setOrdererPhone(e.target.value)}
                                                                placeholder="לעדכונים על המשלוח"
                                                                className="w-full p-4 bg-white border border-stone-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-david-green/20 focus:border-david-green transition-all placeholder:text-stone-300 text-right"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[11px] font-bold text-stone-500 mr-1 italic">אימייל *</label>
                                                            <input
                                                                type="email"
                                                                value={ordererEmail}
                                                                onChange={(e) => setOrdererEmail(e.target.value)}
                                                                placeholder="לקבלת קבלה ואישור"
                                                                className="w-full p-4 bg-white border border-stone-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-david-green/20 focus:border-david-green transition-all placeholder:text-stone-300 text-right"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-stone-100 shadow-sm mt-4">
                                                    <input
                                                        type="checkbox"
                                                        id="newsletter"
                                                        checked={newsletterConsent}
                                                        onChange={(e) => setNewsletterConsent(e.target.checked)}
                                                        className="w-5 h-5 mt-0.5 rounded-full border-stone-300 text-david-green focus:ring-david-green cursor-pointer"
                                                    />
                                                    <label htmlFor="newsletter" className="text-sm text-stone-600 cursor-pointer select-none leading-relaxed">
                                                        אשמח לקבל עדכונים על מבצעים, הנחות ומוצרים חדשים (ניוזלטר) 💐
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Recipient Section (Only for Delivery) */}
                                            {shippingMethod === 'delivery' && (
                                                <div className="space-y-4 pt-4 border-t border-stone-100">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="w-8 h-8 bg-david-green/10 text-david-green rounded-full flex items-center justify-center">
                                                            <Tag className="w-4 h-4" />
                                                        </div>
                                                        <h3 className="text-lg font-bold text-stone-900">פרטי מקבל המשלוח</h3>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-1.5">
                                                            <label className="text-[11px] font-bold text-stone-500 mr-1 italic">שם המקבל *</label>
                                                            <input
                                                                type="text"
                                                                value={recipientName}
                                                                onChange={(e) => setRecipientName(e.target.value)}
                                                                placeholder="מי מקבל את הפרחים?"
                                                                className="w-full p-4 bg-white border border-stone-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-david-green/20 focus:border-david-green transition-all placeholder:text-stone-300"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[11px] font-bold text-stone-500 mr-1 italic">טלפון המקבל *</label>
                                                            <input
                                                                type="tel"
                                                                value={recipientPhone}
                                                                onChange={(e) => setRecipientPhone(e.target.value)}
                                                                placeholder="לתיאום המסירה"
                                                                className="w-full p-4 bg-white border border-stone-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-david-green/20 focus:border-david-green transition-all placeholder:text-stone-300 text-right"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* Step 3: Delivery Logistics */}
                                    {checkoutStep === 'delivery' && (
                                        <motion.div
                                            key="delivery-step"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-8"
                                        >

                                            {/* Delivery Logistics Content */}
                                            {shippingMethod === 'delivery' ? (
                                                <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                                                    {/* Location Section */}
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-1.5">
                                                                <label className="text-[11px] font-bold text-stone-500 mr-1 italic">עיר / יישוב *</label>
                                                                <select
                                                                    value={selectedCity}
                                                                    onChange={(e) => setSelectedCity(e.target.value)}
                                                                    className="w-full p-4 bg-white border border-stone-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-david-green/20 transition-all text-stone-900 dir-rtl"
                                                                >
                                                                    <option value="">בחירת עיר...</option>
                                                                    {Object.keys(SHIPPING_COSTS).sort().map(city => (
                                                                        <option key={city} value={city}>
                                                                            {city} ({subtotal >= FREE_SHIPPING_THRESHOLD ? 'חינם' : `₪${SHIPPING_COSTS[city]}`})
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[11px] font-bold text-stone-500 mr-1 italic">כתובת למשלוח *</label>
                                                                <input
                                                                    type="text"
                                                                    value={address}
                                                                    onChange={(e) => setAddress(e.target.value)}
                                                                    placeholder="רחוב ומספר בית"
                                                                    className="w-full p-4 bg-white border border-stone-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-david-green/20 transition-all"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <label className="text-[11px] font-bold text-stone-500 mr-1 italic">הערות למשלוח (קומה, קוד וכו')</label>
                                                            <textarea
                                                                value={deliveryNotes}
                                                                onChange={(e) => setDeliveryNotes(e.target.value)}
                                                                placeholder="למשל: בבניין עם קוד 1234, להשאיר ליד הדלת..."
                                                                rows={2}
                                                                className="w-full p-4 bg-white border border-stone-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-david-green/20 transition-all resize-none"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Date/Time Section */}
                                                    <div className="space-y-4 pt-4 border-t border-stone-100">
                                                        <p className="text-sm font-bold text-stone-900">מועד משלוח מבוקש</p>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-1.5">
                                                                <label className="text-[11px] font-bold text-stone-500 mr-1 italic">תאריך הגעה</label>
                                                                <input
                                                                    type="date"
                                                                    value={date}
                                                                    min={minDeliveryDate}
                                                                    onChange={(e) => setDate(e.target.value)}
                                                                    className="w-full p-4 bg-white border border-stone-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-david-green/20 transition-all text-stone-900"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[11px] font-bold text-stone-500 mr-1 italic">חלון זמן</label>
                                                                <select
                                                                    value={time}
                                                                    onChange={(e) => setTime(e.target.value)}
                                                                    disabled={!date || availableTimeSlots.slots.length === 0}
                                                                    className="w-full p-4 bg-white border border-stone-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-david-green/20 transition-all text-stone-900 dir-rtl disabled:opacity-50"
                                                                >
                                                                    <option value="">בחירת שעה</option>
                                                                    {availableTimeSlots.slots.map((slot) => (
                                                                        <option key={slot} value={slot}>{slot}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                        {!availableTimeSlots.slots.length && date && (
                                                            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm border border-red-100 font-medium tracking-tight">
                                                                {availableTimeSlots.reason || 'אין משלוחים זמינים למועד זה.'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                                                    <div className="p-6 bg-stone-100 rounded-3xl border border-stone-200 text-center space-y-3">
                                                        <MapPin className="w-8 h-8 text-stone-400 mx-auto" />
                                                        <div className="space-y-1">
                                                            <p className="font-bold text-stone-900 text-lg">איסוף עצמי מהחנות</p>
                                                            <p className="text-sm text-stone-500">העצמאות 58, אשקלון (פרחי דוד)</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <p className="text-sm font-bold text-stone-900">מתי תרצו לבוא לאסוף?</p>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <input
                                                                type="date"
                                                                value={date}
                                                                min={minDeliveryDate}
                                                                onChange={(e) => setDate(e.target.value)}
                                                                className="w-full p-4 bg-white border border-stone-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-david-green/20 transition-all text-stone-900"
                                                            />
                                                            <select
                                                                value={time}
                                                                onChange={(e) => setTime(e.target.value)}
                                                                disabled={!date || availableTimeSlots.slots.length === 0}
                                                                className="w-full p-4 bg-white border border-stone-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-david-green/20 transition-all text-stone-900 dir-rtl disabled:opacity-50"
                                                            >
                                                                <option value="">בחירת שעת איסוף</option>
                                                                {availableTimeSlots.slots.map((slot) => (
                                                                    <option key={slot} value={slot}>{slot}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Security Badge */}
                                            <div className="p-4 bg-stone-100 rounded-3xl flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                                    <Lock className="w-5 h-5 text-stone-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-stone-900">תשלום מאובטח PCI</p>
                                                    <p className="text-[10px] text-stone-500">המידע שלך מוצפן ומאובטח ברמה הגבוהה ביותר</p>
                                                </div>
                                            </div>

                                            {/* Greeting Card Section */}
                                            <div className="space-y-4 pt-6 mt-6 border-t border-stone-100">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                                        </div>
                                                        <h3 className="text-lg font-bold text-stone-900">כרטיס ברכה חגיגי</h3>
                                                    </div>
                                                    <span className={`text-[10px] font-mono ${cardMessage.length > 300 ? 'text-red-500' : 'text-stone-400'}`}>
                                                        {cardMessage.length}/350
                                                    </span>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                        {[
                                                            { label: 'מזל טוב! 🎂', text: 'מזל טוב! מאחל/ת לך המון בריאות, אושר ושמחה.' },
                                                            { label: 'יום הולדת שמח 🎉', text: 'יום הולדת שמח! שכל משאלות לבך יתגשמו.' },
                                                            { label: 'אוהב/ת אותך ❤️', text: 'רציתי רק להגיד כמה אני אוהב/ת אותך.' },
                                                            { label: 'תודה רבה 🙏', text: 'תודה רבה על הכל, מעריך/ה מאוד!' }
                                                        ].map((template) => (
                                                            <button
                                                                key={template.label}
                                                                type="button"
                                                                onClick={() => setCardMessage(template.text)}
                                                                className="py-1.5 px-2 bg-stone-50 border border-stone-100 rounded-lg text-[10px] text-stone-600 hover:border-david-green hover:bg-white transition-all text-center"
                                                            >
                                                                {template.label}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    <textarea
                                                        value={cardMessage}
                                                        onChange={(e) => setCardMessage(e.target.value.slice(0, 350))}
                                                        placeholder="כתבו כאן את הברכה שלכם (אופציונלי)..."
                                                        rows={4}
                                                        className="w-full p-4 bg-white border border-stone-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-david-green/20 focus:border-david-green transition-all resize-none placeholder:text-stone-300"
                                                    />

                                                    <label className="flex items-center gap-3 p-4 bg-amber-50/30 rounded-2xl border border-amber-100/50 cursor-pointer group hover:bg-amber-50/50 transition-colors">
                                                        <div className="relative flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={isAnonymous}
                                                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                                                className="sr-only"
                                                            />
                                                            <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${isAnonymous ? 'bg-david-green' : 'bg-stone-300'}`}>
                                                                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${isAnonymous ? '-translate-x-4' : 'translate-x-0'}`} />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-bold text-stone-900 group-hover:text-david-green transition-colors">שליחת כרטיס אנונימי</p>
                                                            <p className="text-[10px] text-stone-500">בחירה זו לא תחשוף את שמכם על גבי כרטיס הברכה</p>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            )}
                        </div>

                        {/* Footer - Optimized for Mobile Steps */}
                        {items.length > 0 && (
                            <div className="p-6 md:p-8 border-t border-white/50 bg-white/85 backdrop-blur-md shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-20 space-y-4 shrink-0">
                                {/* Coupon Input - Only on first step */}
                                {checkoutStep === 'cart' && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                                                        className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pr-10 pl-3 text-sm focus:outline-none focus:border-david-green uppercase"
                                                    />
                                                </div>
                                                <button
                                                    onClick={handleApplyCoupon}
                                                    disabled={!couponCode || couponLoading}
                                                    className="bg-stone-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-all hover:bg-black active:scale-[0.97]"
                                                >
                                                    {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'החל'}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between bg-green-50 border border-green-100 p-3 rounded-xl animate-in fade-in zoom-in-95">
                                                <div className="flex items-center gap-2 text-green-700">
                                                    <Tag className="w-4 h-4" />
                                                    <span className="font-bold text-sm tracking-wide">{appliedCoupon.code}</span>
                                                    <span className="text-xs bg-white px-1.5 py-0.5 rounded shadow-sm font-mono">
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
                                    </div>
                                )}

                                <AnimatePresence mode="wait">
                                    {/* Step 1 Footer */}
                                    {checkoutStep === 'cart' && (
                                        <motion.div
                                            key="cart-footer"
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            transition={{ duration: 0.15 }}
                                            className="space-y-4"
                                        >
                                            {/* Upsell Preview on Step 1 */}
                                            {upsellItems.length > 0 && (
                                                <div className="px-1 -mt-2">
                                                    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 -mx-2 px-2 mask-linear-fade">
                                                        {upsellItems.slice(0, 4).map((item) => (
                                                            <div key={item.id} className="shrink-0 w-14 group cursor-pointer" onClick={() => handleAddUpsell(item)}>
                                                                <div className={`relative aspect-square rounded-lg overflow-hidden bg-white border transition-all duration-300 ${addedUpsellId === item.id ? 'border-david-green ring-1 ring-david-green' : 'border-stone-100'}`}>
                                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                                    {addedUpsellId === item.id && (
                                                                        <div className="absolute inset-0 bg-david-green/20 flex items-center justify-center">
                                                                            <Check className="w-4 h-4 text-david-green bg-white rounded-full p-0.5" strokeWidth={4} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-sm font-medium text-stone-500">
                                                    <span>סכום ביניים</span>
                                                    <span>₪{subtotal.toFixed(0)}</span>
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <span className="text-xl md:text-2xl font-serif font-bold text-stone-900 italic tracking-tight">₪{finalTotal.toFixed(0)}</span>
                                                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">סה"כ בעגלה</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setCheckoutStep('contact')}
                                                        className="bg-david-green text-david-beige px-8 py-3.5 rounded-2xl text-sm font-bold tracking-widest hover:bg-david-green/90 transition-all shadow-xl shadow-david-green/20 active:scale-[0.98] flex items-center gap-2"
                                                    >
                                                        המשך לפרטים
                                                        <ArrowLeft className="w-4 h-4 rotate-180" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 2 Footer */}
                                    {checkoutStep === 'contact' && (
                                        <motion.div
                                            key="contact-footer"
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            transition={{ duration: 0.15 }}
                                            className="space-y-4"
                                        >
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <span className="text-xl md:text-2xl font-serif font-bold text-stone-900 italic tracking-tight">₪{finalTotal.toFixed(0)}</span>
                                                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">סכום לתשלום</p>
                                                </div>
                                                <button
                                                    onClick={() => setCheckoutStep('delivery')}
                                                    disabled={ordererName.length < 2 || ordererPhone.length < 9 || (shippingMethod === 'delivery' && (recipientName.length < 2 || recipientPhone.length < 9))}
                                                    className="bg-david-green text-david-beige px-8 py-3.5 rounded-2xl text-sm font-bold tracking-widest hover:bg-david-green/90 transition-all shadow-xl shadow-david-green/20 active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:grayscale"
                                                >
                                                    {shippingMethod === 'delivery' ? 'המשך למשלוח' : 'המשך לאיסוף'}
                                                    <ArrowLeft className="w-4 h-4 rotate-180" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 3 Footer */}
                                    {checkoutStep === 'delivery' && (
                                        <motion.div
                                            key="delivery-footer"
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            transition={{ duration: 0.15 }}
                                            className="space-y-4"
                                        >
                                            <div className="space-y-2 pt-1 border-t border-stone-100">
                                                <div className="flex justify-between text-stone-500 text-xs font-bold">
                                                    <span>סה"כ מוצרים</span>
                                                    <span>₪{finalTotal.toFixed(0)}</span>
                                                </div>
                                                <div className="flex justify-between text-stone-500 text-xs font-bold">
                                                    <span>דמי משלוח</span>
                                                    <span>{currentShippingCost > 0 ? `₪${currentShippingCost.toFixed(0)}` : 'חינם'}</span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center gap-4">
                                                <div>
                                                    <span className="text-2xl md:text-3xl font-serif font-bold text-stone-900 italic tracking-tight">₪{(finalTotal + currentShippingCost).toFixed(0)}</span>
                                                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">סה"כ לתשלום</p>
                                                </div>
                                                <button
                                                    onClick={handleCheckout}
                                                    disabled={
                                                        !time || !date || (shippingMethod === 'delivery' && (!address || !selectedCity))
                                                    }
                                                    className="flex-1 bg-stone-900 text-david-beige py-4 rounded-2xl text-sm font-bold tracking-widest hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    <Lock className="w-4 h-4" />
                                                    מעבר לתשלום
                                                </button>
                                            </div>
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

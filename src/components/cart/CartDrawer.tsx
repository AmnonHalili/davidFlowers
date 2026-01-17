'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, Lock, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getUpsellProducts } from '@/app/actions/product-actions';

export default function CartDrawer() {
    const { isOpen, closeCart, items, removeItem, addItem, updateQuantity, cartTotal } = useCart();
    const [shippingMethod, setShippingMethod] = useState<'pickup' | 'delivery'>('delivery');
    const [address, setAddress] = useState('');
    const [upsellItems, setUpsellItems] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen) {
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
        }
    }, [isOpen]);

    const FREE_SHIPPING_THRESHOLD = 350;
    const progress = Math.min((cartTotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
    const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - cartTotal;

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
                    shippingCost: shippingMethod === 'delivery' ? 30 : 0
                }),
            });

            if (!response.ok) throw new Error('Checkout failed');

            const data = await response.json();
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
                                <>
                                    {/* Product List */}
                                    <div className="space-y-6">
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
                                                        <span className="font-medium text-stone-900 text-lg">₪{item.price.toFixed(0)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

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
                                </>
                            )}
                        </div>

                        {/* Footer - Fixed at bottom */}
                        {items.length > 0 && (
                            <div className="p-8 border-t border-stone-100 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20 space-y-6">

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

                                    {/* Address Input */}
                                    <AnimatePresence>
                                        {shippingMethod === 'delivery' && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <input
                                                    type="text"
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                    placeholder="הזן כתובת מלאה למשלוח..."
                                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all placeholder:text-stone-400"
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Totals */}
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

                                {/* Checkout Button */}
                                <button
                                    onClick={handleCheckout}
                                    disabled={shippingMethod === 'delivery' && address.length < 5}
                                    className="w-full bg-david-green text-david-beige py-4 text-sm font-bold tracking-widest uppercase hover:bg-david-green/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
                                >
                                    <Lock className="w-4 h-4" />
                                    <span>מעבר לתשלום</span>
                                </button>
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

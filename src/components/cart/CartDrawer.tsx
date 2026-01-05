'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, Lock } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';

export default function CartDrawer() {
    const { isOpen, closeCart, items, removeItem, cartTotal } = useCart();

    const handleCheckout = async () => {
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items }),
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
                        className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[70] flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-white">
                            <h2 className="font-serif text-xl text-stone-900">העגלה שלך</h2>
                            <button
                                onClick={closeCart}
                                className="p-2 -mr-2 text-stone-400 hover:text-stone-900 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-stone-400">
                                    <div className="w-16 h-16 rounded-full bg-stone-50 flex items-center justify-center mb-2">
                                        <ShoppingBagIcon />
                                    </div>
                                    <p>העגלה שלך ריקה כרגע.</p>
                                    <button
                                        onClick={closeCart}
                                        className="text-stone-900 font-medium underline underline-offset-4"
                                    >
                                        חזרה לחנות
                                    </button>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        {/* Image */}
                                        <div className="relative w-20 h-24 bg-stone-100 shrink-0 overflow-hidden">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-serif text-stone-900">{item.name}</h3>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="text-stone-300 hover:text-red-400 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                {item.type === 'SUBSCRIPTION' && (
                                                    <div className="text-xs text-stone-500 mt-1 space-x-2 rtl:space-x-reverse">
                                                        <span className="bg-stone-100 px-1.5 py-0.5 rounded">מנוי {item.frequency === 'WEEKLY' ? 'שבועי' : 'דו-שבועי'}</span>
                                                        <span>לימי {item.deliveryDay}</span>
                                                    </div>
                                                )}
                                                {item.type === 'ONETIME' && (
                                                    <span className="text-xs text-stone-400 mt-1 block">רכישה חד-פעמית</span>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-end">
                                                <div className="flex items-center gap-3 border border-stone-200 px-2 py-1">
                                                    <button className="text-stone-400 hover:text-stone-900"><Minus className="w-3 h-3" /></button>
                                                    <span className="text-xs w-2 text-center">{item.quantity}</span>
                                                    <button className="text-stone-400 hover:text-stone-900"><Plus className="w-3 h-3" /></button>
                                                </div>
                                                <span className="font-medium text-stone-900">₪{item.price.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-6 border-t border-stone-100 bg-stone-50 space-y-4">
                                <div className="flex justify-between items-center text-lg font-serif">
                                    <span>סה"כ לתשלום:</span>
                                    <span>₪{cartTotal.toFixed(2)}</span>
                                </div>
                                <p className="text-[10px] text-stone-400 text-center">
                                    המשלוח מחושב בשלב הבא
                                </p>
                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-stone-900 text-white py-4 font-medium tracking-wide flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors"
                                >
                                    <Lock className="w-4 h-4" />
                                    <span>מעבר לתשלום מאובטח</span>
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

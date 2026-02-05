'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function PromoPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [hasBeenShown, setHasBeenShown] = useState(true); // Default to true to prevent flash
    const [copied, setCopied] = useState(false);

    const DISCOUNT_CODE = 'FIRST10';

    useEffect(() => {
        // Check if already shown in this session or previously
        const shown = localStorage.getItem('promo_popup_shown');
        if (!shown) {
            setHasBeenShown(false);

            // Show after 5 seconds OR on exit intent
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 5000);

            const handleExitIntent = (e: MouseEvent) => {
                if (e.clientY <= 0) {
                    setIsVisible(true);
                    document.removeEventListener('mouseleave', handleExitIntent);
                }
            };

            document.addEventListener('mouseleave', handleExitIntent);

            return () => {
                clearTimeout(timer);
                document.removeEventListener('mouseleave', handleExitIntent);
            };
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('promo_popup_shown', 'true');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(DISCOUNT_CODE);
        setCopied(true);
        toast.success('הקופון הועתק! השתמשו בו בקופה');
        setTimeout(() => setCopied(false), 2000);

        // Auto close after copy briefly? Or let them close?
        // Let's keep it open for a second so they see the success
        setTimeout(handleClose, 1500);
    };

    if (hasBeenShown && !isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-stone-900 text-white rounded-2xl overflow-hidden shadow-2xl border border-stone-800"
                    >
                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-stone-400 hover:text-white transition-colors z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Top Decoration */}
                        <div className="h-2 bg-gradient-to-r from-david-green via-david-green/80 to-david-green" />

                        <div className="p-8 space-y-6 text-center">
                            <div className="mx-auto w-16 h-16 bg-david-green/20 rounded-full flex items-center justify-center mb-2">
                                <Gift className="w-8 h-8 text-david-green" strokeWidth={1.5} />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-3xl font-serif text-david-beige">מתנה מאיתנו!</h2>
                                <p className="text-stone-400 text-sm">
                                    קבלו <span className="text-white font-bold">10% הנחה</span> על ההזמנה הראשונה שלכם באתר.
                                </p>
                            </div>

                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-david-green/30 to-david-green/30 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                <div
                                    onClick={handleCopy}
                                    className="relative flex items-center justify-between bg-stone-800 border-2 border-dashed border-stone-700 rounded-lg px-6 py-4 cursor-pointer hover:border-david-green/50 transition-all active:scale-[0.98]"
                                >
                                    <span className="text-2xl font-mono font-bold tracking-[0.2em] text-david-green">
                                        {DISCOUNT_CODE}
                                    </span>
                                    {copied ? (
                                        <Check className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <Copy className="w-5 h-5 text-stone-500 group-hover:text-david-green transition-colors" />
                                    )}
                                </div>
                            </div>

                            <p className="text-[10px] text-stone-500 uppercase tracking-widest font-medium">לחצו להעתקת הקוד ולהמשך קנייה</p>

                            <button
                                onClick={handleClose}
                                className="w-full py-4 text-sm font-bold tracking-widest uppercase border border-stone-700 hover:bg-stone-800 transition-colors rounded-lg"
                            >
                                לא תודה, אולי אחר כך
                            </button>
                        </div>

                        {/* Bottom Detail */}
                        <div className="bg-stone-800/50 p-4 text-center">
                            <p className="text-[11px] text-stone-400">
                                * בתוקף לרכישה ראשונה בלבד • ללא כפל מבצעים
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

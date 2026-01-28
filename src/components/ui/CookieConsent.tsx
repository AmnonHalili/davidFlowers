'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Cookie as CookieIcon, X } from 'lucide-react';
import Link from 'next/link';

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        // Check local storage on mount
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            // Delay slightly for better UX (don't pop immediately on load)
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        } else if (consent === 'true') {
            loadScripts();
        }
    }, []);

    const loadScripts = () => {
        // Here we would load the actual 3rd party scripts
        // Example:
        // if (typeof window !== 'undefined') {
        //     console.log('Loading 3rd party scripts (GA, Pixel, Hotjar)...');
        //     // Insert script tags here
        // }
    };

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'true');
        loadScripts();
        setIsVisible(false);
    };

    const handleDecline = () => {
        // "Decline" in this basic implementation just closes the banner without saving 'true'
        // Ideally, we might save 'false' to remember the choice, but requirement says "Re-visiting: Do not show if value exists".
        // The user only specified "Accept All". For "Settings", we'll just show a placeholder or basic toggles.
        // For compliant blocking, if they decline/save settings as 'false', we don't load scripts.
        localStorage.setItem('cookieConsent', 'false');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-0 md:bottom-6 left-0 right-0 md:left-auto md:right-6 md:w-[400px] z-[60] p-4 md:p-0"
                >
                    <div className="bg-white/95 backdrop-blur-md shadow-2xl border border-white/20 rounded-2xl overflow-hidden glass-panel">
                        <div className="p-6 relative">
                            {/* Decorative Background Blob */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-david-green/5 rounded-full blur-3xl" />

                            {!isSettingsOpen ? (
                                <>
                                    <div className="flex items-start gap-4 mb-4 relative z-10">
                                        <div className="w-10 h-10 rounded-full bg-david-green/10 flex items-center justify-center shrink-0">
                                            <CookieIcon className="w-5 h-5 text-david-green" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-stone-900 text-lg">חוויית גלישה מותאמת אישית</h3>
                                            <p className="text-sm text-stone-500 leading-relaxed text-balance">
                                                אנחנו משתמשים בקבצי Cookies כדי לשפר את חוויית הגלישה שלך ולהציג לך תכנים שמותאמים בדיוק למה שאתה אוהב.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-3 pt-2">
                                        <button
                                            onClick={handleAccept}
                                            className="flex-1 bg-david-green text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-[#1B3322]/90 transition-colors shadow-sm active:scale-[0.98]"
                                        >
                                            אישור והמשך
                                        </button>
                                        <button
                                            onClick={() => setIsSettingsOpen(true)}
                                            className="px-4 py-2.5 text-sm text-stone-600 font-medium hover:bg-stone-50 rounded-lg transition-colors border border-transparent hover:border-stone-100"
                                        >
                                            הגדרות
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold text-stone-900">הגדרות עוגיות</h4>
                                        <button onClick={() => setIsSettingsOpen(false)} className="text-stone-400 hover:text-stone-600">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-stone-50 border border-stone-100">
                                            <span className="text-sm font-medium text-stone-700">נחוצים (תמיד פעיל)</span>
                                            <div className="w-10 h-5 bg-david-green/40 rounded-full relative cursor-not-allowed opacity-60">
                                                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-stone-100">
                                            <span className="text-sm font-medium text-stone-700">אנליטיקה ושיפורים</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" defaultChecked disabled className="sr-only peer" />
                                                <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-david-green"></div>
                                            </label>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-stone-100">
                                            <span className="text-sm font-medium text-stone-700">שיווק ופרסום</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" defaultChecked disabled className="sr-only peer" />
                                                <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-david-green"></div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleAccept}
                                            className="flex-1 bg-david-green text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-[#1B3322]/90 transition-colors shadow-sm"
                                        >
                                            שמור העדפות
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

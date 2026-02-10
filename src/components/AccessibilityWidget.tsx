'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sliders as SettingsIcon, Type, Sun, Eye, RotateCcw, X } from 'lucide-react';

export default function AccessibilityWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [settings, setSettings] = useState({
        largeText: false,
        highContrast: false,
        grayscale: false,
        readableFont: false,
    });

    // Apply settings to document
    useEffect(() => {
        const root = document.documentElement;

        // Font Size
        if (settings.largeText) {
            root.style.fontSize = '125%';
        } else {
            root.style.removeProperty('font-size');
        }

        // Grayscale
        if (settings.grayscale) {
            root.style.filter = 'grayscale(100%)';
        } else {
            root.style.removeProperty('filter');
        }

        // High Contrast - Simple implementation leveraging CSS variables if possible or forcing simple colors
        if (settings.highContrast) {
            root.classList.add('high-contrast');
        } else {
            root.classList.remove('high-contrast');
        }

        // Readable Font (Force Sans Serif)
        if (settings.readableFont) {
            root.classList.add('readable-font');
        } else {
            root.classList.remove('readable-font');
        }

    }, [settings]);

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const resetSettings = () => {
        setSettings({
            largeText: false,
            highContrast: false,
            grayscale: false,
            readableFont: false,
        });
    };

    return (
        <>
            {/* Minimal Side Tab */}
            <motion.button
                onClick={() => setIsOpen(true)}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                whileHover={{ x: 4 }}
                className={`fixed left-0 top-1/3 z-[100] bg-stone-900/60 backdrop-blur-md text-white p-2 md:p-2.5 md:pr-3 rounded-r-xl border border-l-0 border-white/10 shadow-2xl transition-all ${isOpen ? 'hidden' : 'flex'} items-center group`}
                aria-label="אפשרויות נגישות"
                title="נגישות"
            >
                <div className="flex flex-col items-center gap-1">
                    <SettingsIcon className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                    <span className="hidden md:block [writing-mode:vertical-lr] text-[8px] uppercase tracking-widest font-bold opacity-40 group-hover:opacity-70 transition-opacity rotate-180">Accessibility</span>
                </div>
            </motion.button>

            {/* Widget Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/5 backdrop-blur-[2px] z-[110]"
                        />

                        {/* Panel - Emerging from Left */}
                        <motion.div
                            initial={{ x: -320, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -320, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-80 bg-white z-[120] shadow-[10px_0_50px_rgba(0,0,0,0.1)] border-r border-stone-100 flex flex-col"
                        >
                            {/* Header */}
                            <div className="bg-stone-900 text-white p-6 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-lg">
                                        <SettingsIcon className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-serif text-lg leading-tight">נגישות באתר</span>
                                        <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Accessibility Center</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Options Scrollable */}
                            <div className="flex-grow overflow-y-auto p-6 space-y-3">
                                <div className="space-y-1 mb-4">
                                    <h4 className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.2em]">חוויית משתמש</h4>
                                    <p className="text-xs text-stone-500">התאימו את האתר לצרכים שלכם</p>
                                </div>

                                <button
                                    onClick={() => toggleSetting('largeText')}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${settings.largeText ? 'bg-stone-900 border-stone-900 text-white shadow-md' : 'border-stone-100 hover:border-stone-200 text-stone-600 bg-stone-50/50'}`}
                                >
                                    <div className={`p-2 rounded-lg ${settings.largeText ? 'bg-white/20' : 'bg-white'}`}>
                                        <Type className="w-5 h-5" />
                                    </div>
                                    <span className="font-medium">הגדלת טקסט</span>
                                    {settings.largeText && <div className="mr-auto w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
                                </button>

                                <button
                                    onClick={() => toggleSetting('grayscale')}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${settings.grayscale ? 'bg-stone-900 border-stone-900 text-white shadow-md' : 'border-stone-100 hover:border-stone-200 text-stone-600 bg-stone-50/50'}`}
                                >
                                    <div className={`p-2 rounded-lg ${settings.grayscale ? 'bg-white/20' : 'bg-white'}`}>
                                        <Eye className="w-5 h-5" />
                                    </div>
                                    <span className="font-medium">גווני אפור</span>
                                    {settings.grayscale && <div className="mr-auto w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
                                </button>

                                <button
                                    onClick={() => toggleSetting('highContrast')}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${settings.highContrast ? 'bg-stone-900 border-stone-900 text-white shadow-md' : 'border-stone-100 hover:border-stone-200 text-stone-600 bg-stone-50/50'}`}
                                >
                                    <div className={`p-2 rounded-lg ${settings.highContrast ? 'bg-white/20' : 'bg-white'}`}>
                                        <Sun className="w-5 h-5" />
                                    </div>
                                    <span className="font-medium">ניגודיות גבוהה</span>
                                    {settings.highContrast && <div className="mr-auto w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
                                </button>

                                <button
                                    onClick={() => toggleSetting('readableFont')}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${settings.readableFont ? 'bg-stone-900 border-stone-900 text-white shadow-md' : 'border-stone-100 hover:border-stone-200 text-stone-600 bg-stone-50/50'}`}
                                >
                                    <div className={`p-2 rounded-lg ${settings.readableFont ? 'bg-white/20' : 'bg-white'}`}>
                                        <span className="font-sans text-lg font-bold w-5 text-center">א</span>
                                    </div>
                                    <span className="font-medium">גופן קריא</span>
                                    {settings.readableFont && <div className="mr-auto w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
                                </button>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-stone-100 bg-stone-50/50 mt-auto">
                                <button
                                    onClick={resetSettings}
                                    className="w-full flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold text-stone-400 hover:text-stone-900 transition-colors py-3"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>איפוס כל ההגדרות</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

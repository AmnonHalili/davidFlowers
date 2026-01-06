'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Accessibility, Type, Sun, Eye, RotateCcw, X } from 'lucide-react';

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
            {/* Toggle Button */}
            <motion.button
                onClick={() => setIsOpen(true)}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className={`fixed bottom-6 left-6 z-40 bg-stone-900 text-white p-3 rounded-full shadow-lg hover:bg-stone-800 transition-colors ${isOpen ? 'hidden' : 'flex'}`}
                aria-label="אפשרויות נגישות"
                title="נגישות"
            >
                <Accessibility className="w-6 h-6" strokeWidth={1.5} />
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
                            className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-40"
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.9 }}
                            className="fixed bottom-6 left-6 z-50 w-72 bg-white rounded-xl shadow-2xl border border-stone-100 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="bg-stone-900 text-white p-4 flex justify-between items-center">
                                <span className="font-serif text-lg tracking-wide">נגישות באתר</span>
                                <button onClick={() => setIsOpen(false)} className="hover:opacity-70">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Options */}
                            <div className="p-4 space-y-2">
                                <button
                                    onClick={() => toggleSetting('largeText')}
                                    className={`w-full flex items-center gap-4 p-3 rounded-lg transition-colors ${settings.largeText ? 'bg-stone-100 text-stone-900 font-medium' : 'hover:bg-stone-50 text-stone-600'}`}
                                >
                                    <Type className="w-5 h-5" />
                                    <span>הגדלת טקסט</span>
                                    {settings.largeText && <span className="mr-auto text-xs text-green-600 font-bold">פעיל</span>}
                                </button>

                                <button
                                    onClick={() => toggleSetting('grayscale')}
                                    className={`w-full flex items-center gap-4 p-3 rounded-lg transition-colors ${settings.grayscale ? 'bg-stone-100 text-stone-900 font-medium' : 'hover:bg-stone-50 text-stone-600'}`}
                                >
                                    <Eye className="w-5 h-5" />
                                    <span>גווני אפור</span>
                                    {settings.grayscale && <span className="mr-auto text-xs text-green-600 font-bold">פעיל</span>}
                                </button>

                                <button
                                    onClick={() => toggleSetting('highContrast')}
                                    className={`w-full flex items-center gap-4 p-3 rounded-lg transition-colors ${settings.highContrast ? 'bg-stone-100 text-stone-900 font-medium' : 'hover:bg-stone-50 text-stone-600'}`}
                                >
                                    <Sun className="w-5 h-5" />
                                    <span>ניגודיות גבוהה</span>
                                    {settings.highContrast && <span className="mr-auto text-xs text-green-600 font-bold">פעיל</span>}
                                </button>

                                <button
                                    onClick={() => toggleSetting('readableFont')}
                                    className={`w-full flex items-center gap-4 p-3 rounded-lg transition-colors ${settings.readableFont ? 'bg-stone-100 text-stone-900 font-medium' : 'hover:bg-stone-50 text-stone-600'}`}
                                >
                                    <span className="font-sans text-lg font-bold w-5 text-center">א</span>
                                    <span>גופן קריא</span>
                                    {settings.readableFont && <span className="mr-auto text-xs text-green-600 font-bold">פעיל</span>}
                                </button>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-stone-100 bg-stone-50">
                                <button
                                    onClick={resetSettings}
                                    className="w-full flex items-center justify-center gap-2 text-xs text-stone-500 hover:text-stone-900 transition-colors"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>איפוס הגדרות</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

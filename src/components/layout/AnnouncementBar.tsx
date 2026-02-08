'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface AnnouncementBarProps {
    initialConfig?: {
        isActive: boolean;
        text: string;
    };
}

export default function AnnouncementBar({ initialConfig }: AnnouncementBarProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    // Use props if available, otherwise default to hidden/empty
    const isActive = initialConfig?.isActive ?? false;
    const text = initialConfig?.text ?? '';

    useEffect(() => {
        // Check if user previously dismissed the announcement in this session
        const dismissed = sessionStorage.getItem('announcement-dismissed');
        if (!dismissed && isActive) { // Only mount if active and not dismissed
            setIsMounted(true);
        }
    }, [isActive]);

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem('announcement-dismissed', 'true');
    };

    if (!isMounted || !isActive || !text) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="bg-[#5d3f6a] text-white overflow-hidden relative z-[60]"
                >
                    <div className="max-w-screen-2xl mx-auto px-4 h-10 md:h-12 flex items-center justify-center relative">
                        <p className="text-xs md:text-sm font-assistant font-medium tracking-wide text-center w-full px-8 line-clamp-1">
                            {text}
                        </p>

                        <button
                            onClick={handleDismiss}
                            className="absolute left-4 p-1 hover:bg-white/10 rounded-full transition-colors"
                            aria-label="סגור הודעה"
                        >
                            <X className="w-3 h-3 md:w-4 md:h-4 text-white/80 hover:text-white" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

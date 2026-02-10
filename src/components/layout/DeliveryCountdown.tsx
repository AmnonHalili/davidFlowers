'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';

const TIMEZONE = 'Asia/Jerusalem';

export default function DeliveryCountdown() {
    const [message, setMessage] = useState<string>('');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const updateCountdown = () => {
            const now = new Date();

            // Get current time in Israel
            const nowIsrael = new Date(formatInTimeZone(now, TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX"));
            const day = nowIsrael.getDay(); // 0 is Sunday, 5 is Friday, 6 is Saturday
            const hunter = nowIsrael.getHours();
            const minutes = nowIsrael.getMinutes();

            let cutoffHour = 18;
            let isFriday = false;
            let isSaturday = false;

            if (day === 5) {
                cutoffHour = 12;
                isFriday = true;
            } else if (day === 6) {
                isSaturday = true;
            }

            const currentMinutesTotal = hunter * 60 + minutes;
            const cutoffMinutesTotal = cutoffHour * 60;

            if (isSaturday) {
                setMessage('משלוח ביום ראשון');
            } else if (currentMinutesTotal < cutoffMinutesTotal) {
                const diffMinutes = cutoffMinutesTotal - currentMinutesTotal;
                const h = Math.floor(diffMinutes / 60);
                const m = diffMinutes % 60;

                if (h > 0) {
                    setMessage(`הזמינו ב-${h} השעות הקרובות והמשלוח יגיע היום!`);
                } else {
                    setMessage(`הזמינו ב-${m} הדקות הקרובות והמשלוח יגיע היום!`);
                }
            } else {
                if (isFriday) {
                    setMessage('הזמינו עכשיו והמשלוח יגיע ביום ראשון');
                } else {
                    setMessage('הזמינו עכשיו והמשלוח יגיע ביום העבודה הבא');
                }
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    if (!isMounted) return null;

    return (
        <div className="flex items-center gap-1.5 text-[#FFD700] font-bold tracking-tight animate-pulse-slow">
            <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />
            <span className="text-[10px] md:text-xs whitespace-nowrap">{message}</span>
        </div>
    );
}

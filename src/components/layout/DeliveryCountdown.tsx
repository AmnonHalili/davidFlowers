'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap } from 'lucide-react';
import { toZonedTime } from 'date-fns-tz';

const TIMEZONE = 'Asia/Jerusalem';

export default function DeliveryCountdown() {
    const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; totalSeconds: number } | null>(null);
    const [message, setMessage] = useState<string>('');
    const [isUrgent, setIsUrgent] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const updateCountdown = () => {
            const now = new Date();
            const nowIsrael = toZonedTime(now, TIMEZONE);

            const day = nowIsrael.getDay(); // 0 is Sunday, ..., 5 is Friday, 6 is Saturday
            const currentHour = nowIsrael.getHours();
            const currentMinutes = nowIsrael.getMinutes();
            const currentSeconds = nowIsrael.getSeconds();

            let cutoffHour = 18;
            let isFriday = day === 5;
            let isSaturday = day === 6;

            if (isFriday) cutoffHour = 12.5;

            const currentSecondsTotal = (currentHour * 3600) + (currentMinutes * 60) + currentSeconds;
            const cutoffSecondsTotal = cutoffHour * 3600;
            const diffSeconds = cutoffSecondsTotal - currentSecondsTotal;

            if (isSaturday) {
                setMessage('הזמינו עכשיו למשלוח ביום ראשון על הבוקר!');
                setTimeLeft(null);
                setIsUrgent(false);
            } else if (diffSeconds > 0) {
                const h = Math.floor(diffSeconds / 3600);
                const m = Math.floor((diffSeconds % 3600) / 60);
                const s = diffSeconds % 60;

                setTimeLeft({ hours: h, minutes: m, seconds: s, totalSeconds: diffSeconds });

                // Urgency trigger: less than 3 hours
                if (diffSeconds < 3 * 3600) {
                    setIsUrgent(true);
                    setMessage('הזמינו מהר והמשלוח יגיע היום!');
                } else {
                    setIsUrgent(false);
                    setMessage(`הזמינו ב-${h} השעות הקרובות והמשלוח יגיע היום!`);
                }
            } else {
                setTimeLeft(null);
                setIsUrgent(false);
                if (isFriday) {
                    setMessage('הזמינו עכשיו והמשלוח יגיע ביום ראשון');
                } else {
                    setMessage('הזמינו עכשיו והמשלוח יגיע ביום העבודה הבא');
                }
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, []);

    if (!isMounted) return null;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={message}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-2 font-bold tracking-tight ${isUrgent ? 'text-rose-400' : 'text-[#FFD700]'}`}
            >
                {isUrgent ? (
                    <Zap className="w-3 h-3 md:w-3.5 md:h-3.5 animate-pulse" fill="currentColor" />
                ) : (
                    <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />
                )}

                <div className="flex items-baseline gap-2">
                    <span className="text-[10px] md:text-xs whitespace-nowrap">{message}</span>

                    {timeLeft && isUrgent && (
                        <div className="flex items-center gap-1 font-mono text-[11px] md:text-sm tabular-nums bg-white/10 px-2 py-0.5 rounded-sm border border-white/10 shadow-inner">
                            <span>{timeLeft.hours.toString().padStart(2, '0')}</span>
                            <span className="animate-pulse opacity-50">:</span>
                            <span>{timeLeft.minutes.toString().padStart(2, '0')}</span>
                            <span className="animate-pulse opacity-50">:</span>
                            <span>{timeLeft.seconds.toString().padStart(2, '0')}</span>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}


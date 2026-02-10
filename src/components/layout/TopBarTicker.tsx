'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Phone, Clock } from 'lucide-react';
import DeliveryCountdown from './DeliveryCountdown';

export default function TopBarTicker() {
    const [index, setIndex] = useState(0);

    const items = [
        {
            id: 'delivery-area',
            content: (
                <div className="flex items-center gap-2 text-david-beige/90">
                    <Truck className="w-3 h-3 text-david-beige/60" />
                    <span>משלוחים לאשקלון והסביבה</span>
                </div>
            )
        },
        {
            id: 'countdown',
            content: <DeliveryCountdown />
        },
        {
            id: 'phone',
            content: (
                <a href="tel:0535879344" className="flex items-center gap-1.5 text-david-beige/80">
                    <Phone className="w-3 h-3 text-david-beige/40" />
                    <span className="dir-ltr text-[11px]">053-587-9344</span>
                </a>
            )
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % items.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [items.length]);

    return (
        <div className="h-6 flex items-center justify-center overflow-hidden w-full relative">
            <AnimatePresence mode="wait">
                <motion.div
                    key={items[index].id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute inset-0 flex items-center justify-center w-full"
                >
                    {items[index].content}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

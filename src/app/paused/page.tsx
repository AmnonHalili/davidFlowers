'use client';

import { motion } from 'framer-motion';
import { Phone, Instagram, MessageCircle } from 'lucide-react';
import Image from 'next/image';

export default function PausedPage() {
    const whatsappNumber = '972535879344';
    const phoneNumber = '053-587-9344';
    const instagramUrl = 'https://www.instagram.com/davidflower__?igsh=NXNudHU1emMwcWVl';

    return (
        <div className="min-h-screen bg-david-beige flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-david-green rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-david-green rounded-full blur-3xl" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-2xl w-full bg-white/40 backdrop-blur-sm border border-white/20 p-8 md:p-12 rounded-3xl shadow-2xl relative z-10"
            >
                {/* Logo */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mb-8 flex justify-center"
                >
                    <div className="relative w-48 h-24">
                        <Image
                            src="/David-Logo-removebg-preview.png"
                            alt="David Flowers"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </motion.div>

                <motion.h1 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-4xl md:text-5xl font-serif text-david-green mb-6 leading-tight"
                >
                    התרעננות קצרה...
                </motion.h1>

                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-lg md:text-xl text-stone-600 mb-10 leading-relaxed font-assistant"
                >
                    אנחנו משדרגים את חוויית הקנייה עבורכם.<br />
                    בינתיים, ניתן לבצע הזמנות טלפוניות או בוואטסאפ.<br />
                    נשמח לעמוד לשירותכם!
                </motion.p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.a
                        href={`https://wa.me/${whatsappNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-stone-100 shadow-md hover:shadow-xl transition-all group"
                    >
                        <div className="w-12 h-12 bg-[#25D366]/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-[#25D366] transition-colors">
                            <MessageCircle className="w-6 h-6 text-[#25D366] group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-sm font-bold text-stone-800">WhatsApp</span>
                    </motion.a>

                    <motion.a
                        href={`tel:${phoneNumber}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-stone-100 shadow-md hover:shadow-xl transition-all group"
                    >
                        <div className="w-12 h-12 bg-david-green/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-david-green transition-colors">
                            <Phone className="w-6 h-6 text-david-green group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-sm font-bold text-stone-800">הזמנה טלפונית</span>
                    </motion.a>

                    <motion.a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-stone-100 shadow-md hover:shadow-xl transition-all group"
                    >
                        <div className="w-12 h-12 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]/10 rounded-full flex items-center justify-center mb-3 group-hover:from-[#f9ce34] group-hover:via-[#ee2a7b] group-hover:to-[#6228d7] transition-all">
                            <Instagram className="w-6 h-6 text-[#ee2a7b] group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-sm font-bold text-stone-800">Instagram</span>
                    </motion.a>
                </div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-12 text-stone-400 text-sm font-assistant"
                >
                    © דוד פרחים - כל הזכויות שמורות
                </motion.div>
            </motion.div>

            {/* Subtle flower elements could be added here if there are SVGs available */}
        </div>
    );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Phone, X, MessageSquare } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function ContactFloatingMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const { isOpen: isCartOpen } = useCart();
    const menuRef = useRef<HTMLDivElement>(null);

    const whatsappNumber = '972535879344';
    const whatsappMessage = 'היי דוד פרחים, אשמח לקבל פרטים נוספים';
    const instagramUrl = 'https://www.instagram.com/davidflower__?igsh=NXNudHU1emMwcWVl';
    const phoneNumber = '053-587-9344';

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const items = [
        {
            id: 'whatsapp',
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-7 h-7"
                >
                    <path fillRule="evenodd" clipRule="evenodd" d="M18.403 5.633A8.919 8.919 0 0 0 12.053 3c-4.948 0-8.976 4.027-8.978 8.977 0 1.582.413 3.126 1.198 4.488L3 21.116l4.759-1.249a8.981 8.981 0 0 0 4.29 1.093h.004c4.947 0 8.975-4.026 8.977-8.977a8.926 8.926 0 0 0-2.627-6.35m-6.35 13.812h-.003a7.446 7.446 0 0 1-3.798-1.041l-.272-.162-2.824.741.753-2.753-.177-.282a7.448 7.448 0 0 1-1.141-3.971c.002-4.114 3.349-7.461 7.465-7.461a7.413 7.413 0 0 1 5.275 2.188 7.42 7.42 0 0 1 2.183 5.279c-.002 4.114-3.349 7.462-7.463 7.462m4.093-5.589c-.225-.113-1.327-.655-1.533-.73-.205-.075-.354-.112-.504.112-.149.224-.579.73-.709.88-.131.149-.261.166-.486.054-.224-.113-.945-.349-1.802-1.113-.667-.595-1.117-1.329-1.248-1.554-.131-.223-.014-.344.098-.456.102-.101.224-.262.336-.393.112-.131.149-.224.224-.374.075-.149.037-.28-.019-.393-.056-.113-.505-1.217-.692-1.666-.181-.435-.366-.377-.504-.383-.13-.006-.28-.008-.429-.008-.15 0-.393.056-.599.28-.206.225-.785.767-.785 1.871 0 1.104.804 2.171.916 2.321.112.15 1.582 2.415 3.832 3.387.536.231.954.369 1.279.473.534.171 1.021.147 1.409.089.435-.065 1.327-.542 1.514-1.066.187-.524.187-.973.131-1.066-.056-.094-.206-.15-.43-.262" />
                </svg>
            ),
            label: 'WhatsApp',
            href: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`,
            color: 'bg-[#25D366]',
            textColor: 'text-white'
        },
        {
            id: 'phone',
            icon: <Phone className="w-6 h-6" />,
            label: 'Call Us',
            href: `tel:${phoneNumber}`,
            color: 'bg-[#1B3322]',
            textColor: 'text-white'
        },
        {
            id: 'instagram',
            icon: <Instagram className="w-6 h-6" />,
            label: 'Instagram',
            href: instagramUrl,
            color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]',
            textColor: 'text-white'
        }
    ];

    if (isCartOpen) return null;

    return (
        <div ref={menuRef} className="fixed bottom-6 right-6 z-[40] flex flex-col items-end gap-4">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex flex-col items-end gap-3 mb-1"
                    >
                        {items.map((item, index) => (
                            <motion.a
                                key={item.id}
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative flex items-center justify-center group"
                            >
                                <span className="absolute right-full mr-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-stone-700 shadow-xl border border-stone-100 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    {item.label === 'WhatsApp' ? 'וואטסאפ' : item.label === 'Call Us' ? 'חיוג מהיר' : 'אינסטגרם'}
                                </span>
                                <div className={`${item.color} ${item.textColor} w-12 h-12 md:w-13 md:h-13 rounded-full shadow-2xl flex items-center justify-center transition-transform`}>
                                    {item.icon}
                                </div>
                            </motion.a>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl transition-all duration-300 ${isOpen ? 'bg-white text-stone-900 border border-stone-100' : 'bg-[#1B3322] text-white hover:bg-[#23422c]'}`}
                aria-label="Contact Menu"
            >
                {isOpen ? <X className="w-6 h-6 md:w-7 md:h-7" /> : <MessageSquare className="w-6 h-6 md:w-7 md:h-7" />}
            </motion.button>
        </div>
    );
}

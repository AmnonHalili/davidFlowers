'use client';

import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';

export default function InstagramFloatingButton() {
    const instagramUrl = 'https://www.instagram.com/davidflower__?igsh=NXNudHU1emMwcWVl';

    return (
        <motion.a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-[96px] right-6 z-40 flex items-center justify-center p-3.5 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.25)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)] transition-all group overflow-hidden"
            aria-label="Follow us on Instagram"
        >
            <Instagram className="w-7 h-7 relative z-10" />
        </motion.a>
    );
}

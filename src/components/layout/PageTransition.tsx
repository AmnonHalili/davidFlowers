'use client';

import { motion } from 'framer-motion';

export default function PageTransition({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ ease: "easeOut", duration: 0.3 }}
            className="w-full"
        >
            {children}
        </motion.div>
    );
}

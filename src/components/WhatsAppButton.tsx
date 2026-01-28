'use client';

import { motion } from 'framer-motion';

export default function WhatsAppButton() {
    const phoneNumber = '972535879344'; // 0535879344 formatted for intl
    const message = 'היי דוד פרחים, אשמח לקבל פרטים נוספים';

    return (
        <motion.a
            href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-6 right-6 z-40 flex items-center justify-center p-3.5 bg-[#1B3322] text-white rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.25)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)] hover:bg-[#23422c] transition-all group overflow-hidden"
            aria-label="Contact us on WhatsApp"
        >
            {/* WhatsApp Icon (SVG) - Official Brand Path */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-7 h-7 relative z-10"
            >
                <path fillRule="evenodd" clipRule="evenodd" d="M18.403 5.633A8.919 8.919 0 0 0 12.053 3c-4.948 0-8.976 4.027-8.978 8.977 0 1.582.413 3.126 1.198 4.488L3 21.116l4.759-1.249a8.981 8.981 0 0 0 4.29 1.093h.004c4.947 0 8.975-4.026 8.977-8.977a8.926 8.926 0 0 0-2.627-6.35m-6.35 13.812h-.003a7.446 7.446 0 0 1-3.798-1.041l-.272-.162-2.824.741.753-2.753-.177-.282a7.448 7.448 0 0 1-1.141-3.971c.002-4.114 3.349-7.461 7.465-7.461a7.413 7.413 0 0 1 5.275 2.188 7.42 7.42 0 0 1 2.183 5.279c-.002 4.114-3.349 7.462-7.463 7.462m4.093-5.589c-.225-.113-1.327-.655-1.533-.73-.205-.075-.354-.112-.504.112-.149.224-.579.73-.709.88-.131.149-.261.166-.486.054-.224-.113-.945-.349-1.802-1.113-.667-.595-1.117-1.329-1.248-1.554-.131-.223-.014-.344.098-.456.102-.101.224-.262.336-.393.112-.131.149-.224.224-.374.075-.149.037-.28-.019-.393-.056-.113-.505-1.217-.692-1.666-.181-.435-.366-.377-.504-.383-.13-.006-.28-.008-.429-.008-.15 0-.393.056-.599.28-.206.225-.785.767-.785 1.871 0 1.104.804 2.171.916 2.321.112.15 1.582 2.415 3.832 3.387.536.231.954.369 1.279.473.534.171 1.021.147 1.409.089.435-.065 1.327-.542 1.514-1.066.187-.524.187-.973.131-1.066-.056-.094-.206-.15-.43-.262" />
            </svg>
        </motion.a>
    );
}

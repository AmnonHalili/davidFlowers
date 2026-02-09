'use client';

import { useState } from 'react';
import Modal from '../ui/Modal';
import { Type, Check } from 'lucide-react';

interface InscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (text: string) => void;
    productName: string;
    maxChars?: number;
}

export default function InscriptionModal({
    isOpen,
    onClose,
    onConfirm,
    productName,
    maxChars = 20
}: InscriptionModalProps) {
    const [text, setText] = useState('');

    const handleConfirm = () => {
        onConfirm(text);
        setText('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                setText('');
                onClose();
            }}
            title="הוספת כיתוב אישי"
        >
            <div className="space-y-6 rtl text-right" dir="rtl">
                <div className="space-y-2">
                    <p className="text-sm text-stone-500 font-sans">
                        הוסף כיתוב אישי עבור: <span className="font-medium text-stone-900">{productName}</span>
                    </p>
                </div>

                <div className="relative">
                    <div className="absolute top-3 right-3 text-stone-400">
                        <Type className="w-4 h-4" />
                    </div>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value.slice(0, maxChars))}
                        placeholder="הקלד את הכיתוב כאן..."
                        className="w-full min-h-[120px] pr-10 pl-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#C5A572] focus:ring-1 focus:ring-[#C5A572] outline-none transition-all resize-none text-right font-sans text-stone-800"
                        autoFocus
                    />
                    <div className="absolute bottom-3 left-3 flex items-center gap-1">
                        <span className={`text-[10px] font-mono font-medium ${text.length >= maxChars ? 'text-rose-500' : 'text-stone-400'}`}>
                            {text.length}/{maxChars}
                        </span>
                    </div>
                </div>

                <div className="bg-stone-50 rounded-lg p-4 flex gap-3 items-start border border-stone-100">
                    <div className="bg-david-green/10 p-1.5 rounded-full mt-0.5">
                        <Check className="w-3.5 h-3.5 text-david-green" />
                    </div>
                    <p className="text-[11px] text-stone-500 leading-relaxed">
                        הכיתוב יופיע בדיוק כפי שהוקלד. מומלץ לוודא שאין שגיאות כתיב לפני האישור.
                    </p>
                </div>

                <button
                    onClick={handleConfirm}
                    disabled={!text.trim()}
                    className="w-full bg-[#1B3322] text-white py-4 rounded-full font-medium shadow-md hover:bg-[#1B3322]/90 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span>הוסף לסל עם כיתוב</span>
                </button>
            </div>
        </Modal>
    );
}

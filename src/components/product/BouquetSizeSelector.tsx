'use client';

import Image from 'next/image';

interface BouquetSizeSelectorProps {
    variations: Record<string, { label: string; price: number; stock?: number }>;
    selectedSize: 'standard' | 'medium' | 'large';
    onSelect: (size: 'standard' | 'medium' | 'large') => void;
    hideLabel?: boolean;
}

const SIZE_MAPPING = {
    standard: {
        image: '/small-zer.png',
        alt: 'זר קטן'
    },
    medium: {
        image: '/medium-zer.png',
        alt: 'זר בינוני'
    },
    large: {
        image: '/big-zer.png',
        alt: 'זר גדול'
    }
} as const;

export default function BouquetSizeSelector({
    variations,
    selectedSize,
    onSelect,
    hideLabel = false
}: BouquetSizeSelectorProps) {
    return (
        <div className="space-y-4">
            {!hideLabel && (
                <label className="text-xs uppercase tracking-wider font-medium text-stone-900 block text-center md:text-right">
                    בחר גודל
                </label>
            )}

            <div className="grid grid-cols-3 gap-3 md:gap-4">
                {(['standard', 'medium', 'large'] as const).map((size) => {
                    const variation = variations[size];
                    if (!variation) return null;

                    const isActive = selectedSize === size;
                    const { image, alt } = SIZE_MAPPING[size];

                    return (
                        <button
                            key={size}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onSelect(size);
                            }}
                            className={`
                                relative flex flex-col items-center justify-between p-2 rounded-sm transition-all duration-300
                                border border-[#C5A572] h-full group
                                ${isActive
                                    ? 'bg-[#1B3322] text-white shadow-md scale-[1.02]'
                                    : 'bg-white text-stone-900 hover:shadow-sm'
                                }
                            `}
                        >
                            {/* Illustration */}
                            <div className="relative w-28 h-28 md:w-48 md:h-48 mb-2 mt-1 transition-all duration-300">
                                <Image
                                    src={image}
                                    alt={alt}
                                    fill
                                    className={`
                                        object-contain transition-all duration-300
                                        ${isActive
                                            ? 'brightness-0 invert'
                                            : 'opacity-90 group-hover:opacity-100'
                                        }
                                    `}
                                />
                            </div>

                            {/* Price */}
                            <div className="mt-auto">
                                <span className={`text-lg md:text-xl font-medium font-serif ${isActive ? 'text-white' : 'text-stone-900'}`}>
                                    ₪{variation.price}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

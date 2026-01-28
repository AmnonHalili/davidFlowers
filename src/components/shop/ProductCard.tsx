'use client';

import Link from 'next/link';
import { ShoppingBag, Timer, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import WishlistButton from './WishlistButton';
import { calculateProductPrice } from '@/lib/price-utils';
import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';

interface ProductCardProps {
    id: string;
    name: string;
    price: number | string | unknown;
    image: string;
    slug: string;
    category?: string;
    stock: number;
    hoverImage?: string;
    isFavorited?: boolean;
    salePrice?: number | string | unknown | null;
    saleStartDate?: Date | string | null;
    saleEndDate?: Date | string | null;
    availableFrom?: Date | string | null;
    allowPreorder?: boolean;
    isVariablePrice?: boolean;
    variations?: any;
}

export default function ProductCard({
    id, name, price, image, slug, category, stock, hoverImage, isFavorited,
    salePrice, saleStartDate, saleEndDate, availableFrom, allowPreorder,
    isVariablePrice, variations
}: ProductCardProps) {
    const isOutOfStock = stock <= 0;
    const { addItem } = useCart();

    const { price: displayPrice, isOnSale, regularPrice } = calculateProductPrice({
        price,
        salePrice,
        saleStartDate,
        saleEndDate
    });

    // Scheduling Logic
    const now = new Date();
    const launchDate = availableFrom ? new Date(availableFrom) : null;
    const isFuture = launchDate && launchDate > now;
    const canPreorder = isFuture && allowPreorder;
    const isLocked = isFuture && !allowPreorder;

    const [isAdded, setIsAdded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Countdown Timer Logic
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!isOnSale || !saleEndDate) {
            setTimeLeft('');
            return;
        }

        const calculateTimeLeft = () => {
            const end = new Date(saleEndDate);
            const now = new Date();
            const diff = end.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft('');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            if (days > 0) {
                setTimeLeft(`${days} ימים ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            } else {
                setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [isOnSale, saleEndDate]);

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isOutOfStock || isLocked) return;

        // Logic for Variable Price Products (Open Modal)
        if (isVariablePrice && variations) {
            setIsModalOpen(true);
            return;
        }

        // Logic for Simple Products
        addItem({
            id: id,
            productId: id,
            name: name,
            price: displayPrice,
            originalPrice: isOnSale ? regularPrice : undefined,
            image: image,
            quantity: 1,
            type: 'ONETIME',
            availableFrom: availableFrom ? new Date(availableFrom).toISOString() : undefined,
        });

        // Trigger visual feedback
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const handleVariationAdd = (size: string, variation: any) => {
        addItem({
            id: id, // Keep main product ID as base
            productId: id,
            name: `${name} - ${variation.label}`,
            selectedSize: size, // New cart field
            sizeLabel: variation.label, // New cart field
            price: variation.price,
            image: image,
            quantity: 1,
            type: 'ONETIME',
            availableFrom: availableFrom ? new Date(availableFrom).toISOString() : undefined,
        });

        setIsModalOpen(false);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <Link
            href={`/product/${slug}`}
            className="group block w-full min-w-0 space-y-3 md:space-y-4 rtl relative"
            dir="rtl"
        >
            <div className="relative aspect-square md:aspect-[4/5] w-full overflow-hidden bg-stone-100 rounded-sm">
                {/* Main Image */}
                <img
                    src={image}
                    alt={name}
                    className={`w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105 ${hoverImage ? 'group-hover:opacity-0' : ''} ${isOutOfStock ? 'grayscale opacity-80' : ''}`}
                />

                {/* Second Image (Crossfade) */}
                {hoverImage && (
                    <img
                        src={hoverImage}
                        alt={`${name} hover`}
                        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out scale-105"
                    />
                )}

                {/* Badges Container */}
                <div className="absolute top-0 left-0 right-0 p-2 md:p-3 flex flex-col items-start gap-1 md:gap-2 z-30 pointer-events-none">
                    {isOnSale && !isOutOfStock && !isFuture && (
                        <div className="bg-rose-600 text-white text-[10px] md:text-[11px] font-serif tracking-wide px-2 py-0.5 md:px-3 md:py-1 shadow-sm">
                            SALE
                        </div>
                    )}
                    {canPreorder && (
                        <div className="bg-david-green text-white text-[10px] md:text-[11px] font-serif tracking-wide px-2 py-0.5 md:px-3 md:py-1 shadow-sm">
                            PRE-ORDER
                        </div>
                    )}
                    {isLocked && (
                        <div className="bg-stone-900/90 text-white text-[10px] font-bold px-2 py-0.5 md:px-3 md:py-1 uppercase tracking-widest backdrop-blur-sm border border-white/20">
                            בקרוב
                        </div>
                    )}
                    {isOutOfStock && !isFuture && (
                        <div className="bg-stone-900 text-white text-[10px] font-bold px-2 py-0.5 md:px-2 md:py-1 uppercase tracking-widest backdrop-blur-sm">
                            אזל מהמלאי
                        </div>
                    )}
                </div>

                {/* Sale Timer Overlay */}
                {isOnSale && timeLeft && !isOutOfStock && !isFuture && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center z-20 pointer-events-none bg-gradient-to-t from-black/20 to-transparent">
                        <div className="bg-white/95 backdrop-blur-md text-stone-900 px-4 py-2 rounded-sm border border-white/50 shadow-xl flex items-center gap-3">
                            <Timer className="w-3.5 h-3.5 text-rose-600" strokeWidth={2} />
                            <span className="text-xs font-medium tracking-widest font-mono tabular-nums">{timeLeft}</span>
                        </div>
                    </div>
                )}

                {/* Locked Launch Timer Overlay */}
                {isLocked && launchDate && (
                    <div className="absolute inset-0 z-40 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center transition-opacity duration-300">
                        <div className="bg-white/90 p-4 shadow-lg border border-stone-100 max-w-full">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">זמין לרכישה ב:</p>
                            <p className="text-sm font-mono font-medium text-stone-900 tracking-wider dir-ltr">
                                {launchDate.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' })}
                                <span className="mx-2 text-stone-300">|</span>
                                {launchDate.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        <span className="mt-4 text-xs font-bold text-stone-900 bg-stone-100 px-3 py-1 uppercase tracking-widest">
                            בקרוב
                        </span>
                    </div>
                )}

                {/* Wishlist Button */}
                <div className="absolute top-2 left-2 md:top-3 md:left-3 z-30 pointer-events-auto">
                    <WishlistButton
                        productId={id}
                        initialIsFavorited={isFavorited}
                        className="bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white text-stone-600 hover:text-rose-600 w-8 h-8 md:w-9 md:h-9"
                    />
                </div>

                {/* Dark Overlay on Hover */}
                <div className="absolute inset-0 bg-stone-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* "Quick Actions" Bottom Up Slide (Desktop Only) */}
                {!isLocked && (
                    <>
                        <div className="hidden md:block absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-20">
                            <button
                                onClick={handleQuickAdd}
                                className={`w-full py-4 uppercase text-xs tracking-[0.2em] font-medium transition-all duration-300 flex items-center justify-center gap-2 ${isAdded
                                    ? 'bg-david-green text-white'
                                    : canPreorder
                                        ? 'bg-david-green text-white hover:bg-david-green/90'
                                        : 'bg-stone-900 text-white hover:bg-stone-800'
                                    }`}
                            >
                                {isAdded ? (
                                    <>
                                        <Check className="w-4 h-4" strokeWidth={3} />
                                        <span>נוסף לסל</span>
                                    </>
                                ) : (
                                    <>
                                        <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
                                        {isOutOfStock ? 'אזל מהמלאי' : canPreorder ? 'הזמנה מוקדמת' : 'הוסף לסל'}
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Mobile Quick Add Button (Overlay) */}
                        {!isOutOfStock && (
                            <button
                                onClick={handleQuickAdd}
                                className={`md:hidden absolute bottom-2 right-2 z-30 w-8 h-8 rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 ${isAdded ? 'bg-david-green text-white' : 'bg-white/90 text-stone-900 backdrop-blur-sm'
                                    }`}
                            >
                                {isAdded ? (
                                    <Check className="w-4 h-4" strokeWidth={3} />
                                ) : (
                                    <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
                                )}
                            </button>
                        )}
                    </>
                )}
            </div>

            <div className="text-center space-y-1 md:space-y-2 pt-1 md:pt-2">
                {category && (
                    <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 block pb-1">{category}</span>
                )}
                <h3 className="font-serif text-sm md:text-xl text-stone-900 leading-tight group-hover:text-stone-600 transition-colors duration-300 line-clamp-2 min-h-[1.25em]">
                    {name}
                </h3>
                <div className="flex justify-center items-center gap-3 relative">
                    {isOnSale ? (
                        <>
                            <span className="font-medium text-rose-600 text-sm md:text-lg font-serif">
                                {isVariablePrice && <span className="text-xs text-stone-500 font-sans ml-1">החל מ-</span>}
                                ₪{typeof displayPrice === 'number' && !isNaN(displayPrice) ? displayPrice.toFixed(0) : '0'}
                            </span>
                            <span className="text-xs md:text-sm text-stone-400 line-through decoration-stone-300 font-serif">
                                ₪{typeof regularPrice === 'number' && !isNaN(regularPrice) ? regularPrice.toFixed(0) : '0'}
                            </span>
                        </>
                    ) : (
                        <p className="font-medium text-stone-600 text-sm md:text-lg font-serif">
                            {isVariablePrice && <span className="text-xs text-stone-500 font-sans ml-1">החל מ-</span>}
                            ₪{typeof Number(price) === 'number' && !isNaN(Number(price)) ? Number(price).toFixed(0) : '0'}
                        </p>
                    )}

                </div>
            </div>

            {/* Size Selection Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="בחר גודל"
            >
                <div className="space-y-4">
                    <div className="flex flex-col gap-3">
                        {variations && (['small', 'medium', 'large'] as const).map((size) => {
                            const variation = variations[size];
                            if (!variation) return null;
                            return (
                                <button
                                    key={size}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleVariationAdd(size, variation);
                                    }}
                                    className="flex items-center justify-between p-4 rounded-xl border border-stone-200 hover:border-david-green hover:bg-stone-50 transition-all group/btn"
                                >
                                    <span className="font-medium text-stone-900">{variation.label}</span>
                                    <span className="font-serif text-lg font-medium text-stone-900 group-hover/btn:text-david-green">
                                        ₪{variation.price}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </Modal>
        </Link>
    );
}

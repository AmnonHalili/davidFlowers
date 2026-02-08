'use client';

import Link from 'next/link';
import { ShoppingBag, Timer, Check } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import WishlistButton from './WishlistButton';
import { calculateProductPrice } from '@/lib/price-utils';
import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import BouquetSizeSelector from '../product/BouquetSizeSelector';

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
    isPersonalizationEnabled?: boolean;
    categories?: any[];
}

export default function ProductCard({
    id, name, price, image, slug, category, stock, hoverImage, isFavorited,
    salePrice, saleStartDate, saleEndDate, availableFrom, allowPreorder,
    isVariablePrice, variations, isPersonalizationEnabled, categories, ...props
}: ProductCardProps) {
    const isOutOfStock = stock <= 0;
    const { addItem } = useCart();

    const { price: displayPrice, isOnSale, regularPrice, type, discountLabel } = calculateProductPrice({
        price,
        salePrice,
        saleStartDate,
        saleEndDate,
        categories: categories || (props as any).categories
    });

    // Scheduling Logic
    const now = new Date();
    const launchDate = availableFrom ? new Date(availableFrom) : null;
    const isFuture = launchDate && launchDate > now;
    const canPreorder = isFuture && allowPreorder;
    const isLocked = isFuture && !allowPreorder;

    const [isAdded, setIsAdded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSize, setSelectedSize] = useState<'standard' | 'medium' | 'large'>('medium');

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

    const hasVariations = isVariablePrice && variations && Object.keys(variations).length > 0;

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isOutOfStock || isLocked) return;

        // Logic for Variable Price Products (Open Modal)
        if (hasVariations) {
            setIsModalOpen(true);
            return;
        }

        // Logic for Personalized Products (Redirect)
        if (isPersonalizationEnabled) {
            window.location.href = `/product/${slug}`;
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

    const handleVariationAdd = () => {
        if (!variations || !variations[selectedSize]) return;
        const variation = variations[selectedSize];

        addItem({
            id: id, // Keep main product ID as base
            productId: id,
            name: `${name} - ${variation.label}`,
            selectedSize: selectedSize, // New cart field
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

    const handleMouseEnter = () => {
        if (hasVariations) {
            // Preload modal illustration images
            const images = ['/small-zer.png', '/medium-zer.png', '/big-zer.png'];
            images.forEach(src => {
                const img = new (window as any).Image();
                img.src = src;
            });
        }
    };

    return (
        <Link
            href={`/product/${slug}`}
            className="group block w-full min-w-0 space-y-3 md:space-y-4 rtl relative"
            dir="rtl"
            onMouseEnter={handleMouseEnter}
        >
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-transparent rounded-sm">
                {/* Main Image */}
                <Image
                    src={image}
                    alt={name}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className={`object-cover mix-blend-multiply transition-all duration-700 ease-in-out group-hover:scale-105 ${hoverImage ? 'group-hover:opacity-0' : ''} ${isOutOfStock ? 'grayscale opacity-80' : ''}`}
                    loading="lazy"
                />

                {/* Second Image (Crossfade) */}
                {hoverImage && (
                    <Image
                        src={hoverImage}
                        alt={`${name} hover`}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="absolute inset-0 object-cover mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out scale-105"
                        loading="lazy"
                    />
                )}

                {/* Badges Container */}
                <div className="absolute top-0 left-0 right-0 p-2 md:p-3 flex flex-col items-start gap-1 md:gap-2 z-30 pointer-events-none">
                    {isOnSale && !isOutOfStock && !isFuture && type === 'PRODUCT_SALE' && (
                        <div className="bg-rose-600 text-white text-[10px] md:text-[11px] font-serif tracking-wide px-2 py-0.5 md:px-3 md:py-1 shadow-sm">
                            SALE
                        </div>
                    )}
                    {isOnSale && !isOutOfStock && !isFuture && type === 'CATEGORY_SALE' && (
                        <div className="bg-purple-600 text-white text-[10px] md:text-[11px] font-serif tracking-wide px-2 py-0.5 md:px-3 md:py-1 shadow-sm">
                            {discountLabel ? `${discountLabel} SALE` : 'SALE'}
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
                                        {isOutOfStock ? 'אזל מהמלאי' : canPreorder ? 'הזמנה מוקדמת' : 'הוספה לסל'}
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Mobile Quick Add Button (Overlay) */}
                        {!isOutOfStock && (
                            <button
                                onClick={handleQuickAdd}
                                className={`md:hidden absolute bottom-3 right-3 z-30 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 ${isAdded ? 'bg-david-green text-white' : 'bg-white text-stone-900 border border-stone-100'
                                    }`}
                            >
                                {isAdded ? (
                                    <Check className="w-5 h-5" strokeWidth={3} />
                                ) : (
                                    <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                                )}
                            </button>
                        )}
                    </>
                )}
            </div>

            <div className="text-center space-y-1 mt-2">
                {category && (
                    <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 block pb-0.5">{category}</span>
                )}
                <h3 className="font-serif text-[13px] md:text-lg text-stone-900 leading-tight group-hover:text-stone-600 transition-colors duration-300 line-clamp-2 min-h-[2.5em] flex items-center justify-center">
                    {name}
                </h3>
                <div className="flex justify-center items-center gap-3 relative">
                    {isOnSale ? (
                        <>
                            <span className="font-medium text-rose-600 text-[15px] md:text-lg font-serif">
                                {isVariablePrice && <span className="text-[10px] text-stone-500 font-sans ml-1 text-right">החל מ-</span>}
                                ₪{typeof displayPrice === 'number' && !isNaN(displayPrice) ? displayPrice.toFixed(0) : '0'}
                            </span>
                            <span className="text-[11px] md:text-sm text-stone-400 line-through decoration-stone-300 font-serif">
                                ₪{typeof regularPrice === 'number' && !isNaN(regularPrice) ? regularPrice.toFixed(0) : '0'}
                            </span>
                        </>
                    ) : (
                        <p className="font-medium text-stone-600 text-[15px] md:text-lg font-serif">
                            {isVariablePrice && <span className="text-[10px] text-stone-500 font-sans ml-1 text-right">החל מ-</span>}
                            ₪{typeof Number(price) === 'number' && !isNaN(Number(price)) ? Number(price).toFixed(0) : '0'}
                        </p>
                    )}

                </div>
            </div>

            {/* Size Selection Modal - Only for Variable Products */}
            {hasVariations && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="בחר גודל"
                >
                    <div className="space-y-4">
                        <div className="space-y-6">
                            <BouquetSizeSelector
                                variations={variations}
                                selectedSize={selectedSize}
                                onSelect={setSelectedSize}
                                hideLabel
                            />

                            <button
                                onClick={handleVariationAdd}
                                className="w-full bg-[#1B3322] text-white py-4 rounded-full font-medium shadow-md hover:bg-[#1B3322]/90 transition-all flex items-center justify-center gap-2 group"
                            >
                                <span>הוסף לסל</span>
                                <span>-</span>
                                <span>₪{variations[selectedSize]?.price}</span>
                                <ShoppingBag className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </Link>
    );
}

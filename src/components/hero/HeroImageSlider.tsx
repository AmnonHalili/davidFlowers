'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Image from 'next/image';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { HeroMediaItem, TransitionEffect, SlideDirection } from '@/types/hero';

interface HeroImageSliderProps {
    items: HeroMediaItem[];
    intervalSeconds?: number;
    transitionEffect?: TransitionEffect;
    slideDirection?: SlideDirection;
    showDots?: boolean;
    showArrows?: boolean;
    overlayOpacity?: number;
    className?: string;
}

export default function HeroImageSlider({
    items,
    intervalSeconds = 5,
    transitionEffect = 'slide',
    slideDirection = 'left',
    showDots = true,
    showArrows = true,
    overlayOpacity = 35,
    className = '',
}: HeroImageSliderProps) {
    // Filter only valid image items (or fall back to first item if empty)
    const validItems = items.length > 0 ? items : [{ id: 'fallback', url: '/hero-bg.jpg', type: 'IMAGE' as const }];
    const [[currentIndex, direction], setPage] = useState<[number, number]>([0, 0]);
    const [isHovered, setIsHovered] = useState(false);
    const touchStartX = useRef<number | null>(null);

    const paginate = useCallback((newDirection: number) => {
        setPage(([curr]) => {
            let nextIndex = curr + newDirection;
            if (nextIndex < 0) nextIndex = validItems.length - 1;
            if (nextIndex >= validItems.length) nextIndex = 0;
            return [nextIndex, newDirection];
        });
    }, [validItems.length]);

    const goToSlide = (targetIndex: number) => {
        setPage(([curr]) => [targetIndex, targetIndex > curr ? 1 : -1]);
    };

    // Auto-advance timer
    useEffect(() => {
        if (validItems.length <= 1 || isHovered) return;

        const intervalMs = Math.max(2, intervalSeconds) * 1000;
        const timer = setInterval(() => {
            // Respect configured direction: if 'left', move forward (1), if 'right', move backward (-1)
            const step = slideDirection === 'right' ? -1 : 1;
            paginate(step);
        }, intervalMs);

        return () => clearInterval(timer);
    }, [validItems.length, intervalSeconds, isHovered, paginate, slideDirection]);

    // Touch swipe support for mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const touchEndX = e.changedTouches[0].clientX;
        const deltaX = touchEndX - touchStartX.current;
        const swipeThreshold = 45; // pixels

        if (deltaX > swipeThreshold) {
            // Swiped right -> In RTL view or standard gesture, go to previous / right slide
            paginate(-1);
        } else if (deltaX < -swipeThreshold) {
            // Swiped left -> Go to next slide
            paginate(1);
        }
        touchStartX.current = null;
    };

    // Animation variants based on transition effect
    const variants: Variants = {
        enter: (dir: number) => {
            if (transitionEffect === 'fade') {
                return { opacity: 0, scale: 1 };
            }
            if (transitionEffect === 'zoom') {
                return { opacity: 0, scale: 1.15 };
            }
            // 'slide': directional slide
            return {
                x: dir > 0 ? '100%' : '-100%',
                opacity: 0.6,
                scale: 1,
            };
        },
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
            transition: {
                x: { type: 'spring' as const, stiffness: 280, damping: 32 },
                opacity: { duration: 0.8, ease: [0.25, 1, 0.5, 1] },
                scale: { duration: 6, ease: 'easeOut' }, // Gentle subtle zoom while displaying
            },
        },
        exit: (dir: number) => {
            if (transitionEffect === 'fade') {
                return { opacity: 0, transition: { duration: 0.8 } };
            }
            if (transitionEffect === 'zoom') {
                return { opacity: 0, scale: 0.95, transition: { duration: 0.8 } };
            }
            return {
                x: dir > 0 ? '-100%' : '100%',
                opacity: 0.4,
                transition: {
                    x: { type: 'spring' as const, stiffness: 280, damping: 32 },
                    opacity: { duration: 0.6 },
                },
            };
        },
    };

    const currentItem = validItems[currentIndex];

    return (
        <div
            className={`absolute inset-0 w-full h-full overflow-hidden bg-stone-950 ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={currentItem.id || currentItem.url + currentIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 w-full h-full"
                >
                    <Image
                        src={currentItem.url}
                        alt={currentItem.alt || currentItem.title || 'פרחי דוד'}
                        fill
                        priority={currentIndex === 0}
                        sizes="100vw"
                        className="object-cover object-center w-full h-full select-none"
                    />
                </motion.div>
            </AnimatePresence>

            {/* Configurable Darkness Tint */}
            <div
                className="absolute inset-0 pointer-events-none transition-colors duration-500 z-10"
                style={{
                    backgroundColor: `rgba(15, 26, 19, ${overlayOpacity / 100})`,
                }}
            />

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A13]/80 via-black/20 to-[#0F1A13]/40 pointer-events-none z-10" />

            {/* Navigation Arrows */}
            {showArrows && validItems.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={() => paginate(-1)}
                        aria-label="תמונה קודמת"
                        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 p-2.5 md:p-3.5 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 text-white/80 hover:text-white backdrop-blur-md border border-white/20 transition-all shadow-lg opacity-80 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
                    >
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                    </button>

                    <button
                        type="button"
                        onClick={() => paginate(1)}
                        aria-label="תמונה הבאה"
                        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 p-2.5 md:p-3.5 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 text-white/80 hover:text-white backdrop-blur-md border border-white/20 transition-all shadow-lg opacity-80 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
                    >
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </>
            )}

            {/* Progress Dots Pagination */}
            {showDots && validItems.length > 1 && (
                <div className="absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/10">
                    {validItems.map((item, idx) => {
                        const isActive = idx === currentIndex;
                        return (
                            <button
                                key={item.id || idx}
                                type="button"
                                onClick={() => goToSlide(idx)}
                                aria-label={`עבור לשקופית ${idx + 1}`}
                                className={`transition-all duration-300 rounded-full h-2 ${isActive
                                    ? 'w-6 bg-david-beige shadow-sm shadow-white/30'
                                    : 'w-2 bg-white/40 hover:bg-white/70'
                                    }`}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}

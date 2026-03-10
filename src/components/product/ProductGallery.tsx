'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Video, Volume2, VolumeX } from 'lucide-react';

interface ProductGalleryProps {
    images: { id: string; url: string; alt?: string; isMain?: boolean; type?: 'IMAGE' | 'VIDEO' }[];
    productName: string;
    isOnSale?: boolean;
}

export default function ProductGallery({ images, productName, isOnSale }: ProductGalleryProps) {
    const [index, setIndex] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [isMuted, setIsMuted] = useState(true);

    // Filter to ensure main media is first if possible
    const sortedMedia = [...images].sort((a, b) => (a.isMain ? -1 : b.isMain ? 1 : 0));

    const handleNext = () => {
        if (index < sortedMedia.length - 1) setIndex(index + 1);
    };

    const handlePrev = () => {
        if (index > 0) setIndex(index - 1);
    };

    const onDragEnd = (event: any, info: any) => {
        const swipeThreshold = 50;
        if (info.offset.x < -swipeThreshold) {
            handleNext();
        } else if (info.offset.x > swipeThreshold) {
            handlePrev();
        }
        setDragActive(false);
    };

    const currentMedia = sortedMedia[index];

    return (
        <div className="relative group/gallery">
            {/* Main Carousel Area */}
            <div className="relative aspect-[3/4] bg-stone-50 overflow-hidden rounded-md md:rounded-xl shadow-sm border border-stone-100">
                <AnimatePresence initial={false} mode="wait">
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95, x: dragActive ? 0 : 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 1.05, x: dragActive ? 0 : -20 }}
                        transition={{
                            type: 'spring',
                            stiffness: 260,
                            damping: 25,
                        }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragStart={() => setDragActive(true)}
                        onDragEnd={onDragEnd}
                        className="absolute inset-0 cursor-grab active:cursor-grabbing"
                    >
                        {currentMedia?.type === 'VIDEO' ? (
                            <div className="relative w-full h-full">
                                <video
                                    src={currentMedia.url}
                                    autoPlay
                                    loop
                                    muted={isMuted}
                                    playsInline
                                    className="w-full h-full object-cover pointer-events-none"
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsMuted(!isMuted);
                                    }}
                                    className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-full text-white z-30 hover:bg-black/60 transition-colors"
                                >
                                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                </button>
                                <div className="absolute top-4 left-4 bg-david-green/90 text-white text-[10px] font-bold px-2 py-1 rounded-sm flex items-center gap-1 z-30">
                                    <Play className="w-3 h-3 fill-current" />
                                    <span>VIDEO</span>
                                </div>
                            </div>
                        ) : (
                            <Image
                                src={currentMedia?.url || '/placeholder.jpg'}
                                alt={currentMedia?.alt || productName}
                                fill
                                priority
                                className="object-cover select-none"
                            />
                        )}

                        {isOnSale && currentMedia?.isMain && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="absolute top-4 right-4 bg-rose-600 text-white text-[10px] md:text-xs font-serif tracking-widest px-4 py-1.5 shadow-lg z-20"
                            >
                                SALE
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Desktop Navigation Arrows */}
                <div className="hidden md:block">
                    {index > 0 && (
                        <button
                            onClick={handlePrev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-stone-900 opacity-0 group-hover/gallery:opacity-100 transition-opacity z-20 hover:bg-white"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                    )}
                    {index < sortedMedia.length - 1 && (
                        <button
                            onClick={handleNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-stone-900 opacity-0 group-hover/gallery:opacity-100 transition-opacity z-20 hover:bg-white"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    )}
                </div>

                {/* Mobile/Progress Dots */}
                {sortedMedia.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
                        {sortedMedia.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setIndex(i)}
                                className="relative py-2 focus:outline-none"
                            >
                                <motion.div
                                    animate={{
                                        width: i === index ? 24 : 8,
                                        backgroundColor: i === index ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.4)',
                                    }}
                                    className="h-1.5 rounded-full shadow-sm"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Desktop Thumbnails Grid */}
            {sortedMedia.length > 1 && (
                <div className="hidden md:grid grid-cols-5 gap-3 mt-4">
                    {sortedMedia.map((media, i) => (
                        <button
                            key={media.id || i}
                            onClick={() => setIndex(i)}
                            className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-300 ${i === index ? 'ring-2 ring-david-green ring-offset-2 scale-95' : 'opacity-60 hover:opacity-100'
                                }`}
                        >
                            {media.type === 'VIDEO' ? (
                                <div className="w-full h-full bg-stone-900 flex items-center justify-center">
                                    <Video className="text-white/50 w-6 h-6" />
                                </div>
                            ) : (
                                <Image
                                    src={media.url}
                                    alt={media.alt || productName}
                                    fill
                                    className="object-cover"
                                />
                            )}
                            {media.type === 'VIDEO' && (
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <Play className="w-4 h-4 text-white fill-current opacity-70" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

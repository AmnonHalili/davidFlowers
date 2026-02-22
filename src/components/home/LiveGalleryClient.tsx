'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

type GalleryImage = {
    id: string;
    url: string;
    caption: string | null;
    takenAt: Date;
};

export default function LiveGalleryClient({ images }: { images: GalleryImage[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: 'left' | 'right') => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
    };

    return (
        <div className="relative group">
            {/* Navigation Arrows */}
            <button
                onClick={() => scroll('right')}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
                <ChevronRight className="w-5 h-5 text-stone-700" />
            </button>
            <button
                onClick={() => scroll('left')}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
                <ChevronLeft className="w-5 h-5 text-stone-700" />
            </button>

            {/* Scrollable container */}
            <div
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto scrollbar-hide px-6 pb-4"
                style={{ scrollSnapType: 'x mandatory' }}
            >
                {images.map((img, index) => (
                    <motion.div
                        key={img.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06 }}
                        className="shrink-0 relative overflow-hidden rounded-2xl shadow-md cursor-pointer group/item"
                        style={{
                            scrollSnapAlign: 'start',
                            width: index % 3 === 0 ? '260px' : '200px',
                            height: index % 3 === 0 ? '340px' : '280px',
                        }}
                    >
                        <img
                            src={img.url}
                            alt={img.caption || 'ישירות מהחנות'}
                            className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500"
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />

                        {/* Timestamp badge */}
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                            {formatDistanceToNow(new Date(img.takenAt), { addSuffix: true, locale: he })}
                        </div>

                        {/* Caption */}
                        {img.caption && (
                            <div className="absolute bottom-0 inset-x-0 p-3 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                <p className="text-white text-xs font-medium leading-snug text-right">{img.caption}</p>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

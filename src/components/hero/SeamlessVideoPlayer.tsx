'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SeamlessVideoPlayerProps {
    videos: string[];
    poster?: string;
    overlayOpacity?: number;
    showDots?: boolean;
}

export default function SeamlessVideoPlayer({
    videos,
    poster = '/hero-bg.jpg',
    overlayOpacity = 35,
    showDots = true,
}: SeamlessVideoPlayerProps) {
    const validVideos = videos.length > 0 ? videos : ['/David-Video.mp4'];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [shouldLoadAll, setShouldLoadAll] = useState(false);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

    useEffect(() => {
        // Lazy load the rest of the videos after a short delay to keep initial page load fast
        const timer = setTimeout(() => {
            setShouldLoadAll(true);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Pause all other videos
        videoRefs.current.forEach((video, index) => {
            if (video && index !== currentIndex) {
                video.pause();
                video.currentTime = 0;
            }
        });

        // Play the active video
        const currentVideo = videoRefs.current[currentIndex];
        if (currentVideo) {
            currentVideo.currentTime = 0;
            const playPromise = currentVideo.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // Autoplay with muted is allowed by all browsers, but handle silently if restricted
                });
            }
        }
    }, [currentIndex, shouldLoadAll]);

    useEffect(() => {
        const handleInteraction = () => {
            const currentVideo = videoRefs.current[currentIndex];
            if (currentVideo && currentVideo.paused) {
                currentVideo.play().catch(() => { });
            }
        };

        window.addEventListener('touchstart', handleInteraction, { once: true });
        window.addEventListener('click', handleInteraction, { once: true });
        window.addEventListener('scroll', handleInteraction, { once: true });

        return () => {
            window.removeEventListener('touchstart', handleInteraction);
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('scroll', handleInteraction);
        };
    }, [currentIndex]);

    const videosToRender = shouldLoadAll ? validVideos : [validVideos[0]];

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-stone-900">
            {/* Poster / Placeholder Image */}
            {poster && (
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-1000"
                    style={{
                        backgroundImage: `url(${poster})`,
                        opacity: currentIndex === 0 ? 1 : 0,
                    }}
                />
            )}

            {videosToRender.map((src, index) => {
                const isCurrent = index === currentIndex;

                return (
                    <motion.video
                        key={src + index}
                        ref={(el) => {
                            if (el) {
                                el.defaultMuted = true;
                                el.muted = true;
                            }
                            videoRefs.current[index] = el;
                        }}
                        src={src}
                        muted
                        playsInline
                        autoPlay={index === 0}
                        loop={validVideos.length === 1} // Loop if single video
                        poster={index === 0 ? poster : undefined}
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: isCurrent ? 1 : 0,
                            zIndex: isCurrent ? 2 : 1,
                        }}
                        transition={{ duration: 1.5, ease: 'easeInOut' }}
                        onEnded={() => {
                            if (isCurrent && validVideos.length > 1) {
                                setCurrentIndex((prev) => (prev + 1) % validVideos.length);
                            }
                        }}
                        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                    />
                );
            })}

            {/* Configurable Darkness Tint */}
            <div
                className="absolute inset-0 pointer-events-none transition-colors duration-500 z-10"
                style={{
                    backgroundColor: `rgba(15, 26, 19, ${overlayOpacity / 100})`,
                }}
            />

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A13]/80 via-transparent to-[#0F1A13]/30 pointer-events-none z-10" />

            {/* Multi-video switch dots */}
            {showDots && validVideos.length > 1 && (
                <div className="absolute bottom-14 md:bottom-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 pointer-events-auto">
                    {validVideos.map((_, idx) => {
                        const isActive = idx === currentIndex;
                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setCurrentIndex(idx)}
                                aria-label={`עבור לסרטון ${idx + 1}`}
                                className="p-1 flex items-center justify-center focus:outline-none rounded-full"
                            >
                                <span
                                    className={`block transition-all duration-300 rounded-full h-2 ${isActive
                                        ? 'w-6 bg-david-beige shadow-sm shadow-white/30'
                                        : 'w-2 bg-white/40 hover:bg-white/70'
                                        }`}
                                />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

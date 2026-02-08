'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SeamlessVideoPlayerProps {
    videos: string[];
    poster?: string;
}

export default function SeamlessVideoPlayer({ videos, poster }: SeamlessVideoPlayerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [shouldLoadAll, setShouldLoadAll] = useState(false);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

    useEffect(() => {
        // Lazy load the rest of the videos after a short delay
        const timer = setTimeout(() => {
            setShouldLoadAll(true);
        }, 4000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Pause all videos first
        videoRefs.current.forEach((video, index) => {
            if (video && index !== currentIndex) {
                video.pause();
                // Don't reset time immediately to allow smooth cross-fade if needed, 
                // but here we want to ensure next play starts from 0 if it's a loop.
                // Resetting usually safer for "looping playlist" logic.
                video.currentTime = 0;
            }
        });

        // When currentIndex changes, ensure the new video plays from the start
        const currentVideo = videoRefs.current[currentIndex];
        if (currentVideo) {
            currentVideo.currentTime = 0;
            const playPromise = currentVideo.play();
            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    console.error("Video play error:", error);
                });
            }
        }
    }, [currentIndex, shouldLoadAll]); // Re-run when new videos might be mounted

    const videosToRender = shouldLoadAll ? videos : [videos[0]];

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-stone-900">
            {/* Poster / Placeholder Image */}
            {poster && (
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-1000"
                    style={{
                        backgroundImage: `url(${poster})`,
                        opacity: currentIndex === 0 ? 1 : 0 // Fade out poster when switching, or keep it as reliable background
                    }}
                />
            )}

            {videosToRender.map((src, index) => {
                const isCurrent = index === currentIndex;

                return (
                    <motion.video
                        key={src}
                        ref={(el) => {
                            videoRefs.current[index] = el;
                        }}
                        src={src}
                        muted // Muted is required for autoplay
                        playsInline
                        autoPlay={index === 0} // Autoplay first video
                        loop={false}
                        poster={index === 0 ? poster : undefined}
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: isCurrent ? 1 : 0, // Fully visible when current
                            zIndex: isCurrent ? 2 : 1
                        }}
                        transition={{ duration: 1.5, ease: "easeInOut" }} // Smoother cross-fade
                        onEnded={() => {
                            if (isCurrent) {
                                setCurrentIndex((prev) => (prev + 1) % videos.length);
                            }
                        }}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                );
            })}
        </div>
    );
}

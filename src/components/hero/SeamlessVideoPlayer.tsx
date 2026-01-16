'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SeamlessVideoPlayerProps {
    videos: string[];
}

export default function SeamlessVideoPlayer({ videos }: SeamlessVideoPlayerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

    useEffect(() => {
        // Pause all videos first
        videoRefs.current.forEach((video, index) => {
            if (video && index !== currentIndex) {
                video.pause();
                video.currentTime = 0; // Reset non-current videos
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
    }, [currentIndex]);

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-stone-900">
            {videos.map((src, index) => {
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
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: isCurrent ? 0.9 : 0,
                            zIndex: isCurrent ? 2 : 1
                        }}
                        transition={{ duration: 1.0, ease: "linear" }}
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

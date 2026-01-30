'use client';

import { Instagram } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const INSTAGRAM_URL = 'https://www.instagram.com/davidflower__?igsh=NXNudHU1emMwcWVl';

const INSTAGRAM_POSTS = [
    {
        id: 1,
        image: '/images/instagram/ig-1-final.png', // Uploaded by user (Final Replacement)
        link: 'https://www.instagram.com/p/DNXauzICUWg/?img_index=1&igsh=d3h3b3B5eTllc21q'
    },
    {
        id: 2,
        image: '/images/instagram/ig-2.png', // Uploaded by user
        link: 'https://www.instagram.com/p/DQ_yLMWgjH2/?igsh=MXR2OHBtbWYxN2o2bA%3D%3D'
    },
    {
        id: 3,
        image: '/images/instagram/ig-3.png', // Uploaded by user
        link: 'https://www.instagram.com/p/DQtVNs4AvDF/?igsh=MXE3bmtlMHFiMGF0NQ%3D%3D'
    },
    {
        id: 4,
        image: '/images/instagram/ig-4.png', // Uploaded by user
        link: 'https://www.instagram.com/p/DQoHrU1gkuU/?igsh=MXFjcGRxMDRpdTYzcA%3D%3D'
    },
    {
        id: 5,
        image: '/images/instagram/ig-5.png', // Uploaded by user
        link: 'https://www.instagram.com/p/DPOJLrIAp1w/?igsh=MWJqYmdyd2t6dG1n'
    },
    {
        id: 6,
        image: '/images/instagram/ig-6.png', // Uploaded by user
        link: 'https://www.instagram.com/p/DJlYgbnCudR/?igsh=MTdlb3JucjZ1em92bg%3D%3D'
    }
];

export default function InstagramFeed() {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-screen-2xl mx-auto">
                <div className="text-center mb-10 space-y-2">
                    <span className="text-xs uppercase tracking-[0.2em] text-stone-500 font-medium">
                        Follow Us
                    </span>
                    <h2 className="font-serif text-3xl md:text-5xl text-stone-900" dir="ltr">
                        @davidflower__
                    </h2>
                </div>

                {/* Grid container */}
                <div className="flex overflow-x-auto md:grid md:grid-cols-6 gap-1 md:gap-0 no-scrollbar snap-x snap-mandatory">
                    {INSTAGRAM_POSTS.map((post) => (
                        <Link
                            key={post.id}
                            href={post.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative block min-w-[40vw] md:min-w-0 aspect-square overflow-hidden snap-center"
                        >
                            <Image
                                src={post.image}
                                alt="Instagram Post"
                                fill
                                className="object-cover transition-transform duration-700 md:group-hover:scale-110"
                            />

                            {/* Desktop Hover Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <Instagram className="w-8 h-8 text-white" strokeWidth={1.5} />
                            </div>

                            {/* Mobile Icon (always visible but subtle) */}
                            <div className="absolute top-2 right-2 md:hidden">
                                <Instagram className="w-5 h-5 text-white/90 drop-shadow-md" strokeWidth={1.5} />
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Link
                        href={INSTAGRAM_URL}
                        target="_blank"
                        className="inline-block border-b border-stone-900 pb-1 text-xs uppercase tracking-widest hover:text-stone-500 transition-colors"
                    >
                        לפרופיל האינסטגרם
                    </Link>
                </div>
            </div>
        </section>
    );
}

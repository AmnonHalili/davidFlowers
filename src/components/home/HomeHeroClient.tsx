'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import SeamlessVideoPlayer from '@/components/hero/SeamlessVideoPlayer';

interface HomeHeroClientProps {
    videos: string[];
}

export default function HomeHeroClient({ videos }: HomeHeroClientProps) {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 150]);

    return (
        <section className="relative h-[85vh] md:h-screen w-full overflow-hidden">
            {/* Background - Video */}
            <div className="absolute inset-0 bg-stone-900">
                {videos.length > 0 ? (
                    <SeamlessVideoPlayer videos={videos} poster="/hero-bg.jpg" />
                ) : (
                    <div className="w-full h-full bg-stone-900" />
                )}

                {/* Cinematic Warm Overlay (Sepia/Deep Green Tint) */}
                <div className="absolute inset-0 bg-[#0F1A13]/25 mix-blend-multiply z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A13]/70 via-transparent to-[#0F1A13]/20 z-10" />
            </div>

            {/* Parallax Botanical Element (Floating Rose Petal Effect) */}
            <motion.div
                style={{ y: y1, rotate: scrollY }}
                className="absolute top-[15%] right-[10%] md:right-[20%] opacity-40 blur-[1px] z-20 pointer-events-none hidden md:block"
            >
                <Image src="/medium-zer.png" alt="Floating Petal" width={192} height={192} className="object-contain drop-shadow-2xl" />
            </motion.div>

            {/* Hero Content */}
            <div className="relative h-full flex flex-col justify-center items-center text-center text-white p-6 pt-32 pb-24 md:pt-36 md:pb-12 z-20">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-8 max-w-4xl"
                >
                    <div className="flex flex-col items-center gap-4 mb-2">
                        {/* Garden Elegance Tagline */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="inline-block px-5 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full shadow-lg"
                        >
                            <h2 className="text-[10px] md:text-xs tracking-[0.3em] uppercase font-light text-white/90">
                                Garden Elegance • Est. 2024
                            </h2>
                        </motion.div>

                        {/* Social Proof Stats */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center gap-2 text-david-beige"
                        >
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <svg key={s} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <span className="text-[11px] font-medium tracking-wide opacity-90">4.9/5 (1,500+ לקוחות מרוצים)</span>
                        </motion.div>
                    </div>

                    <h1 className="font-bellefair text-white drop-shadow-2xl shadow-black/70 tracking-wide flex flex-col items-center">
                        <span className="text-7xl md:text-8xl lg:text-[7rem] drop-shadow-glow mb-2">פרחי דוד</span>
                        <span className="text-xl md:text-2xl font-sans font-light tracking-[0.2em] md:tracking-[0.3em] text-white/95">אומנות השזירה באשקלון</span>
                    </h1>

                    <p className="font-bellefair text-2xl md:text-4xl text-[#F5F5F5] italic mt-6 opacity-95 drop-shadow-md">
                        "לשמח את מי שאתם אוהבים"
                    </p>

                    <p className="font-sans font-light text-stone-100 text-lg md:text-xl max-w-lg mx-auto leading-relaxed tracking-[0.1em] hidden md:block opacity-90">
                        סידורי פרחים פרימיום, משלוחים מהיום להיום וטריות חסרת פשרות.
                    </p>

                    <div className="pt-8 flex flex-col md:flex-row gap-5 justify-center items-center">
                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <Link
                                href="/shop"
                                className="group relative flex items-center justify-center gap-3 px-14 py-5 bg-david-green border border-david-green/50 text-white uppercase tracking-[0.25em] text-xs font-bold rounded-full overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(58,80,68,0.4)]"
                            >
                                <span className="relative z-10 text-david-beige">להזמנת משלוח</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            </Link>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <a
                                href="https://wa.me/972535879344"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 px-10 py-5 bg-white/5 border border-white/20 backdrop-blur-md text-white/90 uppercase tracking-[0.2em] text-xs font-bold rounded-full hover:bg-white/10 hover:text-white transition-all"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.432h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                <span>WhatsApp לשאלות</span>
                            </a>
                        </motion.div>
                    </div>

                    {/* Scroll Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 1 }}
                        className="absolute bottom-16 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-white/40"
                    >
                        <span className="text-[10px] tracking-[0.2em] font-light uppercase">גלו עוד</span>
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent"
                        />
                    </motion.div>
                </motion.div>
            </div>

            {/* Marquee Strip */}
            <div className="absolute bottom-0 left-0 right-0 bg-david-green text-david-beige py-2 md:py-3 overflow-hidden whitespace-nowrap z-20">
                <motion.div
                    animate={{ x: [0, -1000] }}
                    transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                    className="inline-block"
                >
                    <span className="mx-8 text-sm uppercase tracking-widest font-medium">10% הנחה בהזמנה ראשונה - קוד קופון: DAVID10</span>
                    <span className="mx-8 text-sm uppercase tracking-widest font-medium">•</span>
                    <span className="mx-8 text-sm uppercase tracking-widest font-medium">משלוחים מהיום להיום באשקלון והסביבה</span>
                    <span className="mx-8 text-sm uppercase tracking-widest font-medium">•</span>
                    <span className="mx-8 text-sm uppercase tracking-widest font-medium">החנות שלנו: רחבעם זאבי 4, אשקלון (מתחם האייקון)</span>
                    <span className="mx-8 text-sm uppercase tracking-widest font-medium">•</span>
                    <span className="mx-8 text-sm uppercase tracking-widest font-medium">עטוף באהבה: 100% טריות מובטחת</span>
                    {/* Duplicate loop */}
                    <span className="mx-8 text-sm uppercase tracking-widest font-medium">10% הנחה בהזמנה ראשונה - קוד קופון: DAVID10</span>
                    <span className="mx-8 text-sm uppercase tracking-widest font-medium">•</span>
                    <span className="mx-8 text-sm uppercase tracking-widest font-medium">משלוחים מהיום להיום באשקלון והסביבה</span>
                    <span className="mx-8 text-sm uppercase tracking-widest font-medium">•</span>
                    <span className="mx-8 text-sm uppercase tracking-widest font-medium">החנות שלנו: רחבעם זאבי 4, אשקלון (מתחם האייקון)</span>
                    <span className="mx-8 text-sm uppercase tracking-widest font-medium">•</span>
                    <span className="mx-8 text-sm uppercase tracking-widest font-medium">עטוף באהבה: 100% טריות מובטחת</span>
                </motion.div>
            </div>
        </section>
    );
}

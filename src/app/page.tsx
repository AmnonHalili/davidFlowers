'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, Flower2 } from 'lucide-react';
import SeamlessVideoPlayer from '@/components/hero/SeamlessVideoPlayer';
import CategoryExplorer from '@/components/home/CategoryExplorer';
import InstagramFeed from '@/components/home/InstagramFeed';

// Configuration for Hero Videos
const HERO_VIDEOS = [
  '/David-Video.mp4',
  '/David-Video2.mp4',
  '/kling_20260116_Text_to_Video_Close_up_s_5012_0.mp4'
];

export default function Home() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Background - Video or Parallax Image */}
        <div className="absolute inset-0 bg-stone-900">
          {HERO_VIDEOS.length > 0 ? (
            <SeamlessVideoPlayer videos={HERO_VIDEOS} />
          ) : (
            <motion.div
              style={{ y: y1 }}
              className="w-full h-full"
            >
              <img
                src="/hero-bg.jpg"
                alt="חנות פרחים דוד"
                className="w-full h-[120%] object-cover opacity-90"
              />
            </motion.div>
          )}

          {/* Professional Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30 md:via-transparent z-10" />
        </div>

        {/* Hero Content */}
        <div className="relative h-full flex flex-col justify-center items-center text-center text-white p-6 pt-24 md:pt-32 z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6 max-w-2xl"
          >
            <h2 className="text-[10px] md:text-sm tracking-[0.3em] uppercase font-medium text-white/90">
              קולקציית חורף 2026
            </h2>
            <h1 className="font-serif text-[3.5rem] leading-[1.1] md:text-7xl lg:text-8xl tracking-tight md:leading-tight">
              לשמח את <br className="md:hidden" /> מי שאתם אוהבים.
            </h1>
            <p className="font-light text-white/80 text-base md:text-xl max-w-xs md:max-w-lg mx-auto leading-relaxed">
              אל תחכו לאירוע מיוחד. משלוחי פרחים טריים באשקלון והסביבה שהופכים כל רגע משגרה לחגיגה.
            </p>

            <div className="pt-8 flex flex-col md:flex-row gap-4 justify-center items-center pb-20 md:pb-0">
              <Link
                href="/shop"
                className="px-10 py-4 bg-[#1B3322] text-white uppercase tracking-widest text-xs font-bold hover:bg-[#1B3322]/90 transition-colors min-w-[200px] shadow-lg"
              >
                להזמנת משלוח
              </Link>
              <Link
                href="#best-sellers"
                className="px-10 py-4 border border-white text-white uppercase tracking-widest text-xs font-bold hover:bg-white/10 transition-colors min-w-[200px]"
              >
                לזרים הנמכרים ביותר
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Marquee Strip */}
      <div className="bg-david-green text-david-beige py-3 overflow-hidden whitespace-nowrap relative">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="inline-block"
        >
          {/* Duplicated content for seamless generic marquee loop */}
          <span className="mx-8 text-sm uppercase tracking-widest font-medium">משלוח חינם בהזמנה ראשונה - קוד קופון: WELCOME</span>
          <span className="mx-8 text-sm uppercase tracking-widest font-medium">•</span>
          <span className="mx-8 text-sm uppercase tracking-widest font-medium">משלוחים מהיום להיום באשקלון והסביבה</span>
          <span className="mx-8 text-sm uppercase tracking-widest font-medium">•</span>
          <span className="mx-8 text-sm uppercase tracking-widest font-medium">עטוף באהבה: 100% טריות מובטחת</span>
          <span className="mx-8 text-sm uppercase tracking-widest font-medium">•</span>
          <span className="mx-8 text-sm uppercase tracking-widest font-medium">משלוח חינם בהזמנה ראשונה - קוד קופון: WELCOME</span>
          <span className="mx-8 text-sm uppercase tracking-widest font-medium">•</span>
          <span className="mx-8 text-sm uppercase tracking-widest font-medium">משלוחים מהיום להיום באשקלון והסביבה</span>
          <span className="mx-8 text-sm uppercase tracking-widest font-medium">•</span>
          <span className="mx-8 text-sm uppercase tracking-widest font-medium">עטוף באהבה: 100% טריות מובטחת</span>
        </motion.div>
      </div>

      {/* Featured Categories - Replaced with Dynamic Explorer */}
      <section id="best-sellers" className="scroll-mt-24">
        <CategoryExplorer />
      </section>

      {/* Instagram Feed */}
      <InstagramFeed />


      {/* Value Proposition */}
      <section className="bg-stone-50 py-24 px-6 border-y border-stone-200">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <Flower2 className="w-12 h-12 mx-auto text-stone-300 opacity-50" strokeWidth={1} />
          <h2 className="font-serif text-3xl md:text-5xl leading-tight text-stone-900">
            "אנחנו מאמינים שפרחים הם לא סתם קישוט. <br /> הם אומנות חיה שמשנה את האווירה בבית."
          </h2>
          <p className="text-stone-500 font-light max-w-md mx-auto leading-relaxed">
            הפרחים שלנו נבחרים בקפידה ממגדלי בוטיק, תוך דגש על טריות ללא פשרות ושמירה על קיימות.
          </p>
          <button className="text-stone-900 text-xs uppercase tracking-widest font-bold hover:text-stone-500 transition-colors">
            הסיפור שלנו
          </button>
        </div>
      </section>


    </main>
  );
}

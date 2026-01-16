'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, Flower2 } from 'lucide-react';
import SeamlessVideoPlayer from '@/components/hero/SeamlessVideoPlayer';

// Configuration for Hero Videos
const HERO_VIDEOS = ['/David-Video.mp4', '/David-Video2.mp4'];

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
              פרחים, <br className="md:hidden" /> ברמה אחרת.
            </h1>
            <p className="font-light text-white/80 text-base md:text-xl max-w-xs md:max-w-lg mx-auto leading-relaxed">
              חוויה של פריחה אצלך בבית. זרי בוטיק שזורים ביד, במשלוח שבועי.
            </p>

            <div className="pt-8 flex flex-col md:flex-row gap-4 justify-center items-center">
              <Link
                href="/shop/bouquets"
                className="px-10 py-4 bg-white text-stone-900 uppercase tracking-widest text-xs font-bold hover:bg-stone-100 transition-colors min-w-[200px]"
              >
                לקולקציה
              </Link>
              <Link
                href="/shop/subscriptions"
                className="px-10 py-4 border border-white text-white uppercase tracking-widest text-xs font-bold hover:bg-white/10 transition-colors min-w-[200px]"
              >
                מנוי הפתעה
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

      {/* Featured Categories */}
      <section className="py-16 md:py-32 bg-white px-4 md:px-6">
        <div className="max-w-screen-2xl mx-auto space-y-12 md:space-y-16">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <span className="block text-[10px] md:text-xs uppercase tracking-widest text-stone-500">מהדורות מיוחדות</span>
              <h2 className="font-serif text-3xl md:text-4xl text-stone-900">קטגוריות מובילות</h2>
            </div>
            <Link href="/shop" className="hidden md:flex items-center gap-2 text-xs uppercase tracking-widest hover:text-stone-500 transition-colors">
              לכל הזרים <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4">
            {[
              {
                name: 'הזר השבועי',
                image: 'https://images.unsplash.com/photo-1599580667087-9bb3cb8533bc?q=80&w=1000&auto=format&fit=crop',
                link: '/category/bouquets'
              },
              {
                name: 'כלות ואירועים',
                image: '/AVIRA-T-55.jpg',
                link: '/category/wedding'
              },
              {
                name: 'יבשים ונצחיים',
                image: 'https://images.unsplash.com/photo-1627514787955-32e67df1bb8c?q=80&w=1000&auto=format&fit=crop',
                link: '/category/gifts'
              }
            ].map((cat, i) => (
              <Link href={cat.link} key={cat.name} className="group relative aspect-[3/4] overflow-hidden bg-stone-100 block">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors" />
                <div className="absolute bottom-6 left-6 right-6 text-right">
                  <h3 className="text-white font-serif text-2xl mb-2">{cat.name}</h3>
                  <span className="inline-block border-b border-white pb-1 text-white text-xs uppercase tracking-widest opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    גלה עוד
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="md:hidden flex justify-center pt-8">
            <Link href="/shop" className="text-xs uppercase tracking-widest border-b border-stone-900 pb-1">
              לכל הקטגוריות
            </Link>
          </div>
        </div>
      </section>

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

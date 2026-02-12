'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, Flower2 } from 'lucide-react';
import SeamlessVideoPlayer from '@/components/hero/SeamlessVideoPlayer';
import CategoryExplorer from '@/components/home/CategoryExplorer';
import InstagramFeed from '@/components/home/InstagramFeed';
import CustomerTestimonials from '@/components/home/CustomerTestimonials';

// Configuration for Hero Videos
const HERO_VIDEOS = [
  '/David-Video.mp4',
  '/David-Video2.mp4',
  '/kling_20260116_Text_to_Video_Close_up_s_5012_0.mp4'
];

export default function Home() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Florist',
    name: 'פרחי דוד',
    image: 'https://davidflowers.co.il/logo_original.jpg',
    logo: 'https://davidflowers.co.il/David-Logo-Enhanced.png',
    description: 'משלוחי פרחים טריים, עציצים ומתנות באשקלון והסביבה. חנות פרחים מובילה עם משלוחים מהיום להיום.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Ashkelon',
      addressCountry: 'IL'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 31.669,
      longitude: 34.574
    },
    url: 'https://davidflowers.co.il',
    telephone: '+972-53-587-9344',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        opens: '10:00',
        closes: '19:30'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday'
        ],
        opens: '09:00',
        closes: '19:30'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Friday',
        opens: '08:00',
        closes: '14:30'
      }
    ],
    priceRange: '₪₪'
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Background - Video */}
        <div className="absolute inset-0 bg-stone-900">
          {HERO_VIDEOS.length > 0 ? (
            <SeamlessVideoPlayer videos={HERO_VIDEOS} poster="/hero-bg.jpg" />
          ) : (
            <div className="w-full h-full bg-stone-900" />
          )}

          {/* Cinematic Warm Overlay (Sepia/Deep Green Tint) */}
          <div className="absolute inset-0 bg-[#0F1A13]/40 mix-blend-multiply z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A13]/80 via-transparent to-[#0F1A13]/30 z-10" />


          {/* Grain Overlay for Texture (Optional, adds cinematic feel) - Removed due to missing asset */}
        </div>

        {/* Parallax Botanical Element (Floating Rose Petal Effect) */}
        <motion.div
          style={{ y: y1, rotate: scrollY }}
          className="absolute top-[15%] right-[10%] md:right-[20%] opacity-40 blur-[1px] z-20 pointer-events-none hidden md:block"
        >
          <img src="/medium-zer.png" alt="Floating Petal" className="w-32 h-32 md:w-48 md:h-48 object-contain drop-shadow-2xl" />
        </motion.div>

        {/* Hero Content */}
        <div className="relative h-full flex flex-col justify-center items-center text-center text-white p-6 pt-24 md:pt-32 z-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8 max-w-4xl"
          >
            <div className="overflow-hidden mb-2">
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="inline-block px-4 py-1.5 md:px-6 md:py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full shadow-lg"
              >
                <h2 className="text-[9px] md:text-xs tracking-[0.25em] uppercase font-light text-white/80 drop-shadow-sm">
                  Garden Elegance • Est. 2024
                </h2>
              </motion.div>
            </div>

            {/* SEO Optimized H1 */}
            <h1 className="font-bellefair text-white drop-shadow-xl shadow-black/50 tracking-wide flex flex-col items-center">
              <span className="text-6xl md:text-7xl lg:text-[6rem] drop-shadow-lg mb-1 md:mb-2">פרחי דוד</span>
              <span className="text-xl md:text-2xl font-sans font-light tracking-[0.15em] md:tracking-[0.25em] text-white/90">משלוחי פרחים באשקלון</span>
            </h1>

            <p className="font-bellefair text-2xl md:text-4xl text-[#E8E8E8] italic mt-6 opacity-90 drop-shadow-md">
              "לשמח את מי שאתם אוהבים"
            </p>

            <p className="font-sans font-light text-stone-100 text-lg md:text-xl max-w-lg mx-auto leading-relaxed tracking-[0.15em] mix-blend-screen hidden md:block">
              אומנות השזירה פוגשת טריות חסרת פשרות. משלוחי פרחים באשקלון שהופכים רגעים לזיכרונות.
            </p>

            <span className="block mt-8 mb-4 md:mt-2 text-sm md:text-base font-bold text-white drop-shadow-sm opacity-90">
              רחבעם זאבי 4, אשקלון (מתחם האייקון)
            </span>

            <div className="pt-10 flex flex-col md:flex-row gap-6 justify-center items-center">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/shop"
                  className="group relative flex items-center justify-center gap-3 px-12 py-5 bg-white/10 border border-white/20 backdrop-blur-md text-white uppercase tracking-[0.2em] text-xs font-bold rounded-sm overflow-hidden transition-all duration-500 hover:bg-white/20 hover:border-white/40 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                >
                  <span className="relative z-10">להזמנת משלוח</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="#best-sellers"
                  className="flex items-center justify-center px-12 py-5 text-white/80 uppercase tracking-[0.2em] text-xs font-medium hover:text-white transition-colors border-b border-transparent hover:border-white/30"
                >
                  לזרים הנמכרים ביותר
                </Link>
              </motion.div>
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
          <span className="mx-8 text-sm uppercase tracking-widest font-medium">10% הנחה בהזמנה ראשונה - קוד קופון: DAVID10</span>
          <span className="mx-8 text-sm uppercase tracking-widest font-medium">•</span>
          <span className="mx-8 text-sm uppercase tracking-widest font-medium">משלוחים מהיום להיום באשקלון והסביבה</span>
          <span className="mx-8 text-sm uppercase tracking-widest font-medium">•</span>
          <span className="mx-8 text-sm uppercase tracking-widest font-medium">החנות שלנו: רחבעם זאבי 4, אשקלון (מתחם האייקון)</span>
          <span className="mx-8 text-sm uppercase tracking-widest font-medium">•</span>
          <span className="mx-8 text-sm uppercase tracking-widest font-medium">עטוף באהבה: 100% טריות מובטחת</span>
          <span className="mx-8 text-sm uppercase tracking-widest font-medium">•</span>
          <span className="mx-8 text-sm uppercase tracking-widest font-medium">10% הנחה בהזמנה ראשונה - קוד קופון: DAVID10</span>
          <span className="mx-8 text-sm uppercase tracking-widest font-medium">•</span>
          <span className="mx-8 text-sm uppercase tracking-widest font-medium">משלוחים מהיום להיום באשקלון והסביבה</span>
          <span className="mx-8 text-sm uppercase tracking-widest font-medium">•</span>
          <span className="mx-8 text-sm uppercase tracking-widest font-medium">החנות שלנו: רחבעם זאבי 4, אשקלון (מתחם האייקון)</span>
          <span className="mx-8 text-sm uppercase tracking-widest font-medium">•</span>
          <span className="mx-8 text-sm uppercase tracking-widest font-medium">עטוף באהבה: 100% טריות מובטחת</span>
        </motion.div>
      </div>

      {/* Featured Categories - Replaced with Dynamic Explorer */}
      <section id="best-sellers" className="scroll-mt-24">
        <CategoryExplorer />
      </section>

      {/* Social Proof Section */}
      <CustomerTestimonials />

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

import Link from 'next/link';
import { Flower2 } from 'lucide-react';
import SeamlessVideoPlayer from '@/components/hero/SeamlessVideoPlayer';
import CategoryExplorer from '@/components/home/CategoryExplorer';
import InstagramFeed from '@/components/home/InstagramFeed';
import CustomerTestimonials from '@/components/home/CustomerTestimonials';
import TrustBar from '@/components/home/TrustBar';
import LiveGallery from '@/components/home/LiveGallery';
import { getVisibleCategories } from '@/app/actions/product-actions';
import HomeHeroClient from '@/components/home/HomeHeroClient';
import HomeSEOContent from '@/components/home/HomeSEOContent';

// Configuration for Hero Videos
const HERO_VIDEOS = [
  '/David-Video.mp4',
  '/David-Video2.mp4',
  '/kling_20260116_Text_to_Video_Close_up_s_5012_0.mp4'
];

export default async function Home() {
  const categoriesRes = await getVisibleCategories();
  const categories = categoriesRes.success ? categoriesRes.categories : [];

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
    priceRange: '₪₪',
    areaServed: [
      { '@type': 'City', name: 'Ashkelon' },
      { '@type': 'City', name: 'Nitzan' },
      { '@type': 'City', name: 'Be\'er Ganim' },
      { '@type': 'City', name: 'Nitzanim' },
      { '@type': 'City', name: 'Hodiya' },
      { '@type': 'City', name: 'Berekhya' }
    ],
    knowsAbout: [
      'משלוחי פרחים באשקלון',
      'זרי פרחים מעוצבים',
      'עציצים ומתנות',
      'שזירה אמנותית'
    ]
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HomeHeroClient videos={HERO_VIDEOS} />

      {/* Trust Signals - Visible above the fold */}
      <TrustBar />

      {/* Featured Categories - Replaced with Dynamic Explorer */}
      <section id="best-sellers" className="scroll-mt-24">
        <CategoryExplorer initialCategories={categories} />
      </section>

      {/* Social Proof Section */}
      <CustomerTestimonials />

      {/* Live Gallery - Real photos from the shop */}
      <LiveGallery />

      {/* Instagram Feed */}
      <InstagramFeed />

      {/* SEO Strategic Content */}
      <HomeSEOContent />


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
          <Link href="/about" className="text-stone-900 text-xs uppercase tracking-widest font-bold hover:text-stone-500 transition-colors">
            הסיפור שלנו
          </Link>
        </div>
      </section>
    </main>
  );
}

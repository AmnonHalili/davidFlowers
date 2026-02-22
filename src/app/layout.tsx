import type { Metadata } from 'next';
import { Heebo, Frank_Ruhl_Libre, Bellefair, Assistant } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo'
});

const frankRuhl = Frank_Ruhl_Libre({
  subsets: ['hebrew', 'latin'],
  variable: '--font-frank-ruhl'
});

const bellefair = Bellefair({
  weight: '400',
  subsets: ['hebrew', 'latin'],
  variable: '--font-bellefair'
});

const assistant = Assistant({
  subsets: ['hebrew', 'latin'],
  variable: '--font-assistant'
});

export const metadata: Metadata = {
  title: 'פרחי דוד אשקלון | משלוחי פרחים באשקלון והסביבה',
  description: 'פרחי דוד - חנות פרחים באשקלון המציעה משלוחי פרחים טריים, עציצים, ומתנות מעוצבות. משלוח מהיום להיום באשקלון והסביבה.',
  keywords: 'פרחים באשקלון, משלוח פרחים באשקלון, מתנות באשקלון, עציצים באשקלון, חנות פרחים אשקלון, זרי פרחים אשקלון',
  openGraph: {
    title: 'פרחי דוד אשקלון | משלוח פרחים באשקלון',
    description: 'משלוחי פרחים טריים, עציצים ומתנות באשקלון והסביבה.',
    images: ['/logo_original.jpg'],
    siteName: 'פרחי דוד',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/logo_original.jpg'],
  },
  verification: {
    google: 'rDkvHMWzuXR1l-ff5fT-OGHsMov-4gbkjnEAfBwpnkk',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: {
      rel: 'icon',
      url: '/logo-new.png',
    },
  },
  manifest: '/manifest.json',
  applicationName: 'פרחי דוד',
  appleWebApp: {
    title: 'פרחי דוד',
    statusBarStyle: 'default',
  },
  other: {
    'apple-mobile-web-app-title': 'פרחי דוד',
  },
};

const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  'name': 'פרחי דוד',
  'alternateName': ['David Flowers', 'פרחי דוד אשקלון'],
  'url': 'https://davidflowers.co.il',
};

import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/cart/CartDrawer';
import { ClerkProvider } from '@clerk/nextjs';
import { heIL } from '@clerk/localizations';
import { currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import ContactFloatingMenu from '@/components/ContactFloatingMenu';
import AccessibilityWidget from '@/components/AccessibilityWidget';
import CookieConsent from '@/components/ui/CookieConsent';

import AnnouncementBar from '@/components/layout/AnnouncementBar';
import { Toaster } from 'sonner';
import GoogleTagManager from '@/components/analytics/GoogleTagManager';
import GoogleTag from '@/components/analytics/GoogleTag';

const prisma = new PrismaClient();

import { getSiteConfig } from '@/app/actions/site-config-actions';
import { CATEGORY_ORDER } from '@/lib/categories';

// ... (existing imports)

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // Check Admin Status for Navbar
  let user = null;
  try {
    user = await currentUser();
  } catch (error) {
    // Suppress Clerk middleware error that happens when static assets 404
    // prompting RootLayout to render without middleware running.
    if (!String(error).includes("clerkMiddleware")) {
      console.error("Layout: Failed to fetch current user", error);
    }
  }

  let isAdmin = false;

  if (user) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: user.id }
      });

      const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.replace(/['"]+/g, '').trim().toLowerCase());
      const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase();

      if (dbUser?.role === 'ADMIN' || (userEmail && adminEmails.includes(userEmail))) {
        isAdmin = true;
      }
    } catch (error) {
      console.error("Layout: Failed to check admin status", error);
    }
  }

  // FORCE ADMIN IN DEVELOPMENT
  if (process.env.NODE_ENV === 'development') {
    isAdmin = true;
  }

  // Fetch Announcement Bar Config
  const announcementConfig = await getSiteConfig('announcement_bar');

  // Fetch Categories for Navbar
  let categories: { name: string; slug: string }[] = [];



  try {
    categories = await prisma.category.findMany({
      where: { isHidden: false },
      select: { name: true, slug: true },
      orderBy: { order: 'asc' }
    });
  } catch (error) {
    console.error("Layout: Failed to fetch categories", error);
  }

  return (
    <ClerkProvider localization={heIL}>
      <html lang="he" dir="rtl">
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSON_LD) }}
          />
        </head>
        <body className={`${heebo.variable} ${frankRuhl.variable} ${bellefair.variable} ${assistant.variable} font-sans antialiased text-stone-900 bg-[#FAFAFA]`}>
          <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID || ''} />
          <GoogleTag tagId={process.env.NEXT_PUBLIC_GOOGLE_TAG_ID || ''} />
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <div className="print:hidden">
                <AnnouncementBar initialConfig={announcementConfig} />
                <Navbar isAdmin={isAdmin} categories={categories} />
              </div>
              <div className="flex-grow">
                {children}
              </div>
              <div className="print:hidden">
                <Footer />
              </div>
            </div>
            <div className="print:hidden">
              <CartDrawer />
              <ContactFloatingMenu />
              <AccessibilityWidget />
              <CookieConsent />
            </div>

            <Toaster position="top-center" richColors />
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

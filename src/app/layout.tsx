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
  title: 'פרחי דוד | משלוחי פרחים באשקלון והסביבה',
  description: 'פרחי דוד - חנות פרחים באשקלון המציעה משלוחי פרחים טריים, עציצים, ומתנות מעוצבות. משלוח מהיום להיום באשקלון והסביבה.',
  keywords: 'פרחים באשקלון, משלוח פרחים באשקלון, מתנות באשקלון, עציצים באשקלון, חנות פרחים אשקלון, זרי פרחים אשקלון',
  openGraph: {
    title: 'פרחי דוד | משלוח פרחים באשקלון',
    description: 'משלוחי פרחים טריים, עציצים ומתנות באשקלון והסביבה.',
    images: ['/logo_original.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/logo_original.jpg'],
  },
  icons: {
    icon: '/logo_original.jpg',
    apple: '/logo_original.jpg',
  },
  verification: {
    google: 'rDkvHMWzuXR1l-ff5fT-OGHsMov-4gbkjnEAfBwpnkk',
  },
};

import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/cart/CartDrawer';
import { ClerkProvider } from '@clerk/nextjs';
import { heIL } from '@clerk/localizations';
import { currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import WhatsAppButton from '@/components/WhatsAppButton';
import AccessibilityWidget from '@/components/AccessibilityWidget';
import CookieConsent from '@/components/ui/CookieConsent';
import PromoPopup from '@/components/ui/PromoPopup';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import { Toaster } from 'sonner';
import GoogleTagManager from '@/components/analytics/GoogleTagManager';

const prisma = new PrismaClient();

import { getSiteConfig } from '@/app/actions/site-config-actions';

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
    // ... (existing admin check logic)
    try {
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: user.id }
      });
      if (dbUser?.role === 'ADMIN') {
        isAdmin = true;
      }
    } catch (error) {
      console.error("Layout: Failed to check admin status", error);
    }
  }

  // Fetch Announcement Bar Config
  const announcementConfig = await getSiteConfig('announcement_bar');

  // Fetch Categories for Navbar
  let categories: { name: string; slug: string }[] = [];
  try {
    categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }, // Or specific order if you have an 'order' field
      select: { name: true, slug: true }
    });
  } catch (error) {
    console.error("Layout: Failed to fetch categories", error);
  }

  return (
    <ClerkProvider localization={heIL}>
      <html lang="he" dir="rtl">
        <body className={`${heebo.variable} ${frankRuhl.variable} ${bellefair.variable} ${assistant.variable} font-sans antialiased text-stone-900 bg-[#FAFAFA]`}>
          <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID || ''} />
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <AnnouncementBar initialConfig={announcementConfig} />
              <Navbar isAdmin={isAdmin} categories={categories} />
              <div className="flex-grow">
                {children}
              </div>
              <Footer />
            </div>
            <CartDrawer />
            <WhatsAppButton />
            <AccessibilityWidget />
            <CookieConsent />
            <PromoPopup />
            <Toaster position="top-center" richColors />
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

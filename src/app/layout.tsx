import type { Metadata } from 'next';
import { Heebo, Frank_Ruhl_Libre } from 'next/font/google';
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

export const metadata: Metadata = {
  title: 'David Flowers | משלוחי פרחים יוקרתיים',
  description: 'זרי פרחים שזורים ביד, במשלוח עד הבית.',
  openGraph: {
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
};

import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/cart/CartDrawer';
import { ClerkProvider } from '@clerk/nextjs';
import { heIL } from '@clerk/localizations';
import { currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import WhatsAppButton from '@/components/WhatsAppButton';
import AccessibilityWidget from '@/components/AccessibilityWidget';
import { Toaster } from 'sonner';

const prisma = new PrismaClient();

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
    console.error("Layout: Failed to fetch current user", error);
  }

  let isAdmin = false;

  if (user) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: user.id }
      });
      if (dbUser?.role === 'ADMIN') {
        isAdmin = true;
      }
    } catch (error) {
      console.error("Layout: Failed to check admin status", error);
      // Fallback or ignore, strictly don't crash the app
    }

    // Failsafe for instant update if sync hasn't run yet but email matches
    // REMOVED unsafe hardcoded dev bypass for production stability
    // else if (true) { isAdmin = true; } 
  }

  return (
    <ClerkProvider localization={heIL}>
      <html lang="he" dir="rtl">
        <body className={`${heebo.variable} ${frankRuhl.variable} font-sans antialiased text-stone-900 bg-[#FAFAFA]`}>
          <CartProvider>
            <Navbar isAdmin={isAdmin} />
            {children}
            <Footer />
            <CartDrawer />
            <WhatsAppButton />
            <AccessibilityWidget />
            <Toaster position="top-center" richColors />
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

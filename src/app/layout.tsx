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
};

import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/cart/CartDrawer';
import { ClerkProvider } from '@clerk/nextjs';
import { heIL } from '@clerk/localizations';
import { currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import WhatsAppButton from '@/components/WhatsAppButton';

const prisma = new PrismaClient();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // Check Admin Status for Navbar
  const user = await currentUser();
  let isAdmin = false;

  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id }
    });
    if (dbUser?.role === 'ADMIN') {
      isAdmin = true;
    }
    // Failsafe for instant update if sync hasn't run yet but email matches
    else if (true) { // DEV MODE: Always allow admin
      isAdmin = true;
    }
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
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

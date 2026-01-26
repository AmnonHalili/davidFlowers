'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User, Menu, Search, Lock, Phone, MapPin, Heart } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import SearchOverlay from './SearchOverlay';
import { Dock, DockLink } from '@/components/ui/Dock';

export default function Navbar({ isAdmin = false }: { isAdmin?: boolean }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { openCart, itemsCount } = useCart();
    const pathname = usePathname();

    if (pathname?.startsWith('/admin')) return null;

    const navLinks = [
        { label: 'זרי פרחים', href: '/category/bouquets' },
        { label: 'עציצים', href: '/category/plants' },
        { label: 'מתנות ומתוקים', href: '/category/gifts' },
        { label: 'שוקולדים', href: '/category/chocolates' },
        { label: 'בלונים', href: '/category/balloons' },
        { label: 'חתן וכלה', href: '/category/wedding' },
        { label: 'כלים ואגרטלים', href: '/category/vases' },
        { label: 'אודות', href: '/about' },
    ];

    return (
        <header className="relative z-50 rtl" dir="rtl">
            <nav className="fixed top-0 left-0 right-0 bg-david-beige z-50 transition-all duration-300 border-b border-[#DCDBCF]">
                {/* Top Contact Bar */}
                <div className="bg-stone-900 text-white py-1.5 px-4 text-[10px] md:text-xs font-medium tracking-wide">
                    <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <a href="tel:0535879344" className="flex items-center gap-1.5 hover:text-stone-300 transition-colors">
                                <Phone className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                <span className="dir-ltr">053-587-9344</span>
                            </a>
                            <span className="text-stone-700 hidden md:inline">|</span>
                            <a
                                href="https://waze.com/ul?ll=31.66926,34.57149&navigate=yes"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 hover:text-stone-300 transition-colors hidden md:flex"
                            >
                                <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                <span>רחבעם זאבי 4, אשקלון</span>
                            </a>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Mobile Address (shown only on mobile on right side if needed, or hidden to save space) */}
                            <a
                                href="https://waze.com/ul?ll=31.66926,34.57149&navigate=yes"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 block md:hidden hover:text-stone-300 transition-colors"
                            >
                                <MapPin className="w-3 h-3" />
                                <span>אשקלון</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="max-w-screen-2xl mx-auto px-6 h-20 md:h-24 flex items-center justify-between md:grid md:grid-cols-12 relative">

                    {/* Mobile: Hamburger Menu (Right Side / Start) */}
                    <div className="md:hidden flex justify-start z-10">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="text-david-green p-2 cursor-pointer"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Logo (Center on Mobile, Right/Start on Desktop) */}
                    <div className="md:col-span-2 flex justify-start absolute left-1/2 -translate-x-1/2 md:static md:transform-none">
                        <Link href="/" className="relative block w-[100px] h-[40px] md:w-[200px] md:h-[70px]">
                            <Image
                                src="/David-Logo-removebg-preview.png"
                                alt="David Flowers"
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 120px, 200px"
                                priority
                            />
                        </Link>
                    </div>

                    {/* Desktop: Navigation Links */}
                    <div className="col-span-8 hidden md:flex justify-center items-center h-full">
                        <Dock magnification={1.3} distance={120}>
                            {navLinks.map((link) => (
                                <DockLink key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-david-green text-lg font-medium hover:text-opacity-70 transition-colors whitespace-nowrap px-2"
                                    >
                                        {link.label}
                                    </Link>
                                </DockLink>
                            ))}
                        </Dock>
                    </div>

                    {/* Left Side: Icons (Cart, User, etc.) */}
                    <div className="md:col-span-2 flex items-center justify-end gap-3 md:gap-5 z-10">

                        {/* Search */}
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="hidden md:block text-david-green hover:opacity-70 transition-opacity"
                        >
                            <Search className="w-5 h-5" strokeWidth={1.5} />
                        </button>

                        <SignedIn>
                            <div className="scale-90 origin-center">
                                <UserButton userProfileMode="navigation" userProfileUrl="/account" afterSignOutUrl="/" />
                            </div>
                        </SignedIn>
                        <SignedOut>
                            <Link href="/sign-in" className="hidden md:block text-david-green hover:opacity-70 transition-opacity">
                                <User className="w-5 h-5" strokeWidth={1.5} />
                            </Link>
                        </SignedOut>

                        {isAdmin && (
                            <Link href="/admin" className="hidden md:block text-david-green hover:opacity-70 transition-opacity" title="ניהול האתר">
                                <Lock className="w-5 h-5" strokeWidth={1.5} />
                            </Link>
                        )}

                        <Link href="/wishlist" className="hidden md:block text-david-green hover:opacity-70 transition-opacity" title="המועדפים שלי">
                            <Heart className="w-5 h-5" strokeWidth={1.5} />
                        </Link>

                        <button
                            onClick={openCart}
                            className="relative text-david-green hover:opacity-70 transition-opacity p-1"
                        >
                            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                            {itemsCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-david-green text-david-beige text-[10px] flex items-center justify-center rounded-full">
                                    {itemsCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Spacer to prevent content from hiding behind fixed navbar (increased height for TopBar) */}
            <div className="h-28 md:h-32" />

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/20 z-50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'tween', duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            className="fixed top-0 right-0 bottom-0 w-[300px] bg-david-beige z-[60] p-8 shadow-2xl border-l border-[#DCDBCF]"
                        >
                            <div className="flex justify-between items-center mb-12">
                                <span className="font-serif text-2xl text-david-green">תפריט</span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="text-david-green/60 hover:text-david-green">
                                    סגירה
                                </button>
                            </div>
                            <div className="flex flex-col gap-6">
                                {navLinks.map((item) => (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className="text-2xl font-light text-david-green hover:bg-david-green/5 p-2 transition-colors rounded-sm"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Search Overlay */}
            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </header>
    );
}

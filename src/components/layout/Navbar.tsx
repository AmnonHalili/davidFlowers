'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User, Menu, Search, Lock, Phone, MapPin, Heart, Truck, Instagram } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import SearchOverlay from './SearchOverlay';
import { Dock, DockLink } from '@/components/ui/Dock';
import DeliveryCountdown from './DeliveryCountdown';
import TopBarTicker from './TopBarTicker';

type NavbarProps = {
    isAdmin?: boolean;
    categories?: { name: string; slug: string }[];
};

export default function Navbar({ isAdmin = false, categories = [] }: NavbarProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { openCart, itemsCount } = useCart();
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (pathname?.startsWith('/admin')) return null;

    const navLinks = categories && categories.length > 0
        ? categories.map(cat => ({ label: cat.name, href: `/category/${cat.slug}` }))
        : [
            { label: 'זרי פרחים', href: '/category/bouquets' },
            { label: 'מתנות ומתוקים', href: '/category/gifts' },
            { label: 'בלונים', href: '/category/balloons' },
            { label: 'חתן וכלה', href: '/category/wedding' },
            { label: 'עציצים', href: '/category/plants' },
            { label: 'כלים ואגרטלים', href: '/category/vases' },
            { label: 'שוקולדים', href: '/category/chocolates' },
        ];

    // Always add 'About' at the end or specific position if needed
    // Assuming 'About' is static and not a product category
    if (!navLinks.find(l => l.href === '/about')) {
        navLinks.push({ label: 'אודות', href: '/about' });
    }

    return (
        <header className="relative z-50 rtl" dir="rtl">
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${pathname === '/'
                ? (isScrolled ? 'bg-black/40 backdrop-blur-md border-b border-white/10 shadow-lg' : 'bg-gradient-to-b from-black/50 to-transparent border-none')
                : 'bg-david-beige border-b border-[#DCDBCF]'
                }`}>
                {/* Top Contact Bar */}
                <div className={`text-white py-1.5 md:py-1.5 px-4 text-[10px] md:text-xs font-medium tracking-wide ${pathname === '/' ? 'bg-transparent' : 'bg-stone-900 border-b border-white/5'}`}>
                    <div className="max-w-screen-2xl mx-auto">
                        {/* Desktop View */}
                        <div className="hidden md:flex justify-between items-center w-full">
                            {/* Right on Desktop: Delivery Areas */}
                            <div className="flex items-center gap-2">
                                <Truck className="w-3.5 h-3.5 text-david-beige/60" />
                                <span className="text-david-beige/90">משלוחים לאשקלון והסביבה</span>
                            </div>

                            {/* Center: Delivery Countdown */}
                            <div>
                                <DeliveryCountdown />
                            </div>

                            {/* Left on Desktop: Phone & Location */}
                            <div className="flex items-center gap-4">
                                <a href="tel:0535879344" className="flex items-center gap-1.5 hover:text-stone-300 transition-colors">
                                    <Phone className="w-3.5 h-3.5" />
                                    <span className="dir-ltr">053-587-9344</span>
                                </a>
                                <span className="text-stone-700">|</span>
                                <a
                                    href="https://waze.com/ul?q=%D7%A8%D7%97%D7%91%D7%A2%D7%9D%20%D7%96%D7%90%D7%91%D7%99%204%2C%20%D7%90%D7%A9%D7%A7%D7%9C%D7%95%D7%9F&navigate=yes"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 hover:text-stone-300 transition-colors"
                                >
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>רחבעם זאבי 4, אשקלון</span>
                                </a>
                            </div>
                        </div>

                        {/* Mobile View: Professional Ticker */}
                        <div className="md:hidden">
                            <TopBarTicker />
                        </div>
                    </div>
                </div>

                <div className="max-w-screen-2xl mx-auto px-6 h-20 md:h-24 flex items-center justify-between md:grid md:grid-cols-12 relative">

                    {/* Mobile: Hamburger Menu & Search (Right Side / Start) */}
                    <div className="md:hidden flex items-center justify-start z-10 gap-1">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className={`${pathname === '/' ? 'text-white' : 'text-david-green'} p-2 cursor-pointer`}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className={`${pathname === '/' ? 'text-white' : 'text-david-green'} p-2 cursor-pointer`}
                        >
                            <Search className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Logo (Center on Mobile, Right/Start on Desktop) */}
                    <div className="md:col-span-2 flex justify-start absolute left-1/2 -translate-x-1/2 md:static md:transform-none">
                        <Link href="/" className="relative block w-[100px] h-[40px] md:w-[200px] md:h-[70px]">
                            <Image
                                src="/David-Logo-removebg-preview.png"
                                alt="David Flowers"
                                fill
                                className={`object-contain ${pathname === '/' ? 'brightness-0 invert' : ''}`}
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
                                        className={`${pathname === '/' ? 'text-white/90 hover:text-white' : 'text-david-green'} text-base font-light tracking-wider hover:text-opacity-70 transition-colors whitespace-nowrap px-3`}
                                    >
                                        {link.label}
                                    </Link>
                                </DockLink>
                            ))}
                        </Dock>
                    </div>

                    {/* Left Side: Icons (Cart, User, etc.) */}
                    <div className="md:col-span-2 flex items-center justify-end gap-1 md:gap-5 z-10">

                        {/* Desktop Search */}
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className={`hidden md:block ${pathname === '/' ? 'text-white' : 'text-david-green'} hover:opacity-70 transition-opacity`}
                        >
                            <Search className="w-5 h-5" strokeWidth={1.5} />
                        </button>

                        <SignedIn>
                            <div className="hidden md:block scale-90 origin-center">
                                <UserButton userProfileMode="navigation" userProfileUrl="/account" afterSignOutUrl="/" />
                            </div>
                        </SignedIn>
                        <SignedOut>
                            <Link href="/sign-in" className={`hidden md:block ${pathname === '/' ? 'text-white' : 'text-david-green'} hover:opacity-70 transition-opacity`}>
                                <User className="w-5 h-5" strokeWidth={1.5} />
                            </Link>
                        </SignedOut>

                        {isAdmin && (
                            <Link href="/admin" className={`hidden md:block ${pathname === '/' ? 'text-white' : 'text-david-green'} hover:opacity-70 transition-opacity`} title="ניהול האתר">
                                <Lock className="w-5 h-5" strokeWidth={1.5} />
                            </Link>
                        )}

                        <a
                            href="https://www.instagram.com/davidflower__?igsh=NXNudHU1emMwcWVl"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${pathname === '/' ? 'text-white' : 'text-david-green'} hover:opacity-70 transition-opacity p-2`}
                            title="עקבו אחרינו באינסטגרם"
                        >
                            <Instagram className="w-5 h-5 md:w-5 md:h-5" strokeWidth={1.5} />
                        </a>

                        <Link href="/wishlist" className={`${pathname === '/' ? 'text-white' : 'text-david-green'} hover:opacity-70 transition-opacity p-2`} title="המועדפים שלי">
                            <Heart className="w-5 h-5 md:w-5 md:h-5" strokeWidth={1.5} />
                        </Link>

                        <button
                            onClick={openCart}
                            className={`relative ${pathname === '/' ? 'text-white' : 'text-david-green'} hover:opacity-70 transition-opacity p-2`}
                        >
                            <ShoppingBag className="w-6 h-6" strokeWidth={1.5} />
                            {itemsCount > 0 && (
                                <span className="absolute 0 top-0 -right-0 w-4 h-4 bg-david-green text-david-beige text-[10px] flex items-center justify-center rounded-full">
                                    {itemsCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Spacer to prevent content from hiding behind fixed navbar (increased height for TopBar) */}
            {pathname !== '/' && <div className="h-28 md:h-32" />}

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
                            className="fixed top-0 right-0 bottom-0 w-[300px] bg-david-beige z-[60] p-8 shadow-2xl border-l border-[#DCDBCF] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-0">
                                <span className="font-serif text-2xl text-david-green">תפריט</span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="text-david-green/60 hover:text-david-green">
                                    סגירה
                                </button>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                {navLinks.map((item) => (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className="text-lg font-light tracking-wider text-david-green hover:bg-david-green/5 py-1.5 px-2 transition-colors rounded-sm"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                                {isAdmin && (
                                    <Link
                                        href="/admin"
                                        className="text-lg font-light tracking-wider text-david-green hover:bg-david-green/5 py-1.5 px-2 transition-colors rounded-sm flex items-center gap-2 mt-2 border-t border-david-green/10 pt-4"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Lock className="w-4 h-4" />
                                        ניהול האתר
                                    </Link>
                                )}

                                <div className="border-t border-david-green/10 pt-4 mt-2 space-y-2">
                                    <Link
                                        href="/wishlist"
                                        className="text-base font-light tracking-wider text-david-green hover:bg-david-green/5 py-1.5 px-2 transition-colors rounded-sm flex items-center gap-2"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Heart className="w-4 h-4" />
                                        המועדפים שלי
                                    </Link>

                                    <SignedIn>
                                        <Link
                                            href="/account"
                                            className="text-base font-light tracking-wider text-david-green hover:bg-david-green/5 py-1.5 px-2 transition-colors rounded-sm flex items-center gap-2"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <User className="w-4 h-4" />
                                            החשבון שלי
                                        </Link>
                                    </SignedIn>
                                    <SignedOut>
                                        <Link
                                            href="/sign-in"
                                            className="text-base font-light tracking-wider text-david-green hover:bg-david-green/5 py-1.5 px-2 transition-colors rounded-sm flex items-center gap-2"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <User className="w-4 h-4" />
                                            התחברות / הרשמה
                                        </Link>
                                    </SignedOut>
                                </div>

                                <div className="border-t border-david-green/10 pt-6 mt-6 space-y-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-david-green/40">החנות שלנו</span>
                                        <a
                                            href="https://waze.com/ul?q=%D7%A8%D7%97%D7%91%D7%A2%D7%9D%20%D7%96%D7%90%D7%91%D7%99%204%2C%20%D7%90%D7%A9%D7%A7%D7%9C%D7%95%D7%9F&navigate=yes"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-stone-900 group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="bg-david-green/10 p-2 rounded-full text-david-green group-hover:bg-david-green group-hover:text-white transition-colors">
                                                    <MapPin className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">רחבעם זאבי 4, אשקלון</span>
                                                    <span className="text-[10px] text-stone-400">לחץ לניווט ב-Waze</span>
                                                </div>
                                            </div>
                                        </a>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-david-green/40">זמינים עבורכם</span>
                                        <a href="tel:0535879344" className="text-stone-900 group">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-david-green/10 p-2 rounded-full text-david-green group-hover:bg-david-green group-hover:text-white transition-colors">
                                                    <Phone className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">053-587-9344</span>
                                                    <span className="text-[10px] text-stone-400">מרכז ההזמנות</span>
                                                </div>
                                            </div>
                                        </a>
                                    </div>
                                </div>
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

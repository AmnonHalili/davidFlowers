'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User, Menu, Search, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs';


export default function Navbar({ isAdmin = false }: { isAdmin?: boolean }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { openCart, itemsCount } = useCart();
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isHomePage = pathname === '/';
    const textColor = isHomePage && !isScrolled ? 'text-white' : 'text-stone-900';

    if (pathname?.startsWith('/admin')) return null;

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/90 backdrop-blur-md py-4 border-b border-stone-100' : 'bg-transparent py-6'
                    }`}
            >
                <div className="max-w-screen-2xl mx-auto px-6 grid grid-cols-3 items-center">

                    {/* Right: Mobile Menu & Search */}
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className={`p-1 transition-colors ${textColor}`}
                        >
                            <Menu className="w-5 h-5" strokeWidth={1.5} />
                        </button>
                        <button className={`p-1 hidden md:block transition-colors hover:opacity-70 ${textColor}`}>
                            <Search className="w-5 h-5" strokeWidth={1.5} />
                        </button>
                    </div>

                    {/* Center: Logo */}
                    <div className="flex justify-center">
                        <Link href="/" className={`font-serif text-lg md:text-2xl tracking-widest uppercase text-center transition-colors duration-500 whitespace-nowrap ${textColor}`}>
                            David Flowers
                        </Link>
                    </div>

                    {/* Left: Cart & Account */}
                    <div className="flex items-center justify-end gap-6">
                        <SignedIn>
                            <div className="scale-75 origin-right" dir="ltr">
                                <UserButton userProfileMode="navigation" userProfileUrl="/account" afterSignOutUrl="/" />
                            </div>
                        </SignedIn>
                        <SignedOut>
                            <Link href="/sign-in" className={`p-1 hidden md:block transition-opacity hover:opacity-70 ${textColor}`}>
                                <User className="w-5 h-5" strokeWidth={1.5} />
                            </Link>
                        </SignedOut>

                        {/* Admin Link */}
                        {isAdmin && (
                            <Link href="/admin" className={`p-1 hidden md:block transition-opacity hover:opacity-70 ${textColor}`} title="ניהול האתר">
                                <Lock className="w-5 h-5" strokeWidth={1.5} />
                            </Link>
                        )}

                        <button
                            onClick={openCart}
                            className={`p-1 relative transition-opacity hover:opacity-70 ${textColor}`}
                        >
                            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                            {itemsCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-stone-900 text-white text-[10px] flex items-center justify-center rounded-full">
                                    {itemsCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </nav>

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
                            initial={{ x: '100%' }} // RTL: slide from right
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'tween', duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            className="fixed top-0 right-0 bottom-0 w-[300px] bg-white z-[60] p-8 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-12">
                                <span className="font-serif text-lg tracking-widest text-stone-900">תפריט</span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="text-stone-400 hover:text-stone-900">
                                    סגירה
                                </button>
                            </div>
                            <div className="flex flex-col gap-6">
                                {[
                                    { label: 'כל הזרים', href: '/shop' },
                                    { label: 'מנויים', href: '/subscriptions' },
                                    { label: 'אירועים', href: '/occasions' },
                                    { label: 'קצת עלינו', href: '/about' },
                                    { label: 'מגזין', href: '/journal' }
                                ].map((item) => (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className="text-2xl font-light text-stone-900 hover:pr-4 transition-all duration-300"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

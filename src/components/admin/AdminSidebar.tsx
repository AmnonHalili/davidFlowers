'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Menu, X, Store, Ticket, TrendingUp, Mail } from 'lucide-react';
import { UserButton, useClerk } from '@clerk/nextjs';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminSidebar() {
    const pathname = usePathname();
    const { signOut } = useClerk();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const links = [
        { href: '/admin', label: 'לוח בקרה', icon: LayoutDashboard },
        { href: '/admin/products', label: 'ניהול מוצרים', icon: Package },
        { href: '/admin/orders', label: 'הזמנות', icon: ShoppingCart },
        { href: '/admin/reports', label: 'דוחות', icon: TrendingUp },
        { href: '/admin/marketing', label: 'שיווק ותפוצה', icon: Mail },
        { href: '/admin/coupons', label: 'קופונים', icon: Ticket },
        { href: '/admin/settings', label: 'הגדרות', icon: Settings },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-[#111] text-white">
            {/* Brand */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-stone-800">
                <span className="font-serif text-xl tracking-widest uppercase">David Admin</span>
                <button onClick={() => setIsMobileOpen(false)} className="md:hidden text-stone-400">
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${isActive
                                ? 'bg-stone-800 text-white shadow-sm'
                                : 'text-stone-400 hover:text-white hover:bg-stone-900'
                                }`}
                        >
                            <Icon strokeWidth={1.5} className="w-5 h-5" />
                            <span className="text-sm font-medium tracking-wide">{link.label}</span>
                        </Link>
                    );
                })}

                <div className="my-2 border-t border-stone-800/50" />

                <Link
                    href="/"
                    className="flex items-center gap-4 px-4 py-3 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-stone-900 transition-all"
                >
                    <Store strokeWidth={1.5} className="w-5 h-5" />
                    <span className="text-sm font-medium tracking-wide">מעבר לחנות</span>
                </Link>
            </nav>

            {/* User Footer */}
            <div className="p-6 border-t border-stone-800">
                <div className="flex items-center gap-4 bg-stone-900 p-3 rounded-lg">
                    <UserButton afterSignOutUrl="/" />
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">מנהל חנות</span>
                        <span className="text-[10px] text-stone-500">מחובר כרגע</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Header Bar (Visible only on mobile) */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#111] text-white flex items-center justify-between px-4 z-40 shadow-md">
                <span className="font-serif text-lg tracking-widest uppercase">David Admin</span>
                <button onClick={() => setIsMobileOpen(true)} className="p-2">
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Desktop Sidebar (Hidden on mobile) */}
            <aside className="hidden md:flex fixed right-0 top-0 bottom-0 w-64 z-50 flex-col">
                <SidebarContent />
            </aside>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
                        />

                        {/* Sidebar Drawer */}
                        <motion.aside
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            className="fixed top-0 bottom-0 right-0 w-[280px] z-[60] md:hidden shadow-2xl"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

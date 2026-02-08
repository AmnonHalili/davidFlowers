import prisma from '@/lib/prisma';
import { Mail, Copy, Download, Users } from 'lucide-react';
import { Metadata } from 'next';
import SubscribersList from '@/components/admin/SubscribersList';

export const metadata: Metadata = {
    title: 'Marketing & Subscribers | Admin',
};

async function getSubscribers() {
    // Get all orders with newsletter consent, excluding pending/cancelled
    const orders = await prisma.order.findMany({
        where: {
            newsletterConsent: true,
            status: { notIn: ['PENDING', 'CANCELLED'] }
        },
        select: {
            ordererEmail: true,
            ordererName: true,
            createdAt: true
        },
        orderBy: { createdAt: 'desc' }
    });

    // Handle duplicates (same email multiple orders)
    const uniqueSubscribers = new Map();
    orders.forEach(order => {
        const email = order.ordererEmail?.toLowerCase();
        if (email && !uniqueSubscribers.has(email)) {
            uniqueSubscribers.set(email, {
                email: email,
                name: order.ordererName,
                joinedAt: order.createdAt
            });
        }
    });

    return Array.from(uniqueSubscribers.values());
}

export default async function MarketingPage() {
    const subscribers = await getSubscribers();

    return (
        <div className="p-10 space-y-10 max-w-[1200px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900 font-serif">שיווק ותפוצה</h1>
                    <p className="text-stone-500 mt-2">ניהול רשימת התפוצה והלקוחות שנרשמו לניוזלטר</p>
                </div>
                <div className="bg-david-green/10 text-david-green px-4 py-2 rounded-full border border-david-green/20 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-bold">{subscribers.length} מנויים רשומים</span>
                </div>
            </div>

            {/* Quick Stats / Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                    <div className="p-3 bg-stone-50 rounded-lg w-fit mb-4 text-stone-900">
                        <Mail className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-medium text-stone-500">מקור המנויים</h3>
                    <p className="text-lg font-bold text-stone-900 mt-1">צ'ק-אאוט באתר</p>
                </div>
                {/* Add more stats here if needed */}
            </div>

            {/* Subscribers List Component */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                <SubscribersList initialSubscribers={subscribers} />
            </div>

            <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <Download className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold text-blue-900">טיפ שיווקי</h4>
                    <p className="text-sm text-blue-800 mt-1 leading-relaxed">
                        אתה יכול להעתיק את רשימת המיילים ולהדביק אותה במערכות דיוור כמו Mailchimp, Smoove או לשלוח להם קוד קופון בלעדי דרך הממשק של ה-CRM.
                    </p>
                </div>
            </div>
        </div>
    );
}

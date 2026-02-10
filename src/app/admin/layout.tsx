import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import AdminSidebar from '@/components/admin/AdminSidebar';

const prisma = new PrismaClient();

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await currentUser();

    if (!user) {
        redirect('/sign-in');
    }

    // Double check admin role in DB
    const dbUser = await prisma.user.findUnique({
        where: { clerkId: user.id },
    });

    if (dbUser?.role !== 'ADMIN') {
        const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.replace(/['"]+/g, '').trim().toLowerCase());
        const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase();

        console.log('--- Admin Access Debug ---');
        console.log('User ID:', user.id);
        console.log('User Email:', userEmail);
        console.log('Admin Emails List:', adminEmails);
        console.log('DB User Found:', !!dbUser);
        console.log('DB User Role:', dbUser?.role);
        console.log('Access Granted via Email:', userEmail && adminEmails.includes(userEmail));
        console.log('--------------------------');

        if (!userEmail || !adminEmails.includes(userEmail)) {
            redirect('/');
        }
    }

    return (
        <div className="min-h-screen bg-stone-50" dir="rtl">
            <AdminSidebar />

            <main className="md:mr-64 min-h-screen transition-all duration-300 pt-20 md:pt-0">
                {children}
            </main>
        </div>
    );
}

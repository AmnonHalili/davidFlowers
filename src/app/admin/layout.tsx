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
        // If not admin, verify if it's the owner email (failsafe bootstrapping)
        const DO_NOT_USE_IN_PROD_WHITELIST = ['david@davidflowers.com', user.emailAddresses[0].emailAddress]; // Temporarily allow current user for development

        if (!DO_NOT_USE_IN_PROD_WHITELIST.includes(user.emailAddresses[0].emailAddress)) {
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

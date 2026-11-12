import { requireAdmin } from '@/lib/admin-auth';
import AdminSidebar from '@/components/admin/AdminSidebar';


export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await requireAdmin();

    return (
        <div className="min-h-screen bg-stone-50" dir="rtl">
            <div className="print:hidden">
                <AdminSidebar />
            </div>

            <main className="md:mr-64 min-h-screen transition-all duration-300 pt-20 md:pt-0 print:mr-0 print:pt-0 print:w-full">
                {children}
            </main>
        </div>
    );
}

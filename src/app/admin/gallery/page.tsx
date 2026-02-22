import { getAllGalleryImages } from '@/app/actions/gallery-actions';
import AdminGalleryClient from '@/components/admin/AdminGalleryClient';
import { ImageIcon } from 'lucide-react';

export const metadata = {
    title: 'ניהול גלריה | Admin',
};

export default async function AdminGalleryPage() {
    const images = await getAllGalleryImages();

    return (
        <div className="space-y-8 pb-12 rtl" dir="rtl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">גלריה חיה</h1>
                    <p className="text-stone-500 font-medium">תמונות ישירות מהחנות — מה שהלקוחות רואים בדף הבית</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl border border-stone-200 shadow-sm inline-flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-david-green" />
                    <span className="text-sm font-bold text-stone-600">{images.filter((i: { isVisible: boolean }) => i.isVisible).length} תמונות פעילות</span>
                </div>
            </div>

            <AdminGalleryClient images={images} />
        </div>
    );
}

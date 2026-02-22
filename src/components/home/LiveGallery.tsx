import { getGalleryImages } from '@/app/actions/gallery-actions';
import LiveGalleryClient from './LiveGalleryClient';

export default async function LiveGallery() {
    let images: Awaited<ReturnType<typeof getGalleryImages>> = [];
    try {
        images = await getGalleryImages();
    } catch {
        // Prisma client may be stale after schema migration; silently skip gallery
        return null;
    }

    if (!images || images.length === 0) return null;

    return (
        <section className="py-16 px-0 overflow-hidden bg-white border-t border-stone-100" dir="rtl">
            <div className="max-w-6xl mx-auto px-6 mb-8">
                <div className="flex items-center gap-3 justify-end">
                    {/* Live badge */}
                    <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-full px-3 py-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-red-600 uppercase tracking-wider">LIVE</span>
                    </div>
                    <div>
                        <h2 className="font-serif text-3xl md:text-4xl text-stone-900 text-right">ישירות מהחנות</h2>
                        <p className="text-stone-400 text-sm text-right mt-1">תמונות אמיתיות, ישירות מהסדנה שלנו</p>
                    </div>
                </div>
            </div>

            <LiveGalleryClient images={images} />
        </section>
    );
}

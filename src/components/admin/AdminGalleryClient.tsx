'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { addGalleryImage, toggleGalleryImageVisibility, deleteGalleryImage } from '@/app/actions/gallery-actions';
import { CldUploadWidget } from 'next-cloudinary';
import { Eye, EyeOff, Trash2, Upload, Plus, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

type GalleryImage = {
    id: string;
    url: string;
    caption: string | null;
    takenAt: Date;
    isVisible: boolean;
};

export default function AdminGalleryClient({ images: initialImages }: { images: GalleryImage[] }) {
    const [images, setImages] = useState(initialImages);
    const [caption, setCaption] = useState('');
    const [isPending, startTransition] = useTransition();

    const handleUpload = (result: any) => {
        const url = result?.info?.secure_url;
        if (!url) return;

        startTransition(async () => {
            const res = await addGalleryImage({ url, caption: caption || undefined });
            if (res.success) {
                setImages(prev => [res.image as GalleryImage, ...prev]);
                setCaption('');
                toast.success('תמונה נוספה בהצלחה!');
            }
        });
    };

    const handleToggle = (id: string) => {
        startTransition(async () => {
            const res = await toggleGalleryImageVisibility(id);
            if (res.success) {
                setImages(prev => prev.map(img =>
                    img.id === id ? { ...img, isVisible: res.image!.isVisible } : img
                ));
            }
        });
    };

    const handleDelete = (id: string) => {
        if (!confirm('האם למחוק תמונה זו לצמיתות?')) return;
        startTransition(async () => {
            await deleteGalleryImage(id);
            setImages(prev => prev.filter(img => img.id !== id));
            toast.success('תמונה נמחקה');
        });
    };

    return (
        <div className="space-y-8" dir="rtl">
            {/* Upload Panel */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6">
                <h2 className="font-bold text-stone-900 text-lg mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-david-green" />
                    הוספת תמונה חדשה
                </h2>
                <div className="flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        value={caption}
                        onChange={e => setCaption(e.target.value)}
                        placeholder="כיתוב (אופציונלי)... למשל: זר אדום טרי לאירוע הערב"
                        className="flex-1 p-3 border border-stone-200 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-david-green/20"
                    />
                    <CldUploadWidget
                        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                        onSuccess={handleUpload}
                        options={{ maxFiles: 1, sources: ['local', 'camera'] }}
                    >
                        {({ open }) => (
                            <button
                                onClick={() => open()}
                                className="flex items-center gap-2 bg-david-green text-white px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-david-green/90 transition-all whitespace-nowrap"
                            >
                                <Upload className="w-4 h-4" />
                                העלאת תמונה
                            </button>
                        )}
                    </CldUploadWidget>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map(img => (
                    <div key={img.id} className={`relative group rounded-2xl overflow-hidden border-2 transition-all ${img.isVisible ? 'border-transparent' : 'border-stone-300 opacity-50'} w-full aspect-square`}>
                        <Image
                            src={img.url}
                            alt={img.caption || ''}
                            fill
                            className="object-cover"
                        />

                        {/* Caption overlay */}
                        {img.caption && (
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                                <p className="text-white text-xs font-medium text-right line-clamp-2">{img.caption}</p>
                            </div>
                        )}

                        {/* Timestamp */}
                        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {formatDistanceToNow(new Date(img.takenAt), { locale: he, addSuffix: true })}
                        </div>

                        {/* Action buttons */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button
                                onClick={() => handleToggle(img.id)}
                                className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-stone-100 transition-colors"
                                title={img.isVisible ? 'הסתר' : 'הצג'}
                            >
                                {img.isVisible ? <EyeOff className="w-4 h-4 text-stone-700" /> : <Eye className="w-4 h-4 text-david-green" />}
                            </button>
                            <button
                                onClick={() => handleDelete(img.id)}
                                className="w-9 h-9 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                                <Trash2 className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {images.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-stone-200 rounded-3xl">
                    <p className="text-stone-400 font-medium">עדיין אין תמונות בגלריה</p>
                    <p className="text-stone-300 text-sm mt-1">העלו תמונה ראשונה כדי להתחיל</p>
                </div>
            )}
        </div>
    );
}

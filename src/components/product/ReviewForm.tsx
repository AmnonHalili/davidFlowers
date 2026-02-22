'use client';

import { useState } from 'react';
import { Star, Loader2, Camera, X } from 'lucide-react';
import { createReview } from '@/app/actions/review-actions';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';

interface ReviewFormProps {
    productId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function ReviewForm({ productId, onSuccess, onCancel }: ReviewFormProps) {
    const { user, isSignedIn } = useUser();
    const [rating, setRating] = useState(5);
    const [hover, setHover] = useState(0);
    const [content, setContent] = useState('');
    const [userName, setUserName] = useState(user?.fullName || '');
    const [loading, setLoading] = useState(false);

    const [images, setImages] = useState<string[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content) {
            toast.error('נא לכתוב תוכן לביקורת');
            return;
        }

        setLoading(true);
        const res = await createReview({
            productId,
            rating,
            content,
            userName: userName || user?.fullName || 'Anonymous',
            userImage: user?.imageUrl,
            userId: user?.id,
            images
        });

        if (res.success) {
            toast.success('תודה על הביקורת! השיתוף שלך עוזר לאחרים.');
            onSuccess();
        } else {
            toast.error(res.error || 'אירעה שגיאה בשליחת הביקורת');
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} dir="rtl" className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-xl font-bold text-stone-900">כתבו את דעתכם</h3>
                <p className="text-sm text-stone-500 italic">דרגו את הזר ושתפו חוויה קצרה</p>
            </div>

            {/* Star Rating */}
            <div className="flex flex-col items-center gap-3 p-6 bg-stone-50 rounded-2xl border border-stone-100">
                <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="transition-transform active:scale-90"
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            onClick={() => setRating(star)}
                        >
                            <Star
                                className={`w-8 h-8 ${star <= (hover || rating) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-stone-300'}`}
                                strokeWidth={1}
                            />
                        </button>
                    ))}
                </div>
                <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">
                    {rating === 5 ? 'מצוין!' : rating === 4 ? 'טוב מאוד' : rating === 3 ? 'סביר' : rating === 2 ? 'טעון שיפור' : 'לא מומלץ'}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-stone-500 mr-2 uppercase tracking-wider">השם שלכם *</label>
                    <input
                        type="text"
                        required
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="איך תרצו שיופיע בביקורת?"
                        className="w-full p-4 bg-white border border-stone-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-david-green/20 transition-all shadow-sm"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-stone-500 mr-2 uppercase tracking-wider">דירוג</label>
                    <div className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-stone-400 font-bold">
                        {rating} כוכבים
                    </div>
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-500 mr-2 uppercase tracking-wider">תוכן הביקורת *</label>
                <textarea
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="איך היה הזר? האם הגיע טרי? איך היה השירות?"
                    rows={4}
                    className="w-full p-4 bg-white border border-stone-200 rounded-3xl text-base focus:outline-none focus:ring-2 focus:ring-david-green/20 transition-all shadow-sm resize-none"
                />
            </div>

            {/* Professional Image Upload */}
            <div className="space-y-3">
                <label className="text-[11px] font-bold text-stone-500 mr-2 uppercase tracking-wider">הוסיפו תמונות (אופציונלי)</label>
                <div className="flex flex-wrap gap-2">
                    {images.map((url, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-stone-200 group">
                            <Image src={url} alt="review" fill className="object-cover" />
                            <button
                                type="button"
                                onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    ))}

                    <CldUploadWidget
                        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                        onSuccess={(result: any) => {
                            if (result.info && typeof result.info !== 'string' && result.info.secure_url) {
                                setImages(prev => [...prev, result.info.secure_url]);
                                toast.success('התמונה הועלתה בהצלחה');
                            }
                        }}
                    >
                        {({ open }) => (
                            <button
                                type="button"
                                onClick={() => open()}
                                className="w-20 h-20 flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-stone-200 rounded-xl text-stone-400 hover:border-david-green hover:text-david-green transition-all"
                            >
                                <Camera className="w-6 h-6" />
                                <span className="text-[10px] font-bold">הוסף תמונה</span>
                            </button>
                        )}
                    </CldUploadWidget>
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 bg-david-green text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'שלח ביקורת'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-8 py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold hover:bg-stone-200 transition-all"
                >
                    ביטול
                </button>
            </div>
        </form>
    );
}

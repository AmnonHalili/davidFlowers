'use client';

import { useState, useEffect } from 'react';
import { getAllReviews, updateReviewStatus, deleteReview } from '@/app/actions/review-actions';
import { Star, Check, X, Trash2, MessageSquare, ExternalLink, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadReviews = async () => {
        setLoading(true);
        const res = await getAllReviews();
        if (res.success) {
            setReviews(res.reviews);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadReviews();
    }, []);

    const handleStatusUpdate = async (id: string, status: any) => {
        const res = await updateReviewStatus(id, status);
        if (res.success) {
            toast.success(`ביקורת ${status === 'APPROVED' ? 'אושרה' : 'נדחתה'} בהצלחה`);
            loadReviews();
        } else {
            toast.error('אירעה שגיאה בעדכון הסטטוס');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('האם אתם בטוחים שברצונכם למחוק ביקורת זו?')) return;
        const res = await deleteReview(id);
        if (res.success) {
            toast.success('הביקורת נמחקה לצמיתות');
            loadReviews();
        } else {
            toast.error('אירעה שגיאה במחיקה');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-stone-200 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8" dir="rtl">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-3xl font-serif text-stone-900">ניהול ביקורות</h1>
                    <p className="text-sm text-stone-500">נהלו, אשרו או מחקו ביקורות של לקוחות</p>
                </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-stone-50 border-b border-stone-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">לקוח/ה</th>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">מוצר</th>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">דירוג</th>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">תוכן</th>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">סטטוס</th>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider text-left">פעולות</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {reviews.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-stone-400 italic">
                                        לא נמצאו ביקורות עדיין.
                                    </td>
                                </tr>
                            ) : (
                                reviews.map((review) => (
                                    <tr key={review.id} className="hover:bg-stone-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center text-xs font-bold text-stone-500 overflow-hidden">
                                                    {review.userImage ? <img src={review.userImage} alt="" /> : review.userName?.[0] || 'A'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-stone-900">{review.userName || 'אנונימי'}</span>
                                                    {review.isVerified && <span className="text-[10px] text-david-green font-bold">✓ מאומת</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-stone-700">{review.product.name}</span>
                                                <Link href={`/product/${review.productId}`} className="text-[10px] text-stone-400 hover:text-stone-900 flex items-center gap-1">
                                                    צפייה בדף <ExternalLink className="w-2.5 h-2.5" />
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-0.5 text-[#D4AF37]">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-stone-200'}`} />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-xs">
                                                <p className="text-sm text-stone-600 line-clamp-2" title={review.content}>
                                                    {review.content}
                                                </p>
                                                {review.images?.length > 0 && (
                                                    <div className="flex gap-1 mt-2">
                                                        {review.images.map((img: any) => (
                                                            <div key={img.id} className="w-8 h-8 rounded border border-stone-200 overflow-hidden">
                                                                <img src={img.url} className="w-full h-full object-cover" alt="" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${review.status === 'APPROVED' ? 'bg-green-50 text-green-700' :
                                                    review.status === 'REJECTED' ? 'bg-red-50 text-red-700' :
                                                        'bg-yellow-50 text-yellow-700'
                                                }`}>
                                                {review.status === 'APPROVED' ? 'מאושר' : review.status === 'REJECTED' ? 'נדחה' : 'ממתין'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-left">
                                            <div className="flex items-center justify-end gap-2">
                                                {review.status !== 'APPROVED' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(review.id, 'APPROVED')}
                                                        className="p-2 text-stone-400 hover:text-green-600 transition-colors"
                                                        title="אשר"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {review.status !== 'REJECTED' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(review.id, 'REJECTED')}
                                                        className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                                                        title="דחה"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(review.id)}
                                                    className="p-2 text-stone-400 hover:text-red-700 transition-colors"
                                                    title="מחק לצמיתות"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

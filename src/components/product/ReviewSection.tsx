'use client';

import { useState, useEffect } from 'react';
import { Star, CheckCircle2, Image as ImageIcon, MessageSquare, Loader2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductReviews, getProductRatingSummary } from '@/app/actions/review-actions';
import Image from 'next/image';
import ReviewForm from './ReviewForm';

interface ReviewSectionProps {
    productId: string;
    productName: string;
}

export default function ReviewSection({ productId, productName }: ReviewSectionProps) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0 });
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const [revRes, sumRes] = await Promise.all([
            getProductReviews(productId),
            getProductRatingSummary(productId)
        ]);

        if (revRes.success) setReviews(revRes.reviews);
        if (sumRes.success) setSummary({
            averageRating: sumRes.averageRating || 0,
            totalReviews: sumRes.totalReviews || 0
        });
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [productId]);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-stone-200 animate-spin" />
            </div>
        );
    }

    return (
        <section className="py-16 md:py-24 bg-white border-t border-stone-100 px-4 md:px-0" dir="rtl">
            <div className="max-w-screen-xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20">

                    {/* Left: Summary Stats */}
                    <div className="md:col-span-4 space-y-8">
                        <div className="space-y-4">
                            <h2 className="font-serif text-3xl md:text-4xl text-stone-900">ביקורות לקוחות</h2>
                            <div className="flex items-center gap-4">
                                <div className="text-5xl font-serif text-stone-900">
                                    {summary.averageRating.toFixed(1)}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex gap-0.5 text-[#D4AF37]">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < Math.round(summary.averageRating) ? 'fill-current' : 'text-stone-200'}`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm text-stone-500">מבוסס על {summary.totalReviews} ביקורות</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 space-y-4">
                            <h3 className="font-bold text-stone-900">קניתם את הזר הזה?</h3>
                            <p className="text-sm text-stone-600 leading-relaxed">שתפו אותנו ואת הלקוחות האחרים בחוויה שלכם. אנחנו מעריכים את המשוב שלכם!</p>
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className="w-full py-3 bg-david-green text-white rounded-full font-bold text-sm hover:bg-david-green/90 transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                                <MessageSquare className="w-4 h-4" />
                                {showForm ? 'סגור טופס' : 'כתבו ביקורת'}
                            </button>
                        </div>
                    </div>

                    {/* Right: Reviews List */}
                    <div className="md:col-span-8 flex flex-col">
                        <AnimatePresence mode="wait">
                            {showForm ? (
                                <motion.div
                                    key="form"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="p-8 bg-white border border-stone-200 rounded-3xl shadow-sm"
                                >
                                    <ReviewForm
                                        productId={productId}
                                        onCancel={() => setShowForm(false)}
                                        onSuccess={() => {
                                            setShowForm(false);
                                            loadData();
                                        }}
                                    />
                                </motion.div>
                            ) : reviews.length === 0 ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center py-20 text-center space-y-4 text-stone-400 border-2 border-dashed border-stone-100 rounded-3xl"
                                >
                                    <div className="w-16 h-16 bg-stone-50 flex items-center justify-center rounded-full">
                                        <MessageSquare className="w-8 h-8 opacity-20" strokeWidth={1} />
                                    </div>
                                    <p>עדיין אין ביקורות לזר זה. תהיו הראשונים לכתוב!</p>
                                </motion.div>
                            ) : (
                                <div className="space-y-12">
                                    {reviews.map((review, idx) => (
                                        <motion.div
                                            key={review.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="space-y-4 pb-12 border-b border-stone-100 last:border-0"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center overflow-hidden">
                                                        {review.userImage ? (
                                                            <Image src={review.userImage} alt={review.userName} width={40} height={40} />
                                                        ) : (
                                                            <span className="text-stone-400 font-bold">{review.userName?.[0] || 'A'}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-stone-900">{review.userName || 'לקוח/ה'}</span>
                                                            {review.isVerified && (
                                                                <span className="inline-flex items-center gap-0.5 text-[10px] bg-david-green/10 text-david-green px-1.5 py-0.5 rounded-full font-bold">
                                                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                                                    רכישה מאומתת
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-0.5 text-[#D4AF37] mt-0.5">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-stone-200'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-stone-400">{new Date(review.createdAt).toLocaleDateString('he-IL')}</span>
                                            </div>

                                            <p className="text-stone-700 leading-relaxed">{review.content}</p>

                                            {review.images?.length > 0 && (
                                                <div className="flex gap-2 pt-2">
                                                    {review.images.map((img: any) => (
                                                        <div key={img.id} className="relative w-20 h-24 bg-stone-100 rounded-lg overflow-hidden group cursor-zoom-in">
                                                            <Image src={img.url} alt="ביקורת לקוח" fill className="object-cover transition-transform group-hover:scale-110" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </section>
    );
}

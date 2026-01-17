'use client';

import { createProduct } from '@/app/actions/product-actions';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';
import SubmitButton from '@/components/admin/SubmitButton';
import { useState } from 'react';
import { CATEGORIES } from '@/lib/categories';
import CategoryMultiSelect from '@/components/admin/CategoryMultiSelect';

export default function NewProductPage() {
    const [imageUrl, setImageUrl] = useState('');

    return (
        <div className="p-10 max-w-3xl mx-auto">
            <div className="mb-8">
                <Link
                    href="/admin/products"
                    className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors mb-4 group"
                >
                    <ArrowRight className="w-4 h-4 group-hover:-mr-1 transition-all" />
                    <span>חזרה לרשימת המוצרים</span>
                </Link>
                <h1 className="text-3xl font-bold text-stone-900">הוספת מוצר חדש</h1>
                <p className="text-stone-500 mt-2">מלא את הפרטים ליצירת זר חדש בקטלוג.</p>
            </div>

            <form action={createProduct} className="bg-white p-8 rounded-lg border border-stone-200 shadow-sm space-y-8">

                {/* Basic Info */}
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-900">שם המוצר</label>
                            <input
                                name="name"
                                type="text"
                                required
                                placeholder="למשל: סחלב נסיכותי"
                                className="w-full text-right p-3 border border-stone-200 rounded-md focus:ring-1 focus:ring-stone-900 outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-stone-900">מחיר (₪)</label>
                                <input
                                    name="price"
                                    type="number"
                                    required
                                    placeholder="0.00"
                                    step="0.01"
                                    className="w-full text-right p-3 border border-stone-200 rounded-md focus:ring-1 focus:ring-stone-900 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-stone-900">מלאי</label>
                                <input
                                    name="stock"
                                    type="number"
                                    required
                                    placeholder="0"
                                    min="0"
                                    className="w-full text-right p-3 border border-stone-200 rounded-md focus:ring-1 focus:ring-stone-900 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-900">תיאור מלא</label>
                        <textarea
                            name="description"
                            required
                            rows={4}
                            className="w-full text-right p-3 border border-stone-200 rounded-md focus:ring-1 focus:ring-stone-900 outline-none resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-900">קטגוריות (ניתן לבחור יותר מאחת)</label>
                        <CategoryMultiSelect />
                    </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-4 pt-6 border-t border-stone-100">
                    <label className="text-sm font-medium text-stone-900 block">תמונות מוצר</label>
                    <input type="hidden" name="imageUrl" value={imageUrl} />
                    <ImageUpload
                        value={imageUrl ? [imageUrl] : []}
                        onChange={(url) => setImageUrl(url)}
                        onRemove={() => setImageUrl('')}
                    />
                </div>

                <div className="pt-6">
                    <SubmitButton />
                </div>
            </form>
        </div>
    );
}

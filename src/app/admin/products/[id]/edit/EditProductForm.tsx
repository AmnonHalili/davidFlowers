"use client";

import { updateProduct } from '@/app/actions/product-actions';
import ImageUpload from '@/components/admin/ImageUpload';
import { useState } from 'react';
import { CATEGORIES } from '@/lib/categories';
import CategoryMultiSelect from '@/components/admin/CategoryMultiSelect';

export default function EditProductForm({ product }: { product: any }) {
    const [imageUrl, setImageUrl] = useState(product.images[0]?.url || '');

    // Bind the ID to the server action
    const updateProductWithId = updateProduct.bind(null, product.id);

    return (
        <form action={updateProductWithId} className="bg-white p-8 rounded-lg border border-stone-200 shadow-sm space-y-8">
            {/* Basic Info */}
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-900">שם המוצר</label>
                        <input name="name" type="text" required defaultValue={product.name} className="w-full text-right p-3 border border-stone-200 rounded-md focus:ring-1 focus:ring-stone-900 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-900">מחיר (₪)</label>
                            <input name="price" type="number" required defaultValue={product.price.toString()} step="0.01" className="w-full text-right p-3 border border-stone-200 rounded-md focus:ring-1 focus:ring-stone-900 outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-900">מלאי</label>
                            <input name="stock" type="number" required defaultValue={product.stock} min="0" className="w-full text-right p-3 border border-stone-200 rounded-md focus:ring-1 focus:ring-stone-900 outline-none" />
                        </div>
                    </div>
                </div>

                {/* Sale Details */}
                <div className="space-y-4 pt-4 border-t border-stone-100">
                    <h3 className="text-sm font-bold text-stone-900">מבצעים והנחות</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-900">מחיר מבצע (₪)</label>
                            <input
                                name="salePrice"
                                type="number"
                                placeholder="למשל: 50"
                                defaultValue={product.salePrice?.toString() || ''}
                                step="0.01"
                                className="w-full text-right p-3 border border-stone-200 rounded-md focus:ring-1 focus:ring-stone-900 outline-none"
                            />
                            <p className="text-xs text-stone-500">השאר ריק כדי לבטל את המבצע</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-900">תאריך התחלה</label>
                            <input
                                name="saleStartDate"
                                type="datetime-local"
                                defaultValue={product.saleStartDate ? toLocalISOString(new Date(product.saleStartDate)) : ''}
                                className="w-full text-right p-3 border border-stone-200 rounded-md focus:ring-1 focus:ring-stone-900 outline-none ltr"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-900">תאריך סיום</label>
                            <input
                                name="saleEndDate"
                                type="datetime-local"
                                defaultValue={product.saleEndDate ? toLocalISOString(new Date(product.saleEndDate)) : ''}
                                className="w-full text-right p-3 border border-stone-200 rounded-md focus:ring-1 focus:ring-stone-900 outline-none ltr"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-stone-900">תיאור מלא</label>
                    <textarea name="description" required defaultValue={product.description} rows={4} className="w-full text-right p-3 border border-stone-200 rounded-md focus:ring-1 focus:ring-stone-900 outline-none resize-none" />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-stone-900">קטגוריות (ניתן לבחור יותר מאחת)</label>
                    <CategoryMultiSelect defaultSelected={product.categories.map((c: any) => c.slug)} />
                </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-4 pt-6 border-t border-stone-100">
                <label className="text-sm font-medium text-stone-900 block">תמונת מוצר</label>

                {/* Hidden input to send data to server action */}
                <input type="hidden" name="imageUrl" value={imageUrl} />

                <ImageUpload
                    value={imageUrl ? [imageUrl] : []}
                    onChange={(url) => setImageUrl(url)}
                    onRemove={() => setImageUrl('')}
                />
            </div>

            <div className="pt-6">
                <button type="submit" className="w-full bg-stone-900 text-white py-4 font-medium rounded-lg hover:bg-stone-800 transition-all shadow-lg active:scale-[0.98]">
                    שמור שינויים
                </button>
            </div>
        </form>
    );
}

// Helper to format date for datetime-local input (YYYY-MM-DDThh:mm) in local time
function toLocalISOString(date: Date) {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

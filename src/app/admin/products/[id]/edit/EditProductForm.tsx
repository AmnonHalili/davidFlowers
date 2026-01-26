"use client";

import { updateProduct } from '@/app/actions/product-actions';
import ImageUpload from '@/components/admin/ImageUpload';
import { useState } from 'react';
import { CATEGORIES } from '@/lib/categories';
import CategoryMultiSelect from '@/components/admin/CategoryMultiSelect';
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';

export default function EditProductForm({ product }: { product: any }) {
    const [imageUrl, setImageUrl] = useState(product.images[0]?.url || '');
    const [showScheduling, setShowScheduling] = useState(!!product.availableFrom);
    const [showSale, setShowSale] = useState(!!product.salePrice);

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
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-stone-900">מבצעים והנחות</h3>
                        <label className="relative inline-flex items-center cursor-pointer" dir="ltr">
                            <input
                                type="checkbox"
                                checked={showSale}
                                onChange={(e) => setShowSale(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-david-green"></div>
                            <span className="ml-3 text-xs font-medium text-stone-500" dir="rtl">{showSale ? 'פעיל' : 'כבוי'}</span>
                        </label>
                    </div>

                    {showSale && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
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
                    )}
                </div>

                {/* Scheduling & Availability */}
                <div className="space-y-4 pt-8 border-t border-stone-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                            <span>זמינות והשקה עתידית</span>
                            <span className="text-[10px] bg-david-green/10 text-david-green px-2 py-0.5 rounded-full font-medium tracking-wide">חדש</span>
                        </h3>
                        <label className="relative inline-flex items-center cursor-pointer" dir="ltr">
                            <input
                                type="checkbox"
                                checked={showScheduling}
                                onChange={(e) => setShowScheduling(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-david-green"></div>
                            <span className="ml-3 text-xs font-medium text-stone-500" dir="rtl">{showScheduling ? 'מופעל' : 'כבוי'}</span>
                        </label>
                    </div>

                    {showScheduling && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start animate-in fade-in slide-in-from-top-2 duration-300">
                            {/* Date Picker */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-stone-900">זמין למכירה החל מ-</label>
                                <input
                                    name="availableFrom"
                                    type="datetime-local"
                                    defaultValue={product.availableFrom ? toLocalISOString(new Date(product.availableFrom)) : ''}
                                    className="w-full text-right p-3 border border-stone-200 rounded-md focus:ring-1 focus:ring-david-green outline-none ltr transition-all"
                                />
                                <p className="text-xs text-stone-500">השאר ריק למכירה מיידית</p>
                            </div>

                            {/* Pre-order Toggle Card */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-stone-900">אופציונלי: אפשר הזמנה מוקדמת (Pre-order)</label>
                                <div className="flex items-center justify-between p-3 border border-stone-200 rounded-md bg-stone-50/50">
                                    <div className="space-y-1">
                                        <p className="text-xs text-stone-600 font-medium">מאפשר רכישה לפני פתיחת המלאי</p>
                                        <p className="text-[10px] text-stone-500">המשלוח יוגבל לתאריך ההשקה ומעלה</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer shrink-0" dir="ltr">
                                        <input
                                            name="allowPreorder"
                                            type="checkbox"
                                            defaultChecked={product.allowPreorder}
                                            className="sr-only peer"
                                        />
                                        <div className="w-12 h-7 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[20px] after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-david-green shadow-inner"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
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
                <SubmitButton />
            </div>
        </form>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-stone-900 text-white py-4 font-medium rounded-lg hover:bg-stone-800 transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
            {pending ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>שומר שינויים...</span>
                </>
            ) : (
                'שמור שינויים'
            )}
        </button>
    );
}

// Helper to format date for datetime-local input (YYYY-MM-DDThh:mm) in local time
function toLocalISOString(date: Date) {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

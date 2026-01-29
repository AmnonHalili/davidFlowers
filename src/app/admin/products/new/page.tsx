'use client';

import { createProduct } from '@/app/actions/product-actions';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';
import SubmitButton from '@/components/admin/SubmitButton';
import { useState } from 'react';
import CategoryMultiSelect from '@/components/admin/CategoryMultiSelect';

// Define helper components OUTSIDE properly
function PriceSection({ isVariablePrice, variations, handleVariationChange }: any) {
    if (!isVariablePrice) {
        return (
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
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-3 gap-4 text-center text-xs text-stone-500 font-medium bg-white p-2 border-b">
                <span>גודל</span>
                <span>תווית (ניתן לעריכה)</span>
                <span>מחיר (₪)</span>
            </div>
            {['small', 'medium', 'large'].map((size) => (
                <div key={size} className="grid grid-cols-3 gap-4 items-center">
                    <span className="text-sm font-bold text-stone-900 capitalize">{size}</span>
                    <input
                        type="text"
                        value={variations[size].label}
                        onChange={(e) => handleVariationChange(size, 'label', e.target.value)}
                        className="p-2 border border-stone-200 rounded text-sm"
                    />
                    <input
                        type="number"
                        value={variations[size].price}
                        onChange={(e) => handleVariationChange(size, 'price', parseFloat(e.target.value))}
                        className="p-2 border border-stone-200 rounded text-sm"
                    />
                </div>
            ))}
            <div className="space-y-2 pt-4 border-t">
                <label className="text-sm font-medium text-stone-900">מלאי כללי</label>
                <input
                    name="stock"
                    type="number"
                    required
                    placeholder="0"
                    min="0"
                    className="w-full text-right p-3 border border-stone-200 rounded-md focus:ring-1 focus:ring-stone-900 outline-none"
                />
                <p className="text-xs text-stone-500">המלאי מנוהל ברמת המוצר הכללי וירד בכל הזמנה ללא קשר לגודל.</p>
            </div>
        </div>
    );
}

export default function NewProductPage() {
    const [imageUrl, setImageUrl] = useState('');
    const [isVariablePrice, setIsVariablePrice] = useState(false);
    const [isSubscriptionEnabled, setIsSubscriptionEnabled] = useState(false);

    const [variations, setVariations] = useState<any>({
        small: { label: 'Small', price: 0 },
        medium: { label: 'Medium', price: 0 },
        large: { label: 'Large', price: 0 }
    });

    const handleVariationChange = (size: any, field: any, value: any) => {
        setVariations((prev: any) => ({
            ...prev,
            [size]: {
                ...prev[size],
                [field]: value
            }
        }));
    };

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
                <input type="hidden" name="isVariablePrice" value={isVariablePrice.toString()} />
                <input type="hidden" name="isSubscriptionEnabled" value={isSubscriptionEnabled.toString()} />
                <input type="hidden" name="variations" value={JSON.stringify(variations)} />

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

                        <div className="col-span-2 space-y-4">
                            <div className="bg-stone-50 p-4 rounded-lg border border-stone-100 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <label className="text-sm font-medium text-stone-900 block">אפשר רכישת מנוי</label>
                                    <p className="text-xs text-stone-500">האם לאפשר ללקוחות לרכוש מוצר זה כמנוי קבוע?</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-stone-500">{isSubscriptionEnabled ? 'פעיל' : 'כבוי'}</span>
                                    <label className="relative inline-flex items-center cursor-pointer" dir="ltr">
                                        <input
                                            type="checkbox"
                                            checked={isSubscriptionEnabled}
                                            onChange={(e) => setIsSubscriptionEnabled(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-david-green"></div>
                                    </label>
                                </div>
                            </div>

                            <div className="bg-stone-50 p-4 rounded-lg border border-stone-100 space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-stone-900">אפשר בחירת גדלים</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-stone-500">{isVariablePrice ? 'פעיל' : 'כבוי'}</span>
                                        <label className="relative inline-flex items-center cursor-pointer" dir="ltr">
                                            <input
                                                type="checkbox"
                                                checked={isVariablePrice}
                                                onChange={(e) => setIsVariablePrice(e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-david-green"></div>
                                        </label>
                                    </div>
                                </div>

                                <PriceSection
                                    isVariablePrice={isVariablePrice}
                                    variations={variations}
                                    handleVariationChange={handleVariationChange}
                                />
                            </div>
                        </div>

                        {/* Sale and Desc */}
                        <div className="space-y-4 pt-4 border-t border-stone-100">
                            <h3 className="text-sm font-bold text-stone-900">מבצעים והנחות</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-stone-900">מחיר מבצע (₪)</label>
                                    <input
                                        name="salePrice"
                                        type="number"
                                        placeholder="למשל: 50"
                                        step="0.01"
                                        className="w-full text-right p-3 border border-stone-200 rounded-md focus:ring-1 focus:ring-stone-900 outline-none"
                                    />
                                    <p className="text-xs text-stone-500">השאר ריק אם אין מבצע</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-stone-900">תאריך התחלה</label>
                                    <input
                                        name="saleStartDate"
                                        type="datetime-local"
                                        className="w-full text-right p-3 border border-stone-200 rounded-md focus:ring-1 focus:ring-stone-900 outline-none ltr"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-stone-900">תאריך סיום</label>
                                    <input
                                        name="saleEndDate"
                                        type="datetime-local"
                                        className="w-full text-right p-3 border border-stone-200 rounded-md focus:ring-1 focus:ring-stone-900 outline-none ltr"
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
                </div>
            </form>
        </div>
    );
}

"use client";

import { updateProduct } from '@/app/actions/product-actions';
import ImageUpload from '@/components/admin/ImageUpload';
import { useState } from 'react';
import CategoryMultiSelect from '@/components/admin/CategoryMultiSelect';
import { useFormStatus } from 'react-dom';
import { Loader2, Save } from 'lucide-react';

export default function EditProductForm({ product, availableCategories = [] }: { product: any, availableCategories?: any[] }) {
    const [imageUrl, setImageUrl] = useState(product.images[0]?.url || '');
    const [showScheduling, setShowScheduling] = useState(!!product.availableFrom);
    const [showSale, setShowSale] = useState(!!product.salePrice);

    const [isVariablePrice, setIsVariablePrice] = useState(product.isVariablePrice || false);
    const [isSubscriptionEnabled, setIsSubscriptionEnabled] = useState(product.isSubscriptionEnabled ?? false);
    const [isPersonalizationEnabled, setIsPersonalizationEnabled] = useState(product.isPersonalizationEnabled ?? false);

    // Default variations state or load from product
    const [variations, setVariations] = useState(product.variations || {
        standard: { label: 'Standard', price: 0, stock: 0 },
        medium: { label: 'Medium', price: 0, stock: 0 },
        large: { label: 'Large', price: 0, stock: 0 }
    });

    const handleVariationChange = (size: 'standard' | 'medium' | 'large', field: 'label' | 'price' | 'stock', value: string | number) => {
        setVariations((prev: any) => ({
            ...prev,
            [size]: {
                ...prev[size],
                [field]: value
            }
        }));
    };

    // Bind the ID to the server action
    const updateProductWithId = updateProduct.bind(null, product.id);

    return (
        <form action={updateProductWithId} className="space-y-6">

            {/* Hidden input for variations JSON */}
            <input type="hidden" name="isVariablePrice" value={isVariablePrice.toString()} />
            <input type="hidden" name="isSubscriptionEnabled" value={isSubscriptionEnabled.toString()} />
            <input type="hidden" name="isPersonalizationEnabled" value={isPersonalizationEnabled.toString()} />
            <input type="hidden" name="variations" value={JSON.stringify(variations)} />

            {/* Card 1: Basic Info */}
            <div className="bg-white p-4 md:p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-stone-900 border-b border-stone-100 pb-3 mb-4">פרטים בסיסיים</h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-900">שם המוצר</label>
                        <input name="name" type="text" required defaultValue={product.name} className="w-full text-right p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-900 outline-none transition-all" />
                    </div>

                    {/* Subscription & Price Logic Switch */}
                    <div className="space-y-4">
                        {/* Subscription Option Toggle */}
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

                        {/* Personalization Option Toggle */}
                        <div className="bg-stone-50 p-4 rounded-lg border border-stone-100 flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium text-stone-900 block">התאמה אישית (כיתוב)</label>
                                <p className="text-xs text-stone-500">האם לאפשר ללקוחות להוסיף כיתוב אישי?</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-stone-500">{isPersonalizationEnabled ? 'פעיל' : 'כבוי'}</span>
                                <label className="relative inline-flex items-center cursor-pointer" dir="ltr">
                                    <input
                                        type="checkbox"
                                        checked={isPersonalizationEnabled}
                                        onChange={(e) => setIsPersonalizationEnabled(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-david-green"></div>
                                </label>
                            </div>
                        </div>

                        {isPersonalizationEnabled && (
                            <div className="bg-stone-50 p-4 rounded-lg border border-stone-100 space-y-2 animate-in fade-in slide-in-from-top-1">
                                <label className="text-sm font-medium text-stone-900 block">הגבלת תווים</label>
                                <input
                                    name="maxPersonalizationChars"
                                    type="number"
                                    defaultValue={product.maxPersonalizationChars || 50}
                                    className="w-full text-right p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                                />
                                <p className="text-xs text-stone-500">השאר 0 ללא הגבלה (ברירת מחדל: 50)</p>
                            </div>
                        )}

                        {/* Variable Price Toggle */}
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

                            {!isVariablePrice ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-stone-900">מחיר (₪)</label>
                                        <input name="price" type="number" required={!isVariablePrice} defaultValue={product.price.toString()} step="0.01" className="w-full text-right p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-900 outline-none transition-all font-mono" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-stone-900">מלאי</label>
                                        <input name="stock" type="number" required defaultValue={product.stock} min="0" className="w-full text-right p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-900 outline-none transition-all font-mono" />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="grid grid-cols-4 gap-4 text-center text-xs text-stone-500 font-medium bg-white p-2 border-b">
                                        <span>גודל</span>
                                        <span>תווית (ניתן לעריכה)</span>
                                        <span>מחיר (₪)</span>
                                        <span>מלאי</span>
                                    </div>
                                    {/* Standard */}
                                    <div className="grid grid-cols-4 gap-4 items-center">
                                        <span className="text-sm font-bold text-stone-900">Standard</span>
                                        <input
                                            type="text"
                                            value={variations.standard?.label || 'Standard'}
                                            onChange={(e) => handleVariationChange('standard', 'label', e.target.value)}
                                            className="p-2 border border-stone-200 rounded text-sm"
                                        />
                                        <input
                                            type="number"
                                            value={variations.standard?.price || 0}
                                            onChange={(e) => handleVariationChange('standard', 'price', parseFloat(e.target.value))}
                                            className="p-2 border border-stone-200 rounded text-sm"
                                        />
                                        <input
                                            type="number"
                                            value={variations.standard?.stock || 0}
                                            onChange={(e) => handleVariationChange('standard', 'stock', parseInt(e.target.value) || 0)}
                                            className="p-2 border border-stone-200 rounded text-sm"
                                            min="0"
                                        />
                                    </div>
                                    {/* Medium */}
                                    <div className="grid grid-cols-4 gap-4 items-center">
                                        <span className="text-sm font-bold text-stone-900">Medium</span>
                                        <input
                                            type="text"
                                            value={variations.medium?.label || 'Medium'}
                                            onChange={(e) => handleVariationChange('medium', 'label', e.target.value)}
                                            className="p-2 border border-stone-200 rounded text-sm"
                                        />
                                        <input
                                            type="number"
                                            value={variations.medium?.price || 0}
                                            onChange={(e) => handleVariationChange('medium', 'price', parseFloat(e.target.value))}
                                            className="p-2 border border-stone-200 rounded text-sm"
                                        />
                                        <input
                                            type="number"
                                            value={variations.medium?.stock || 0}
                                            onChange={(e) => handleVariationChange('medium', 'stock', parseInt(e.target.value) || 0)}
                                            className="p-2 border border-stone-200 rounded text-sm"
                                            min="0"
                                        />
                                    </div>
                                    {/* Large */}
                                    <div className="grid grid-cols-4 gap-4 items-center">
                                        <span className="text-sm font-bold text-stone-900">Large</span>
                                        <input
                                            type="text"
                                            value={variations.large?.label || 'Large'}
                                            onChange={(e) => handleVariationChange('large', 'label', e.target.value)}
                                            className="p-2 border border-stone-200 rounded text-sm"
                                        />
                                        <input
                                            type="number"
                                            value={variations.large?.price || 0}
                                            onChange={(e) => handleVariationChange('large', 'price', parseFloat(e.target.value))}
                                            className="p-2 border border-stone-200 rounded text-sm"
                                        />
                                        <input
                                            type="number"
                                            value={variations.large?.stock || 0}
                                            onChange={(e) => handleVariationChange('large', 'stock', parseInt(e.target.value) || 0)}
                                            className="p-2 border border-stone-200 rounded text-sm"
                                            min="0"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-900">תיאור מלא</label>
                        <textarea name="description" required defaultValue={product.description} rows={4} className="w-full text-right p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-900 outline-none resize-none" />
                    </div>
                </div>
            </div>

            {/* Card 2: Categories */}
            <div className="bg-white p-4 md:p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-stone-900 border-b border-stone-100 pb-3 mb-4">קטגוריות</h3>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-stone-900 mb-2 block">בחר קטגוריות מתאימות</label>
                    <CategoryMultiSelect
                        defaultSelected={product.categories.map((c: any) => c.slug)}
                        availableCategories={availableCategories} // Pass available categories
                    />
                </div>
            </div>

            {/* Card 3: Status & Sale */}
            <div className="bg-white p-4 md:p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base md:text-lg font-bold text-stone-900">מבצעים והנחות</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-stone-500">{showSale ? 'פעיל' : 'כבוי'}</span>
                        <label className="relative inline-flex items-center cursor-pointer" dir="ltr">
                            <input
                                type="checkbox"
                                checked={showSale}
                                onChange={(e) => setShowSale(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-david-green"></div>
                        </label>
                    </div>
                </div>

                {showSale && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300 pt-4 border-t border-stone-100">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-900 block">מחיר מבצע (₪)</label>
                            <input
                                name="salePrice"
                                type="number"
                                placeholder="50"
                                defaultValue={product.salePrice?.toString() || ''}
                                step="0.01"
                                className="w-full text-right p-3.5 text-base border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none font-mono transition-all"
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-stone-900 block">תאריך התחלה</label>
                                <input
                                    name="saleStartDate"
                                    type="datetime-local"
                                    defaultValue={product.saleStartDate ? toLocalISOString(new Date(product.saleStartDate)) : ''}
                                    className="w-full text-right p-3.5 text-base border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none ltr transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-stone-900 block">תאריך סיום</label>
                                <input
                                    name="saleEndDate"
                                    type="datetime-local"
                                    defaultValue={product.saleEndDate ? toLocalISOString(new Date(product.saleEndDate)) : ''}
                                    className="w-full text-right p-3.5 text-base border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none ltr transition-all"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Card 4: Scheduling */}
            <div className="bg-white p-4 md:p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
                    <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                        <span>זמינות והשקה</span>
                        <span className="text-[10px] bg-david-green/10 text-david-green px-2 py-0.5 rounded-full font-medium tracking-wide">חדש</span>
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-stone-500">{showScheduling ? 'מופעל' : 'כבוי'}</span>
                        <label className="relative inline-flex items-center cursor-pointer" dir="ltr">
                            <input
                                type="checkbox"
                                checked={showScheduling}
                                onChange={(e) => setShowScheduling(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-david-green"></div>
                        </label>
                    </div>
                </div>

                {showScheduling && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-900">זמין למכירה החל מ-</label>
                            <input
                                name="availableFrom"
                                type="datetime-local"
                                defaultValue={product.availableFrom ? toLocalISOString(new Date(product.availableFrom)) : ''}
                                className="w-full text-right p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-david-green outline-none ltr"
                            />
                            <p className="text-xs text-stone-500">השאר ריק למכירה מיידית</p>
                        </div>

                        <div className="p-4 border border-stone-200 rounded-xl bg-stone-50/50 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-stone-900">הזמנה מוקדמת (Pre-order)</p>
                                <p className="text-xs text-stone-500">מאפשר רכישה לפני תאריך ההשקה</p>
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
                )}
            </div>

            {/* Card 5: Image Upload */}
            <div className="bg-white p-4 md:p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-stone-900 border-b border-stone-100 pb-3 mb-4">תמונת מוצר</h3>

                {/* Hidden input to send data to server action */}
                <input type="hidden" name="imageUrl" value={imageUrl} />

                <ImageUpload
                    value={imageUrl ? [imageUrl] : []}
                    onChange={(url) => setImageUrl(url)}
                    onRemove={() => setImageUrl('')}
                />
            </div>

            {/* Sticky Mobile Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-stone-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:relative md:bg-transparent md:border-t-0 md:shadow-none md:p-0 z-50">
                <div className="max-w-4xl mx-auto">
                    <SubmitButton />
                </div>
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
            className="w-full bg-stone-900 text-white py-3.5 md:py-4 font-bold rounded-xl md:rounded-lg hover:bg-stone-800 transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
            {pending ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>שומר שינויים...</span>
                </>
            ) : (
                <>
                    <Save className="w-5 h-5" />
                    <span>שמור שינויים</span>
                </>
            )}
        </button>
    );
}

// Helper to format date for datetime-local input (YYYY-MM-DDThh:mm) in local time
function toLocalISOString(date: Date) {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

'use client';

import { useState, useEffect } from 'react';
import {
    getCategoriesWithPromotions,
    updateCategoryPromotion,
    createCategory,
    updateCategoryDetails,
    deleteCategory,
    CategoryPromotionData
} from '@/app/actions/category-actions';
import { DiscountType } from '@prisma/client';
import { toast } from 'sonner';
import { Loader2, Calendar as CalendarIcon, Tag, Percent, DollarSign, Edit2, Check, X, Plus, Trash2, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

type CategoryWithCount = {
    id: string;
    name: string;
    discountType: DiscountType | null;
    discountAmount: any;
    discountEndDate: Date | null;
    isSaleActive: boolean;
    _count: { products: number };
};

export default function CategoriesPage() {
    const [categories, setCategories] = useState<CategoryWithCount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setIsLoading(true);
        const result = await getCategoriesWithPromotions();
        if (result.success && result.categories) {
            setCategories(result.categories as any);
        } else {
            toast.error('שגיאה בטעינת הקטגוריות');
        }
        setIsLoading(false);
    };

    const handleCreate = async () => {
        if (!newCategoryName.trim()) return;

        setIsCreating(true); // Re-use loading state or local state?
        const result = await createCategory(newCategoryName);

        if (result.success) {
            toast.success('קטגוריה נוספה בהצלחה');
            setNewCategoryName('');
            setIsCreating(false);
            loadCategories();
        } else {
            toast.error('שגיאה ביצירת קטגוריה');
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`האם אתה בטוח שברצונך למחוק את הקטגוריה "${name}"?`)) return;

        const result = await deleteCategory(id);
        if (result.success) {
            toast.success('קטגוריה נמחקה');
            loadCategories();
        } else {
            toast.error('שגיאה במחיקת קטגוריה (אולי יש לה מוצרים?)');
        }
    };

    const handleEdit = (category: CategoryWithCount) => {
        setEditingId(category.id);
    };

    const handleSave = async (id: string, data: CategoryPromotionData, newName?: string) => {
        // 1. Update Promotion
        const promoPromise = updateCategoryPromotion(id, data);

        // 2. Update Name if Changed
        let namePromise: Promise<{ success: boolean; error?: string }> = Promise.resolve({ success: true });
        if (newName) {
            namePromise = updateCategoryDetails(id, newName);
        }

        const [promoResult, nameResult] = await Promise.all([promoPromise, namePromise]);

        if (promoResult.success && nameResult.success) {
            toast.success('הקטגוריה עודכנה בהצלחה');
            setEditingId(null);
            loadCategories();
        } else {
            toast.error('שגיאה בעדכון הקטגוריה');
        }
    };

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-david-green" /></div>;

    const activePromotions = categories.filter(c => c.isSaleActive).length;

    return (
        <div className="space-y-8 pb-20">
            {/* Header Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900 font-serif">ניהול קטגוריות ומבצעים</h1>
                    <p className="text-stone-500 mt-1">נהל הנחות רוחביות לכל קטגוריה בקלות.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    {/* Stats Cards */}
                    <div className="flex gap-4">
                        <div className="bg-white px-4 py-2 rounded-lg border border-stone-200 shadow-sm flex items-center gap-3">
                            <div className="bg-david-green/10 p-2 rounded-full">
                                <Tag className="w-4 h-4 text-david-green" />
                            </div>
                            <div>
                                <span className="block text-xl font-bold text-stone-900 leading-none">{categories.length}</span>
                                <span className="text-xs text-stone-500">קטגוריות</span>
                            </div>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-lg border border-stone-200 shadow-sm flex items-center gap-3">
                            <div className="bg-purple-100 p-2 rounded-full">
                                <Percent className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                                <span className="block text-xl font-bold text-stone-900 leading-none">{activePromotions}</span>
                                <span className="text-xs text-stone-500">מבצעים פעילים</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Category Bar */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
                <input
                    type="text"
                    placeholder="שם קטגוריה חדשה..."
                    className="flex-1 p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-david-green focus:border-transparent outline-none w-full"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
                <button
                    onClick={handleCreate}
                    disabled={isCreating || !newCategoryName.trim()}
                    className="w-full sm:w-auto bg-stone-900 text-white px-6 py-2 rounded-lg hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    הוסף קטגוריה
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {categories.map((category) => (
                        <CategoryCard
                            key={category.id}
                            category={category}
                            isEditing={editingId === category.id}
                            onEdit={() => handleEdit(category)}
                            onCancel={() => setEditingId(null)}
                            onSave={(data, newName) => handleSave(category.id, data, newName)}
                            onDelete={() => handleDelete(category.id, category.name)}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {categories.length === 0 && (
                <div className="text-center py-20 text-stone-400">
                    לא נמצאו קטגוריות. צור אחת חדשה כדי להתחיל.
                </div>
            )}
        </div>
    );
}

function CategoryCard({ category, isEditing, onEdit, onCancel, onSave, onDelete }: {
    category: CategoryWithCount;
    isEditing: boolean;
    onEdit: () => void;
    onCancel: () => void;
    onSave: (data: CategoryPromotionData, newName?: string) => void;
    onDelete: () => void;
}) {
    const [data, setData] = useState<CategoryPromotionData>({
        discountType: category.discountType || 'PERCENTAGE',
        discountAmount: Number(category.discountAmount) || 0,
        discountEndDate: category.discountEndDate ? new Date(category.discountEndDate) : null,
        isSaleActive: category.isSaleActive,
    });
    const [name, setName] = useState(category.name);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${isEditing ? 'ring-2 ring-david-green border-transparent shadow-md' : 'border-stone-200 hover:shadow-md'}`}
        >
            {/* Card Header */}
            <div className="p-5 flex justify-between items-start bg-stone-50/50 min-h-[80px]">
                <div className="flex-1">
                    {isEditing ? (
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="font-bold text-lg text-stone-900 bg-white border border-stone-300 rounded px-2 py-1 w-full focus:ring-1 focus:ring-david-green outline-none"
                            placeholder="שם קטגוריה"
                        />
                    ) : (
                        <h3 className="font-bold text-lg text-stone-900">{category.name}</h3>
                    )}

                    <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {category._count?.products || 0} מוצרים
                    </p>
                </div>
                {!isEditing && (
                    <div className="flex gap-1">
                        <button
                            onClick={onEdit}
                            className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-500 hover:text-david-green"
                            title="ערוך"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-2 hover:bg-red-50 rounded-full transition-colors text-stone-300 hover:text-red-500"
                            title="מחק"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            <div className="p-5 pt-0">
                {!isEditing ? (
                    // View Mode
                    <div className="mt-4 min-h-[80px] flex flex-col justify-center">
                        {category.isSaleActive ? (
                            <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 relative overflow-hidden group">
                                <div className="flex justify-between items-center relative z-10">
                                    <div>
                                        <span className="text-xs font-bold text-purple-800 uppercase tracking-wider block mb-0.5">מבצע פעיל</span>
                                        <div className="text-xl font-bold text-purple-900 flex items-baseline gap-1">
                                            {category.discountType === 'PERCENTAGE' ? `${category.discountAmount}%` : `₪${category.discountAmount}`}
                                            <span className="text-sm font-normal text-purple-700">הנחה</span>
                                        </div>
                                    </div>
                                    <div className="bg-white p-2 rounded-full shadow-sm">
                                        {category.discountType === 'PERCENTAGE' ? <Percent className="w-4 h-4 text-purple-600" /> : <DollarSign className="w-4 h-4 text-purple-600" />}
                                    </div>
                                </div>
                                {category.discountEndDate && (
                                    <p className="text-[10px] text-purple-600/80 mt-2 flex items-center gap-1">
                                        <CalendarIcon className="w-3 h-3" />
                                        בתוקף עד {format(new Date(category.discountEndDate), 'dd/MM/yyyy')}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-4 border-2 border-dashed border-stone-100 rounded-lg">
                                <span className="text-sm text-stone-400">אין מבצע פעיל כרגע</span>
                            </div>
                        )}
                    </div>
                ) : (
                    // Edit Mode
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4 mt-2"
                    >
                        <div className="flex items-center gap-3 bg-stone-50 p-2 rounded-lg">
                            <span className="text-sm font-medium ml-auto">סטטוס מבצע:</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={data.isSaleActive}
                                    onChange={(e) => setData({ ...data, isSaleActive: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-david-green/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-david-green"></div>
                            </label>
                        </div>

                        {data.isSaleActive && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">סוג</label>
                                        <div className="relative">
                                            <select
                                                className="w-full p-2 text-sm border border-stone-200 rounded-lg appearance-none bg-stone-50 focus:bg-white focus:ring-1 focus:ring-david-green focus:border-david-green outline-none"
                                                value={data.discountType || 'PERCENTAGE'}
                                                onChange={(e) => setData({ ...data, discountType: e.target.value as any })}
                                            >
                                                <option value="PERCENTAGE">אחוזים (%)</option>
                                                <option value="FIXED">שקלים (₪)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">גובה הנחה</label>
                                        <input
                                            type="number"
                                            className="w-full p-2 text-sm border border-stone-200 rounded-lg focus:ring-1 focus:ring-david-green focus:border-david-green outline-none"
                                            value={data.discountAmount || ''}
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value);
                                                setData({ ...data, discountAmount: isNaN(val) ? 0 : val });
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">תוקף עד</label>
                                    <input
                                        type="date"
                                        className="w-full p-2 text-sm border border-stone-200 rounded-lg focus:ring-1 focus:ring-david-green focus:border-david-green outline-none"
                                        value={data.discountEndDate ? data.discountEndDate.toISOString().split('T')[0] : ''}
                                        onChange={(e) => setData({ ...data, discountEndDate: e.target.value ? new Date(e.target.value) : null })}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2 pt-2 border-t border-stone-100">
                            <button
                                onClick={onCancel}
                                className="flex-1 py-1.5 px-3 text-sm text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                            >
                                ביטול
                            </button>
                            <button
                                onClick={() => onSave(data, name !== category.name ? name : undefined)}
                                className="flex-1 py-1.5 px-3 text-sm bg-david-green text-white rounded-lg hover:bg-david-green/90 transition-colors flex items-center justify-center gap-2"
                            >
                                <Check className="w-3 h-3" />
                                שמור
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

'use client';

import { createCoupon, deleteCoupon, getCoupons } from '@/app/actions/coupon-actions';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function CouponsManager() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    // Form State
    const [code, setCode] = useState('');
    const [type, setType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
    const [amount, setAmount] = useState('');
    const [limit, setLimit] = useState('');
    const [firstOrderOnly, setFirstOrderOnly] = useState(false);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        const data = await getCoupons();
        setCoupons(data);
        setLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);

        const res = await createCoupon({
            code,
            discountType: type,
            discountAmount: Number(amount),
            usageLimit: limit ? Number(limit) : undefined,
            isFirstOrderOnly: firstOrderOnly
        });

        if (res.success) {
            toast.success('הקופון נוצר בהצלחה');
            setIsOpen(false);
            setCode('');
            setAmount('');
            setLimit('');
            loadCoupons();
        } else {
            toast.error(res.error || 'שגיאה ביצירת הקופון');
        }
        setCreating(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('למחוק את הקופון?')) return;
        const res = await deleteCoupon(id);
        if (res.success) {
            toast.success('קופון נמחק');
            loadCoupons();
        } else {
            toast.error('שגיאה במחיקה');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                <div>
                    <h2 className="font-serif text-2xl text-stone-900">ניהול קופונים</h2>
                    <p className="text-stone-500">צור ונהל קודי הנחה לחנות</p>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-david-green hover:bg-david-green/90 text-white flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-sm"
                >
                    <Plus className="w-4 h-4 ml-2" />
                    קופון חדש
                </button>
            </div>

            {/* Create Form */}
            {isOpen && (
                <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">קוד קופון</label>
                            <input
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                placeholder="SUMMER2026"
                                required
                                className="w-full p-2 border border-stone-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-david-green/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">סוג הנחה</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as 'PERCENTAGE' | 'FIXED')}
                                className="w-full p-2 border border-stone-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-david-green/20"
                            >
                                <option value="PERCENTAGE">אחוזים (%)</option>
                                <option value="FIXED">סכום קבוע (₪)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">ערך ההנחה</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                min="1"
                                className="w-full p-2 border border-stone-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-david-green/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">הגבלת שימושים (אופציונלי)</label>
                            <input
                                type="number"
                                value={limit}
                                onChange={(e) => setLimit(e.target.value)}
                                placeholder="ללא הגבלה"
                                className="w-full p-2 border border-stone-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-david-green/20"
                            />
                        </div>
                        <div className="space-y-2 flex items-center h-[42px]">
                            <label className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={firstOrderOnly}
                                    onChange={(e) => setFirstOrderOnly(e.target.checked)}
                                    className="w-4 h-4 rounded border-stone-200 text-david-green focus:ring-david-green/20"
                                />
                                הזמנה ראשונה בלבד
                            </label>
                        </div>
                        <button
                            type="submit"
                            disabled={creating}
                            className="bg-stone-900 text-white h-[42px] px-4 rounded-lg hover:bg-stone-800 transition-colors flex items-center justify-center font-medium disabled:opacity-50"
                        >
                            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'צור קופון'}
                        </button>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <table className="w-full text-sm text-right">
                    <thead className="bg-stone-50 text-stone-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">קוד</th>
                            <th className="px-6 py-4">סוג</th>
                            <th className="px-6 py-4">ערך</th>
                            <th className="px-6 py-4">הזמנה ראשונה</th>
                            <th className="px-6 py-4">שימושים</th>
                            <th className="px-6 py-4">פעולות</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-8">טוען...</td></tr>
                        ) : coupons.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-8 text-stone-400">אין קופונים פעילים</td></tr>
                        ) : (
                            coupons.map((coupon) => (
                                <tr key={coupon.id} className="hover:bg-stone-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-david-green">{coupon.code}</td>
                                    <td className="px-6 py-4">
                                        {coupon.discountType === 'PERCENTAGE' ? 'אחוזים' : 'סכום קבוע'}
                                    </td>
                                    <td className="px-6 py-4 font-bold">
                                        {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountAmount}%` : `₪${coupon.discountAmount}`}
                                    </td>
                                    <td className="px-6 py-4">
                                        {coupon.isFirstOrderOnly ? (
                                            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs font-semibold">כן</span>
                                        ) : (
                                            <span className="text-stone-400">לא</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {coupon.usageCount} / {coupon.usageLimit || '∞'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleDelete(coupon.id)}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded-md transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

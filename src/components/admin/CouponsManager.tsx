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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 md:p-6 rounded-xl border border-stone-200 shadow-sm gap-4">
                <div>
                    <h2 className="font-serif text-xl md:text-2xl text-stone-900">ניהול קופונים</h2>
                    <p className="text-sm text-stone-500">צור ונהל קודי הנחה לחנות</p>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full sm:w-auto bg-david-green hover:bg-david-green/90 text-white flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-sm"
                >
                    <Plus className="w-4 h-4 ml-1" />
                    קופון חדש
                </button>
            </div>

            {/* Create Form */}
            {isOpen && (
                <div className="bg-white p-4 md:p-6 rounded-xl border border-stone-200 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-stone-600 uppercase">קוד קופון</label>
                            <input
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                placeholder="SUMMER2026"
                                required
                                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-david-green/20 focus:border-david-green transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-stone-600 uppercase">סוג הנחה</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as 'PERCENTAGE' | 'FIXED')}
                                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-david-green/20 focus:border-david-green transition-all"
                            >
                                <option value="PERCENTAGE">אחוזים (%)</option>
                                <option value="FIXED">סכום קבוע (₪)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-stone-600 uppercase">ערך ההנחה</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                min="1"
                                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-david-green/20 focus:border-david-green transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-stone-600 uppercase">הגבלת שימושים (אופציונלי)</label>
                            <input
                                type="number"
                                value={limit}
                                onChange={(e) => setLimit(e.target.value)}
                                placeholder="ללא הגבלה"
                                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-david-green/20 focus:border-david-green transition-all"
                            />
                        </div>
                        <div className="space-y-4 md:space-y-2 flex flex-col items-start">
                            <label className="text-sm font-medium flex items-center gap-2 cursor-pointer py-1">
                                <input
                                    type="checkbox"
                                    checked={firstOrderOnly}
                                    onChange={(e) => setFirstOrderOnly(e.target.checked)}
                                    className="w-5 h-5 rounded border-stone-300 text-david-green focus:ring-david-green/20"
                                />
                                <span className="text-stone-700">הזמנה ראשונה בלבד</span>
                            </label>
                            <button
                                type="submit"
                                disabled={creating}
                                className="w-full md:w-auto bg-stone-900 text-white h-[44px] px-8 rounded-lg hover:bg-stone-800 transition-colors flex items-center justify-center font-medium disabled:opacity-50"
                            >
                                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'צור קופון'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm text-right">
                    <thead className="bg-stone-50 text-stone-500 font-medium border-b border-stone-200">
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
                            <tr><td colSpan={6} className="text-center py-12">טוען...</td></tr>
                        ) : coupons.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-12 text-stone-400">אין קופונים פעילים</td></tr>
                        ) : (
                            coupons.map((coupon) => (
                                <tr key={coupon.id} className="hover:bg-stone-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className="font-mono font-bold text-base text-david-green tracking-wider">{coupon.code}</span>
                                    </td>
                                    <td className="px-6 py-4 text-stone-600">
                                        {coupon.discountType === 'PERCENTAGE' ? 'אחוזים' : 'סכום קבוע'}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-stone-900">
                                        {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountAmount}%` : `₪${coupon.discountAmount}`}
                                    </td>
                                    <td className="px-6 py-4">
                                        {coupon.isFirstOrderOnly ? (
                                            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[11px] font-bold">הזמנה ראשונה</span>
                                        ) : (
                                            <span className="text-stone-300">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-stone-600">
                                        <span className="font-medium text-stone-900">{coupon.usageCount}</span>
                                        <span className="text-stone-400"> / {coupon.usageLimit || '∞'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleDelete(coupon.id)}
                                            className="text-stone-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                                            title="מחק קופון"
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {loading ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-stone-200">טוען...</div>
                ) : coupons.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-stone-200 text-stone-400">אין קופונים פעילים</div>
                ) : (
                    coupons.map((coupon) => (
                        <div key={coupon.id} className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden">
                            {coupon.isFirstOrderOnly && (
                                <div className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-br-lg font-bold">
                                    הזמנה ראשונה
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="text-xs text-stone-400 font-semibold mb-1 uppercase tracking-tight">קוד קופון</div>
                                    <div className="font-mono font-bold text-xl text-david-green tracking-wider">{coupon.code}</div>
                                </div>
                                <button
                                    onClick={() => handleDelete(coupon.id)}
                                    className="p-2.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-100">
                                <div>
                                    <div className="text-[10px] text-stone-400 font-semibold uppercase mb-1">הנחה</div>
                                    <div className="font-bold text-stone-900">
                                        {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountAmount}%` : `₪${coupon.discountAmount}`}
                                        <span className="text-[10px] font-normal text-stone-500 mr-1">
                                            ({coupon.discountType === 'PERCENTAGE' ? 'אחוזים' : 'קבוע'})
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-stone-400 font-semibold uppercase mb-1">שימושים</div>
                                    <div className="text-stone-900">
                                        <span className="font-bold">{coupon.usageCount}</span>
                                        <span className="text-stone-400 font-normal"> / {coupon.usageLimit || '∞'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

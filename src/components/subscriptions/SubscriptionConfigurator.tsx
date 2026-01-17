'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type Plan = {
    id: string;
    name: string;
    price: number;
    description: string;
    isPopular?: boolean;
};

export default function SubscriptionConfigurator({ plan }: { plan: Plan }) {
    const { addItem, openCart } = useCart();
    const [isConfiguring, setIsConfiguring] = useState(false);
    const [frequency, setFrequency] = useState<'WEEKLY' | 'BIWEEKLY'>('BIWEEKLY'); // Default to BiWeekly as it's common
    const [deliveryDay, setDeliveryDay] = useState<'THURSDAY' | 'FRIDAY'>('FRIDAY');

    const handleAddToCart = () => {
        addItem({
            id: `${plan.id}-${frequency}-${deliveryDay}`, // Unique ID for cart item
            productId: plan.id,
            name: `מנוי ${plan.name}`,
            price: plan.price,
            image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=200&auto=format&fit=crop", // Generic placeholder or specific plan image
            quantity: 1,
            type: 'SUBSCRIPTION',
            frequency,
            deliveryDay
        });
        toast.success('המנוי נוסף לסל', {
            description: `מנוי ${plan.name} (${frequency === 'WEEKLY' ? 'שבועי' : 'דו-שבועי'}) לימי ${deliveryDay === 'FRIDAY' ? 'שישי' : 'חמישי'}`
        });
        openCart();
        setIsConfiguring(false); // Reset/Close
    };

    if (isConfiguring) {
        return (
            <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* Frequency Selection */}
                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500">תדירות משלוח</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setFrequency('WEEKLY')}
                            className={`py-3 px-2 text-sm border rounded-lg transition-all ${frequency === 'WEEKLY'
                                    ? 'border-david-green bg-david-green/5 text-david-green font-bold shadow-sm'
                                    : 'border-stone-200 text-stone-600 hover:border-stone-300'
                                }`}
                        >
                            כל שבוע
                        </button>
                        <button
                            onClick={() => setFrequency('BIWEEKLY')}
                            className={`py-3 px-2 text-sm border rounded-lg transition-all ${frequency === 'BIWEEKLY'
                                    ? 'border-david-green bg-david-green/5 text-david-green font-bold shadow-sm'
                                    : 'border-stone-200 text-stone-600 hover:border-stone-300'
                                }`}
                        >
                            כל שבועיים
                        </button>
                    </div>
                </div>

                {/* Day Selection */}
                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500">יום חלוקה</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setDeliveryDay('THURSDAY')}
                            className={`py-3 px-2 text-sm border rounded-lg transition-all ${deliveryDay === 'THURSDAY'
                                    ? 'border-david-green bg-david-green/5 text-david-green font-bold shadow-sm'
                                    : 'border-stone-200 text-stone-600 hover:border-stone-300'
                                }`}
                        >
                            יום חמישי
                        </button>
                        <button
                            onClick={() => setDeliveryDay('FRIDAY')}
                            className={`py-3 px-2 text-sm border rounded-lg transition-all ${deliveryDay === 'FRIDAY'
                                    ? 'border-david-green bg-david-green/5 text-david-green font-bold shadow-sm'
                                    : 'border-stone-200 text-stone-600 hover:border-stone-300'
                                }`}
                        >
                            יום שישי
                        </button>
                    </div>
                </div>

                {/* Confirm Action */}
                <div className="flex gap-2 pt-2">
                    <button
                        onClick={handleAddToCart}
                        className="flex-1 bg-david-green text-white py-3 rounded-lg font-bold shadow-lg hover:bg-david-green/90 transition-transform active:scale-95"
                    >
                        הוספה לסל {plan.isPopular && '🔥'}
                    </button>
                    <button
                        onClick={() => setIsConfiguring(false)}
                        className="px-4 py-3 text-stone-500 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                        ביטול
                    </button>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsConfiguring(true)}
            className={`w-full py-4 text-sm font-bold uppercase tracking-widest transition-colors mt-auto ${plan.isPopular
                    ? 'bg-david-green text-white hover:bg-david-green/90 shadow-md'
                    : 'bg-stone-900 text-white hover:bg-stone-800'
                }`}
        >
            אני רוצה כזה
        </button>
    );
}

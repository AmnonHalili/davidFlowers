'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, RefreshCw, ShoppingBag } from 'lucide-react';
import { useCart, CartItem } from '@/context/CartContext';
import { useParams } from 'next/navigation';

type PurchaseType = 'SUBSCRIPTION' | 'ONETIME';
type Frequency = 'WEEKLY' | 'BIWEEKLY';
type DayOfWeek = 'THURSDAY' | 'FRIDAY';

export default function ProductSubscriptionForm() {
  const { addItem } = useCart();
  const [purchaseType, setPurchaseType] = useState<PurchaseType>('SUBSCRIPTION');
  const [frequency, setFrequency] = useState<Frequency>('WEEKLY');
  const [deliveryDay, setDeliveryDay] = useState<DayOfWeek>('FRIDAY');
  const [giftNote, setGiftNote] = useState('');

  const handleAddToCart = () => {
    // In a real app, this data would come from props or a query
    const newItem: CartItem = {
      id: Math.random().toString(36).substr(2, 9),
      productId: 'the-noble-peony',
      name: 'The Noble Peony',
      price: purchaseType === 'SUBSCRIPTION' ? 220 : 250,
      image: 'https://images.unsplash.com/photo-1563241527-3004b7be025f?auto=format&fit=crop&q=80',
      quantity: 1,
      type: purchaseType,
      frequency: purchaseType === 'SUBSCRIPTION' ? frequency : undefined,
      deliveryDay: purchaseType === 'SUBSCRIPTION' ? deliveryDay : undefined,
    };

    addItem(newItem);
  };

  return (
    <div className="space-y-8">
      {/* Type Toggle */}
      <div className="flex p-1 bg-stone-100 rounded-lg">
        <button
          onClick={() => setPurchaseType('SUBSCRIPTION')}
          className={`flex-1 py-3 text-sm font-medium rounded-md transition-all ${purchaseType === 'SUBSCRIPTION'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-500 hover:text-stone-700'
            }`}
        >
          מנוי קבוע (חסוך 15%)
        </button>
        <button
          onClick={() => setPurchaseType('ONETIME')}
          className={`flex-1 py-3 text-sm font-medium rounded-md transition-all ${purchaseType === 'ONETIME'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-500 hover:text-stone-700'
            }`}
        >
          חד פעמי
        </button>
      </div>

      <AnimatePresence mode="wait">
        {purchaseType === 'SUBSCRIPTION' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6 overflow-hidden"
          >
            {/* Frequency */}
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-wider font-medium text-stone-900">תדירות</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'WEEKLY', label: 'מדי שבוע', price: '₪220 / משלוח' },
                  { id: 'BIWEEKLY', label: 'כל שבועיים', price: '₪240 / משלוח' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFrequency(opt.id as Frequency)}
                    className={`border p-4 text-center transition-all ${frequency === opt.id
                        ? 'border-stone-900 bg-stone-50'
                        : 'border-stone-200 hover:border-stone-400'
                      }`}
                  >
                    <div className="font-medium text-stone-900">{opt.label}</div>
                    <div className="text-xs text-stone-500 mt-1">{opt.price}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Day */}
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-wider font-medium text-stone-900">יום אספקה מועדף</label>
              <div className="flex gap-2">
                {['THURSDAY', 'FRIDAY'].map((day) => (
                  <button
                    key={day}
                    onClick={() => setDeliveryDay(day as DayOfWeek)}
                    className={`flex-1 py-3 border text-sm transition-all ${deliveryDay === day
                        ? 'border-stone-900 bg-stone-900 text-white'
                        : 'border-stone-200 text-stone-600 hover:border-stone-400'
                      }`}
                  >
                    {day === 'THURSDAY' ? 'חמישי' : 'שישי'}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gift Note */}
      <div className="space-y-3">
        <label className="text-xs uppercase tracking-wider font-medium text-stone-900">כרטיס ברכה (אופציונלי)</label>
        <textarea
          value={giftNote}
          onChange={(e) => setGiftNote(e.target.value)}
          rows={3}
          className="w-full border border-stone-200 bg-transparent p-3 text-sm focus:border-stone-900 focus:ring-0 transition-colors placeholder:text-stone-300 resize-none"
          placeholder="כתבו כאן את הברכה שלכם..."
        />
      </div>

      <button
        onClick={handleAddToCart}
        className="w-full bg-stone-900 text-white py-4 font-medium tracking-wide hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 group"
      >
        <span>{purchaseType === 'SUBSCRIPTION' ? 'הוספה למנוי' : 'הוספה לסל'}</span>
        <span className="group-hover:-translate-x-1 transition-transform">←</span>
      </button>

      <p className="text-center text-[10px] text-stone-400">
        תשלום מאובטח באמצעות Stripe. ניתן לבטל את המנוי בכל עת.
      </p>
    </div>
  );
}

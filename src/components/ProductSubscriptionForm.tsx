'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, RefreshCw, ShoppingBag } from 'lucide-react';
import { useCart, CartItem } from '@/context/CartContext';
import { useParams } from 'next/navigation';
import BouquetSizeSelector from './product/BouquetSizeSelector';

type PurchaseType = 'SUBSCRIPTION' | 'ONETIME';
type Frequency = 'WEEKLY' | 'BIWEEKLY';
type DayOfWeek = 'THURSDAY' | 'FRIDAY';

interface ProductSubscriptionFormProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    availableFrom?: Date | string | null;
    allowPreorder?: boolean;
    isVariablePrice?: boolean;
    variations?: any; // JSON object
    isSubscriptionEnabled?: boolean;
  }
}

export default function ProductSubscriptionForm({ product }: ProductSubscriptionFormProps) {
  const { addItem } = useCart();
  const [purchaseType, setPurchaseType] = useState<PurchaseType>('ONETIME');
  const [frequency, setFrequency] = useState<Frequency>('WEEKLY');
  const [deliveryDay, setDeliveryDay] = useState<DayOfWeek>('FRIDAY');
  const [giftNote, setGiftNote] = useState('');

  // Size Variation State
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [currentPrice, setCurrentPrice] = useState(product.price);

  // Sticky Bar Logic
  const [isMainButtonVisible, setIsMainButtonVisible] = useState(true);
  const mainButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsMainButtonVisible(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    if (mainButtonRef.current) {
      observer.observe(mainButtonRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (product.isVariablePrice && product.variations) {
      if (product.variations[selectedSize]) {
        setCurrentPrice(product.variations[selectedSize].price);
      }
    } else {
      setCurrentPrice(product.price);
    }
  }, [selectedSize, product.isVariablePrice, product.variations, product.price]);

  // Scheduling Logic
  const now = new Date();
  const launchDate = product.availableFrom ? new Date(product.availableFrom) : null;
  const isFuture = launchDate && launchDate > now;
  const canPreorder = isFuture && product.allowPreorder;
  const isLocked = isFuture && !product.allowPreorder;

  const handleAddToCart = () => {
    if (isLocked) return;

    const basePrice = currentPrice;
    const finalPrice = purchaseType === 'SUBSCRIPTION' ? basePrice * 0.85 : basePrice;

    const newItem: CartItem = {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: finalPrice,
      originalPrice: purchaseType === 'SUBSCRIPTION' ? basePrice : undefined,
      image: product.image,
      quantity: 1,
      type: purchaseType,
      availableFrom: product.availableFrom ? new Date(product.availableFrom).toISOString() : undefined,
      frequency: purchaseType === 'SUBSCRIPTION' ? frequency : undefined,
      deliveryDay: purchaseType === 'SUBSCRIPTION' ? deliveryDay : undefined,
      selectedSize: product.isVariablePrice ? selectedSize : undefined,
      sizeLabel: product.isVariablePrice && product.variations ? product.variations[selectedSize].label : undefined,
    };

    addItem(newItem);
  };

  if (isLocked && launchDate) {
    return (
      <div className="bg-stone-50 border border-stone-200 rounded-sm p-8 text-center space-y-6 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('/pattern-grid.svg')] pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 bg-white px-2 py-1 border border-stone-100">
            COMING SOON
          </span>
          <h3 className="font-serif text-2xl text-stone-900">המוצר יהיה זמין לרכישה בקרוב</h3>
        </div>

        <div className="relative z-10 bg-white p-6 border border-stone-100 shadow-sm mx-auto max-w-xs space-y-1">
          <p className="text-stone-400 text-xs uppercase tracking-widest">מועד ההשקה</p>
          <div className="flex items-baseline justify-center gap-2" dir="ltr">
            <span className="font-mono text-xl font-medium text-stone-900">
              {launchDate.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
            <span className="text-stone-300">|</span>
            <span className="font-mono text-xl font-medium text-stone-900">
              {launchDate.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        <div className="pt-2">
          <button disabled className="w-full bg-stone-200 text-stone-400 py-4 font-medium tracking-wide cursor-not-allowed flex items-center justify-center gap-2 transition-colors">
            <span>טרם זמין לרכישה</span>
          </button>
          <p className="text-[10px] text-stone-400 mt-3">
            הירשמו לניוזלטר כדי לקבל עדכון כשהמכירה נפתחת
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Pre-order Notice */}
      {canPreorder && launchDate && (
        <div className="bg-david-green/10 border border-david-green/20 p-4 rounded-lg flex items-start gap-3">
          <div className="bg-david-green text-white text-[10px] font-bold px-2 py-1 rounded">PRE-ORDER</div>
          <p className="text-sm text-david-green/80 leading-relaxed">
            הזמינו עכשיו ושריינו את המוצר. המשלוח יתבצע החל מ-{launchDate.toLocaleDateString('he-IL')}.
          </p>
        </div>
      )}

      {/* Size Variations Selector */}
      {product.isVariablePrice && product.variations && (
        <div className="space-y-4">
          <BouquetSizeSelector
            variations={product.variations}
            selectedSize={selectedSize}
            onSelect={setSelectedSize}
          />

          <div className="text-center py-2">
            <span className="text-2xl font-serif text-stone-900">₪{currentPrice.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Type Toggle - Only show if subscription is enabled */}
      {product.isSubscriptionEnabled && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPurchaseType('SUBSCRIPTION')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 ${purchaseType === 'SUBSCRIPTION'
              ? 'border-[#1B3322] bg-[#1B3322] text-white shadow-md'
              : 'border-stone-200 bg-white text-stone-600 hover:border-[#C5A572] hover:bg-stone-50'
              }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw className={`w-4 h-4 ${purchaseType === 'SUBSCRIPTION' ? 'text-[#C5A572]' : 'text-stone-400'}`} />
              <span className="font-medium text-sm">מנוי קבוע</span>
            </div>
            <span className={`text-xs ${purchaseType === 'SUBSCRIPTION' ? 'text-stone-200' : 'text-stone-500'}`}>
              חסוך 15% מהמחיר
            </span>
          </button>

          <button
            onClick={() => setPurchaseType('ONETIME')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 ${purchaseType === 'ONETIME'
              ? 'border-[#1B3322] bg-[#1B3322] text-white shadow-md'
              : 'border-stone-200 bg-white text-stone-600 hover:border-[#C5A572] hover:bg-stone-50'
              }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className={`w-4 h-4 ${purchaseType === 'ONETIME' ? 'text-[#C5A572]' : 'text-stone-400'}`} />
              <span className="font-medium text-sm">חד פעמי</span>
            </div>
            <span className={`text-xs ${purchaseType === 'ONETIME' ? 'text-stone-200' : 'text-stone-500'}`}>
              רכישה רגילה
            </span>
          </button>
        </div>
      )}

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
                  { id: 'WEEKLY', label: 'מדי שבוע', price: `₪${(currentPrice * 0.85).toFixed(0)} / משלוח` },
                  { id: 'BIWEEKLY', label: 'כל שבועיים', price: `₪${(currentPrice * 0.85).toFixed(0)} / משלוח` },
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
        ref={mainButtonRef}
        onClick={handleAddToCart}
        className={`w-full text-white py-4 font-medium tracking-wide transition-colors flex items-center justify-center gap-2 group ${canPreorder
          ? 'bg-david-green hover:bg-david-green/90'
          : 'bg-stone-900 hover:bg-stone-800'
          }`}
      >
        <span>
          {canPreorder
            ? 'בצע הזמנה מוקדמת'
            : purchaseType === 'SUBSCRIPTION' ? 'הוספה למנוי' : `הוספה לסל - ₪${currentPrice.toFixed(2)}`
          }
        </span>
        <span className="group-hover:-translate-x-1 transition-transform">←</span>
      </button>

      <p className="text-center text-[10px] text-stone-400">
        תשלום מאובטח באמצעות Stripe. ניתן לבטל את המנוי בכל עת.
      </p>

      {/* Mobile Sticky Bottom Bar */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-stone-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] transition-transform duration-300 z-50 ${isMainButtonVisible ? 'translate-y-full' : 'translate-y-0'
        }`}>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-stone-500 mb-0.5">סה"כ לתשלום:</p>
            <p className="text-xl font-serif font-medium text-stone-900">₪{currentPrice.toFixed(2)}</p>
          </div>
          <button
            onClick={handleAddToCart}
            className="bg-[#1B3322] text-white px-8 py-3 rounded-full font-medium shadow-lg active:scale-95 transition-all text-sm"
          >
            {canPreorder ? 'שריון מוצר' : 'הוספה לסל'}
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import Image from 'next/image';
import { TrendingUp } from 'lucide-react';

interface HotProductsProps {
    products: {
        id: string;
        name: string;
        sales: number;
        revenue: number;
        image: string;
    }[];
}

export default function HotProducts({ products }: HotProductsProps) {
    return (
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm h-full">
            <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-david-green" />
                <h3 className="font-serif text-lg font-bold text-stone-900">מוצרים חמים</h3>
            </div>

            <div className="space-y-6">
                {products.length === 0 ? (
                    <p className="text-center text-stone-500 py-4">אין מספיק נתונים</p>
                ) : (
                    products.map((product, index) => (
                        <div key={product.id} className="flex items-center gap-4 group">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-100">
                                {product.image ? (
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
                                        No IMG
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-stone-900 truncate group-hover:text-david-green transition-colors">
                                    {product.name}
                                </h4>
                                <p className="text-xs text-stone-500">
                                    {product.sales} נמכרו
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="block text-sm font-bold text-stone-900">
                                    ₪{product.revenue.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

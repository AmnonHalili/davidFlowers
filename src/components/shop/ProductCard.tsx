'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface ProductCardProps {
    id: string;
    name: string;
    price: string;
    image: string;
    slug: string;
    category?: string;
    stock: number;
}

export default function ProductCard({ name, price, image, slug, category, stock }: ProductCardProps) {
    const isOutOfStock = stock <= 0;

    return (
        <Link href={`/product/${slug}`} className="group block space-y-4">
            <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
                <img
                    src={image}
                    alt={name}
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? 'grayscale opacity-80' : ''}`}
                />

                {isOutOfStock && (
                    <div className="absolute top-3 left-3 bg-white/90 text-stone-900 text-[10px] font-bold px-2 py-1 uppercase tracking-widest backdrop-blur-sm z-30">
                        אזל מהמלאי
                    </div>
                )}

                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Quick Add Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <button className="w-full bg-white/90 backdrop-blur-sm text-stone-900 py-3 uppercase text-xs tracking-widest font-bold hover:bg-stone-900 hover:text-white transition-colors">
                        צפייה במוצר
                    </button>
                </div>
            </div>

            <div className="text-center space-y-1">
                {category && (
                    <span className="text-[10px] uppercase tracking-widest text-stone-500">{category}</span>
                )}
                <h3 className="font-serif text-lg text-stone-900 group-hover:text-stone-600 transition-colors">
                    {name}
                </h3>
                <p className="font-light text-stone-900 text-sm">
                    {price}
                </p>
            </div>
        </Link>
    );
}

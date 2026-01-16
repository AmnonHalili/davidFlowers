'use client';

import Link from 'next/link';
import { ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
    id: string;
    name: string;
    price: string;
    image: string;
    slug: string;
    category?: string;
    stock: number;
    hoverImage?: string; // Optional second image for hover
}

export default function ProductCard({ id, name, price, image, slug, category, stock, hoverImage }: ProductCardProps) {
    const isOutOfStock = stock <= 0;
    const { addItem } = useCart();

    return (
        <Link href={`/product/${slug}`} className="group block space-y-4 rtl relative" dir="rtl">
            <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 rounded-sm">

                {/* Main Image */}
                <img
                    src={image}
                    alt={name}
                    className={`w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105 ${hoverImage ? 'group-hover:opacity-0' : ''} ${isOutOfStock ? 'grayscale opacity-80' : ''}`}
                />

                {/* Second Image (Crossfade) */}
                {hoverImage && (
                    <img
                        src={hoverImage}
                        alt={`${name} hover`}
                        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out scale-105"
                    />
                )}

                {/* Out of Stock Label */}
                {isOutOfStock && (
                    <div className="absolute top-3 right-3 bg-david-beige/90 text-david-green text-[10px] font-bold px-2 py-1 uppercase tracking-widest backdrop-blur-sm z-30">
                        אזל מהמלאי
                    </div>
                )}

                {/* Dark Overlay on Hover (Subtle) */}
                <div className="absolute inset-0 bg-david-green/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* "Quick Actions" Bottom Up Slide */}
                <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-20">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            if (isOutOfStock) return;
                            addItem({
                                id: id,
                                productId: id,
                                name: name,
                                price: parseFloat(price.replace(/[^\d.]/g, '')), // Clean price string (e.g. "₪120.00" -> 120.00)
                                image: image,
                                quantity: 1,
                                type: 'ONETIME'
                            });
                        }}
                        className="w-full bg-david-green text-david-beige py-3 uppercase text-xs tracking-widest font-bold hover:bg-david-green/90 transition-colors flex items-center justify-center gap-2"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        {isOutOfStock ? 'אזל מהמלאי' : 'הוסף לסל'}
                    </button>
                </div>
            </div>

            <div className="text-center space-y-1">
                {category && (
                    <span className="text-[10px] uppercase tracking-widest text-[#8A8A8A]">{category}</span>
                )}
                <h3 className="font-serif text-lg text-david-green group-hover:text-david-green/70 transition-colors duration-300">
                    {name}
                </h3>
                <p className="font-medium text-david-green/80 text-sm font-sans">
                    {price}
                </p>
            </div>
        </Link>
    );
}

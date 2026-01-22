import { getWishlist } from '@/app/actions/wishlist-actions';
import ProductCard from '@/components/shop/ProductCard';
import { Heart } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function WishlistPage() {
    const products = await getWishlist();

    return (
        <main className="min-h-screen pt-32 pb-20 px-6 bg-[#FAFAFA]" dir="rtl">
            <div className="max-w-screen-2xl mx-auto space-y-12">

                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <Heart className="w-12 h-12 text-david-green fill-david-green/10" strokeWidth={1} />
                    </div>
                    <h1 className="font-serif text-5xl text-david-green">המועדפים שלי</h1>
                    <p className="text-david-green/60 text-lg font-light max-w-lg mx-auto">
                        כל הדברים שאהבת במקום אחד
                    </p>
                </div>

                {/* Empty State */}
                {products.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-stone-100 max-w-2xl mx-auto space-y-6">
                        <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto text-stone-300">
                            <Heart className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-xl font-serif text-stone-900">רשימת המשאלות שלך ריקה</p>
                            <p className="text-stone-500 mt-2">מצאת משהו שאהבת? מלא את הלב כדי לשמור אותו כאן.</p>
                        </div>
                        <Link
                            href="/"
                            className="inline-block bg-david-green text-white px-8 py-3 rounded-full font-medium hover:bg-david-green/90 transition-colors"
                        >
                            חזרה לקניות
                        </Link>
                    </div>
                ) : (
                    /* Products Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((product: any) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                price={`₪${Number(product.price).toFixed(0)}`}
                                image={product.images.find((i: any) => i.isMain)?.url || product.images[0]?.url || '/placeholder.jpg'}
                                slug={product.slug}
                                stock={product.stock}
                                category="WISHLIST" // Or actual category if we fetched it, but 'WISHLIST' is a nice label context
                                isFavorited={true} // Since it's in wishlist, it's favorited
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

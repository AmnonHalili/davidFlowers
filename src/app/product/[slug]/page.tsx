import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import ProductSubscriptionForm from '@/components/ProductSubscriptionForm';
import ProductCard from '@/components/shop/ProductCard';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const prisma = new PrismaClient();

async function getProduct(slug: string) {
    const product = await prisma.product.findUnique({
        where: { slug },
        include: {
            images: true,
            categories: true
        }
    });

    if (!product) return null;
    return product;
}

async function getRelatedProducts(currentProductId: string, categorySlug?: string) {
    if (!categorySlug) return [];

    return await prisma.product.findMany({
        where: {
            categories: {
                some: { slug: categorySlug }
            },
            id: { not: currentProductId }
        },
        take: 4,
        include: { images: true, categories: true }
    });
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
    const decodedSlug = decodeURIComponent(params.slug);
    const product = await getProduct(decodedSlug);
    const relatedProducts = product
        ? await getRelatedProducts(product.id, product.categories[0]?.slug)
        : [];

    if (!product) {
        notFound();
    }

    const mainImage = product.images.find(img => img.isMain)?.url || product.images[0]?.url || '';
    const galleryImages = product.images.filter(img => !img.isMain);

    return (
        <div className="min-h-screen bg-white pb-32">
            <div className="max-w-screen-xl mx-auto md:px-6 md:pt-32 pt-20">

                {/* Back Button (Mobile & Desktop) */}
                <div className="flex justify-between items-center px-6 md:px-0 mb-6 md:mb-8">
                    <Link
                        href="/shop"
                        className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors group"
                    >
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        <span>חזרה לחנות</span>
                    </Link>

                    {/* Breadcrumb (Desktop Only) */}
                    <div className="hidden md:flex gap-2 text-xs text-stone-400 uppercase tracking-widest">
                        <span className="text-stone-900 font-medium">{product.name}</span>
                        <span>/</span>
                        <Link href="/shop" className="hover:text-stone-900">חנות</Link>
                        <span>/</span>
                        <Link href="/" className="hover:text-stone-900">בית</Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-16">
                    {/* Gallery Section - Full width on mobile with snap scroll */}
                    <div className="relative">
                        <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-0 md:mx-0">
                            {/* Main Image */}
                            <div className="snap-center min-w-full aspect-[3/4] bg-stone-100 overflow-hidden relative">
                                <img
                                    src={mainImage}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {/* Gallery Images */}
                            {galleryImages.map(img => (
                                <div key={img.id} className="snap-center min-w-full aspect-[3/4] bg-stone-100 overflow-hidden relative">
                                    <img src={img.url} alt={img.alt || product.name} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>

                        {/* Mobile Pagination Dots */}
                        {(galleryImages.length > 0) && (
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 md:hidden">
                                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                                {galleryImages.map(img => (
                                    <div key={img.id} className="w-1.5 h-1.5 rounded-full bg-white/50 shadow-sm" />
                                ))}
                            </div>
                        )}

                        {/* Desktop Thumbnails (Hidden on Mobile) */}
                        {galleryImages.length > 0 && (
                            <div className="hidden md:grid grid-cols-4 gap-4 mt-4">
                                {galleryImages.map(img => (
                                    <div key={img.id} className="aspect-square bg-stone-50 overflow-hidden cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                                        <img src={img.url} alt={img.alt || product.name} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details & Purchase */}
                    <div className="px-6 py-8 md:p-0 space-y-8 md:space-y-10 md:sticky md:top-32 md:h-fit">
                        <div className="space-y-3 md:space-y-4">
                            <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-stone-500">
                                {product.categories.map(c => c.name).join(', ')}
                            </span>
                            <h1 className="font-serif text-3xl md:text-5xl text-stone-900">{product.name}</h1>
                            <p className="text-xl md:text-2xl font-light text-stone-900">₪{Number(product.price).toFixed(2)}</p>
                            <div className="prose prose-stone text-stone-600 font-light leading-relaxed text-sm md:text-base">
                                <p>{product.description}</p>
                            </div>
                        </div>

                        {/* Purchase Logic */}
                        <div id="purchase-form" className="border-t border-stone-100 pt-8 md:pt-10">
                            {product.stock > 0 ? (
                                <ProductSubscriptionForm product={{
                                    id: product.id,
                                    name: product.name,
                                    price: Number(product.price),
                                    image: mainImage
                                }} />
                            ) : (
                                <div className="bg-stone-100 p-6 rounded-lg text-center space-y-2">
                                    <span className="block text-stone-900 font-medium">המוצר אזל מהמלאי זמנית</span>
                                    <p className="text-sm text-stone-500">אנחנו עובדים על חידוש המלאי. חזור להתעדכן בקרוב!</p>
                                </div>
                            )}
                        </div>

                        {/* Policies */}
                        <div className="space-y-4 pt-4 md:pt-8 bg-stone-50/50 p-4 -mx-6 md:bg-transparent md:p-0 md:mx-0 rounded-lg md:rounded-none">
                            <div className="flex gap-4 items-start">
                                <span className="text-stone-900 font-medium text-xs uppercase tracking-wider min-w-[80px]">משלוח:</span>
                                <p className="text-xs text-stone-500 leading-relaxed">משלוח חינם למנויים. הזמנות חד-פעמיות - ₪35. משלוח מהיום להיום בהזמנה עד השעה 10:00.</p>
                            </div>
                            <div className="flex gap-4 items-start">
                                <span className="text-stone-900 font-medium text-xs uppercase tracking-wider min-w-[80px]">טריות:</span>
                                <p className="text-xs text-stone-500 leading-relaxed">אנו מתחייבים ל-5 ימי טריות לפחות. אם הפרחים לא הגיעו מושלמים, נחליף אותם ללא שאלות.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
                <div className="max-w-screen-xl mx-auto px-6 mt-32 border-t border-stone-100 pt-20">
                    <h2 className="font-serif text-3xl text-stone-900 mb-12 text-center">אולי תאהבו גם...</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {relatedProducts.map((related) => (
                            <ProductCard
                                key={related.id}
                                id={related.id}
                                name={related.name}
                                price={`₪${Number(related.price).toFixed(0)}`}
                                image={related.images.find(i => i.isMain)?.url || related.images[0]?.url || '/placeholder.jpg'}
                                slug={related.slug}
                                stock={related.stock}
                                category={related.categories[0]?.name}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

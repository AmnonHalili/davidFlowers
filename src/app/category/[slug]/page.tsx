
import { PrismaClient } from '@prisma/client';
import ProductCard from '@/components/shop/ProductCard';
import { notFound } from 'next/navigation';
import { CATEGORIES } from '@/lib/categories';

const prisma = new PrismaClient();

export default async function CategoryPage({ params }: { params: { slug: string } }) {
    // Decode URI component just in case, though usually slugs are english
    const slug = decodeURIComponent(params.slug);

    // 1. Get Category Name (Hebrew) from our constant or DB
    // We prefer the constant map to ensure we display the correct Hebrew title even if DB is messy
    const categoryInfo = CATEGORIES.find(c => c.slug === slug);

    // If category doesn't exist in our map, we might still check DB or 404
    // User requested "Specific keys", so strictly adhering to the list is safer
    if (!categoryInfo) {
        // Optional: Check DB if we allow dynamic categories not in list
        // For now, let's just 404 to ensure quality
        // return notFound();
    }

    const title = categoryInfo?.name || slug; // Fallback

    // 2. Fetch Products
    const products = await prisma.product.findMany({
        where: {
            categories: {
                some: {
                    slug: slug
                }
            }
        },
        include: {
            images: true
        }
    });

    return (
        <main className="min-h-screen pt-32 pb-20 px-6 bg-[#FAFAFA]" dir="rtl">
            <div className="max-w-screen-2xl mx-auto space-y-12">

                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="font-serif text-5xl text-david-green">{title}</h1>
                    <p className="text-david-green/60 text-lg font-light max-w-lg mx-auto">
                        קולקציית {title} שנבחרה בקפידה עבורכם
                    </p>
                </div>

                {/* Grid */}
                {products.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-xl text-stone-400">טרם נוספו מוצרים לקטגוריה זו.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                price={`₪${Number(product.price).toFixed(0)}`}
                                image={product.images.find(i => i.isMain)?.url || product.images[0]?.url || '/placeholder.jpg'}
                                slug={product.slug}
                                stock={product.stock}
                                category={title}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

// Generate static params if we want SSG, but dynamic is fine for now

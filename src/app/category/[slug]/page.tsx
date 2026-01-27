
import ProductCard from '@/components/shop/ProductCard';
import FilterBar from '@/components/shop/FilterBar';
import { notFound } from 'next/navigation';
import { CATEGORIES } from '@/lib/categories';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

interface CategoryPageProps {
    params: { slug: string };
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
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

    // Parse Search Params
    const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'recommended';
    const minPrice = typeof searchParams.min === 'string' ? Number(searchParams.min) : undefined;
    const maxPrice = typeof searchParams.max === 'string' ? Number(searchParams.max) : undefined;

    // Build Sort Object
    let orderBy: any = {};
    switch (sort) {
        case 'price_asc':
            orderBy = { price: 'asc' };
            break;
        case 'price_desc':
            orderBy = { price: 'desc' };
            break;
        case 'newest':
            orderBy = { createdAt: 'desc' };
            break;
        case 'recommended':
        default:
            // Default sort, maybe by popularity or manually set order if we had one
            orderBy = { updatedAt: 'desc' }; // Fallback to recently updated for now
            break;
    }

    // 2. Fetch Products with Filters
    // 2. Fetch Products with Filters
    let products: any[] = [];
    try {
        products = await prisma.product.findMany({
            where: {
                categories: {
                    some: {
                        slug: slug
                    }
                },
                price: {
                    gte: minPrice,
                    lte: maxPrice
                }
            },
            orderBy,
            include: {
                images: true
            }
        });
    } catch (error) {
        console.error("Category: Failed to fetch products", error);
    }

    // 3. Fetch User Favorites (if logged in)
    let favoritesSet = new Set<string>();
    try {
        const { userId } = await auth();
        if (userId) {
            const user = await prisma.user.findUnique({
                where: { clerkId: userId },
                select: { favorites: { select: { id: true } } }
            });
            if (user?.favorites) {
                favoritesSet = new Set(user.favorites.map(f => f.id));
            }
        }
    } catch (error) {
        console.error("Category: Failed to fetch user favorites", error);
    }

    return (
        <main className="min-h-screen pt-8 pb-20 px-6 bg-[#FAFAFA]" dir="rtl">
            <div className="max-w-screen-2xl mx-auto space-y-12">

                {/* Header */}
                <div className="text-center space-y-4 mb-4">
                    <h1 className="font-serif text-5xl text-david-green">{title}</h1>
                    <p className="text-david-green/60 text-lg font-light max-w-lg mx-auto">
                        קולקציית {title} שנבחרה בקפידה עבורכם
                    </p>
                </div>

                {/* Filters */}
                <FilterBar />

                {/* Grid */}
                {products.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-xl text-stone-400">טרם נוספו מוצרים לקטגוריה זו.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((product: any) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                price={Number(product.price)}
                                image={product.images.find((i: any) => i.isMain)?.url || product.images[0]?.url || '/placeholder.jpg'}
                                slug={product.slug}
                                stock={product.stock}
                                category={title}
                                isFavorited={favoritesSet.has(product.id)}
                                salePrice={product.salePrice ? Number(product.salePrice) : null}
                                saleStartDate={product.saleStartDate}
                                saleEndDate={product.saleEndDate}
                                availableFrom={product.availableFrom}
                                allowPreorder={product.allowPreorder}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

// Generate static params if we want SSG, but dynamic is fine for now

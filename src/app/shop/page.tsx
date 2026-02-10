import { PrismaClient } from '@prisma/client';
import ProductCard from '@/components/shop/ProductCard';
import FilterBar from '@/components/shop/FilterBar';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

interface ShopPageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

async function getProducts(params: { min?: number; max?: number; sort?: string }) {
    const { min, max, sort } = params;

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
        default:
            orderBy = { updatedAt: 'desc' };
    }

    try {
        const products = await prisma.product.findMany({
            where: {
                price: {
                    gte: min,
                    lte: max
                }
            },
            orderBy,
            include: {
                images: true,
                categories: true
            }
        });
        return products;
    } catch (error) {
        console.error("Shop: Failed to fetch products", error);
        return [];
    }
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
    const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'recommended';
    const minPrice = typeof searchParams.min === 'string' ? Number(searchParams.min) : undefined;
    const maxPrice = typeof searchParams.max === 'string' ? Number(searchParams.max) : undefined;

    const products = await getProducts({ min: minPrice, max: maxPrice, sort });

    // Fetch User Favorites
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
        console.error("Shop: Failed to fetch user favorites", error);
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] pt-4 md:pt-6 pb-20">
            <div className="max-w-screen-2xl mx-auto px-6 space-y-6 md:space-y-8">
                {/* Header - Slim Compact Luxury */}
                <div className="flex flex-col items-center text-center space-y-1 md:space-y-1 pt-0 pb-4 md:py-2">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-stone-500 font-bold">הקולקציה המלאה</span>
                    <h1 className="font-serif text-3xl md:text-5xl text-stone-900 uppercase tracking-tight">SHOP ALL</h1>
                    <p className="font-light text-stone-500 max-w-lg mx-auto text-sm md:text-base">
                        בחרו את הזר המושלם עבורכם, או פנקו מישהו אהוב במשלוח טרי ומרגש.
                    </p>
                </div>

                {/* Filters */}
                <FilterBar />

                {/* Product Grid - Compact 3-Col */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-8 md:gap-y-12">
                    {products.map((product: any) => {
                        const mainImage = product.images.length > 0
                            ? product.images.find((img: any) => img.isMain)?.url || product.images[0].url
                            : 'https://images.unsplash.com/photo-1596627006880-6029968434d3?auto=format&fit=crop&q=80';

                        const categoryName = product.categories.length > 0 ? product.categories[0].name : '';

                        return (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                price={Number(product.price)}
                                image={mainImage}
                                slug={product.slug}
                                category={categoryName}
                                stock={product.stock}
                                isFavorited={favoritesSet.has(product.id)}
                                salePrice={product.salePrice ? Number(product.salePrice) : null}
                                saleStartDate={product.saleStartDate}
                                saleEndDate={product.saleEndDate}
                                availableFrom={product.availableFrom}
                                allowPreorder={product.allowPreorder}
                                isVariablePrice={product.isVariablePrice}
                                variations={product.variations}
                                isPersonalizationEnabled={product.isPersonalizationEnabled}
                                maxPersonalizationChars={product.maxPersonalizationChars}
                                categories={product.categories}
                            />
                        );
                    })}
                </div>

                {products.length === 0 && (
                    <div className="py-20 text-center text-stone-400 font-light">
                        <p className="text-xl">לא נמצאו מוצרים שתואמים לסינון שבחרת.</p>
                        <button
                            onClick={() => window.location.href = '/shop'}
                            className="text-david-green font-bold uppercase tracking-widest text-xs mt-4 underline"
                        >
                            נקה מסננים
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

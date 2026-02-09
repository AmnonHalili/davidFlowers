import { PrismaClient } from '@prisma/client';
import ProductCard from '@/components/shop/ProductCard';
import { notFound } from 'next/navigation';

const prisma = new PrismaClient();

async function getCategory(slug: string) {
    try {
        const category = await prisma.category.findUnique({
            where: { slug: decodeURIComponent(slug) },
            include: {
                products: {
                    include: {
                        images: true,
                        categories: true
                    }
                }
            }
        });
        return category;
    } catch (error) {
        console.error("Shop/Category: Failed to fetch category", error);
        return null;
    }
}



export default async function CategoryPage({ params }: { params: { category: string } }) {
    const category = await getCategory(params.category);

    if (!category) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-white pt-8 pb-20">
            <div className="max-w-screen-2xl mx-auto px-6 space-y-12">
                {/* Header - Slim Compact Luxury */}
                <div className="flex flex-col items-center text-center space-y-2 py-4">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-stone-500">קולקציית</span>
                    <h1 className="font-serif text-3xl md:text-5xl text-stone-900">{category.name}</h1>
                    <p className="font-light text-stone-500 max-w-lg mx-auto text-sm md:text-base line-clamp-2">
                        מוצרים נבחרים מקטגוריית {category.name}, מעוצבים באהבה.
                    </p>
                </div>

                {/* Product Grid - Compact 3-Col */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-8 md:gap-x-6 md:gap-y-10">
                    {category.products.map((product: any) => {
                        const mainImage = product.images.length > 0
                            ? product.images.find((img: any) => img.isMain)?.url || product.images[0].url
                            : 'https://images.unsplash.com/photo-1596627006880-6029968434d3?auto=format&fit=crop&q=80';

                        return (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                price={Number(product.price)}
                                image={mainImage}
                                slug={product.slug}
                                category={category.name}
                                stock={product.stock}
                                salePrice={product.salePrice ? Number(product.salePrice) : null}
                                saleStartDate={product.saleStartDate}
                                saleEndDate={product.saleEndDate}
                                availableFrom={product.availableFrom}
                                allowPreorder={product.allowPreorder}
                                isVariablePrice={product.isVariablePrice}
                                variations={product.variations}
                                isPersonalizationEnabled={product.isPersonalizationEnabled}
                                maxPersonalizationChars={product.maxPersonalizationChars}
                            />
                        );
                    })}
                </div>

                {category.products.length === 0 && (
                    <div className="py-20 text-center text-stone-400 font-light">
                        לא נמצאו מוצרים בקטגוריה זו כרגע.
                    </div>
                )}
            </div>
        </div>
    );
}

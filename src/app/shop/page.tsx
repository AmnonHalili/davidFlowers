import { PrismaClient } from '@prisma/client';
import ProductCard from '@/components/shop/ProductCard';

const prisma = new PrismaClient();

async function getProducts() {
    try {
        const products = await prisma.product.findMany({
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

export default async function ShopPage() {
    const products = await getProducts();
    // const categories = await getCategories(); // Removed in favor of static config

    return (
        <div className="min-h-screen bg-white pt-8 pb-20">
            <div className="max-w-screen-2xl mx-auto px-6 space-y-12">
                {/* Header - Slim Compact Luxury */}
                <div className="flex flex-col items-center text-center space-y-2 py-4">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-stone-500">הקולקציה המלאה</span>
                    <h1 className="font-serif text-3xl md:text-5xl text-stone-900">חנות הפרחים</h1>
                    <p className="font-light text-stone-500 max-w-lg mx-auto text-sm md:text-base line-clamp-2">
                        בחרו את הזר המושלם עבורכם, או פנקו מישהו אהוב במשלוח טרי ומרגש.
                    </p>
                </div>

                {/* Product Grid - Compact 3-Col */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-8 md:gap-x-6 md:gap-y-10">
                    {products.map((product: any) => {
                        // Safe check for image
                        const mainImage = product.images.length > 0
                            ? product.images.find((img: any) => img.isMain)?.url || product.images[0].url
                            : 'https://images.unsplash.com/photo-1596627006880-6029968434d3?auto=format&fit=crop&q=80';

                        // Safe check for category
                        const categoryName = product.categories.length > 0 ? product.categories[0].name : '';

                        // CRITICAL: Convert Prisma Decimal to number to avoid serialization issues
                        const price = Number(product.price);
                        const salePrice = product.salePrice ? Number(product.salePrice) : null;

                        return (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                price={price}
                                image={mainImage}
                                slug={product.slug}
                                category={categoryName}
                                stock={product.stock}
                                salePrice={salePrice}
                                saleStartDate={product.saleStartDate}
                                saleEndDate={product.saleEndDate}
                                availableFrom={product.availableFrom}
                                allowPreorder={product.allowPreorder}
                                isVariablePrice={product.isVariablePrice}
                                variations={product.variations}
                            />
                        );
                    })}
                </div>

                {products.length === 0 && (
                    <div className="py-20 text-center text-stone-400 font-light">
                        לא נמצאו מוצרים בקולקציה זו כרגע.
                    </div>
                )}
            </div>
        </div>
    );
}

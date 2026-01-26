import { PrismaClient } from '@prisma/client';
import ProductCard from '@/components/shop/ProductCard';

const prisma = new PrismaClient();

async function getProducts() {
    const products = await prisma.product.findMany({
        include: {
            images: true,
            categories: true
        }
    });

    return products;
}

export default async function ShopPage() {
    const products = await getProducts();
    // const categories = await getCategories(); // Removed in favor of static config

    return (
        <div className="min-h-screen bg-white pt-8 pb-20">
            <div className="max-w-screen-2xl mx-auto px-6 space-y-12">
                {/* Header */}
                <div className="flex flex-col items-center text-center space-y-4">
                    <span className="text-xs uppercase tracking-[0.3em] text-stone-500">הקולקציה המלאה</span>
                    <h1 className="font-serif text-5xl md:text-6xl text-stone-900">חנות הפרחים</h1>
                    <p className="font-light text-stone-500 max-w-lg mx-auto">
                        בחרו את הזר המושלם עבורכם, או פנקו מישהו אהוב במשלוח טרי ומרגש.
                    </p>
                </div>



                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
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

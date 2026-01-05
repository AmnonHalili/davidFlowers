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

    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            <div className="max-w-screen-2xl mx-auto px-6 space-y-12">
                {/* Header */}
                <div className="flex flex-col items-center text-center space-y-4">
                    <span className="text-xs uppercase tracking-[0.3em] text-stone-500">הקולקציה המלאה</span>
                    <h1 className="font-serif text-5xl md:text-6xl text-stone-900">חנות הפרחים</h1>
                    <p className="font-light text-stone-500 max-w-lg mx-auto">
                        בחרו את הזר המושלם עבורכם, או פנקו מישהו אהוב במשלוח טרי ומרגש.
                    </p>
                </div>

                {/* Filters */}
                {/* 
                    Design Note: We use a relative container for the border, 
                    and the scrollable area sits on top with proper padding.
                */}
                <div className="relative">
                    {/* Bottom border line */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-stone-100" />

                    {/* Scrollable list */}
                    <div className="flex justify-start md:justify-center gap-8 overflow-x-auto scrollbar-hide pb-0 mask-gradient" style={{ WebkitMaskImage: 'linear-gradient(to left, black 90%, transparent 100%)' }}>
                        {['הכל', 'זרים לשבת', 'אירועים', 'רומנטיקה', 'צמחים'].map((filter, i) => {
                            const isActive = i === 0;
                            return (
                                <button
                                    key={filter}
                                    className={`
                                   relative pb-4 text-sm tracking-wide transition-colors whitespace-nowrap z-10
                                   ${isActive ? 'text-stone-900 font-medium' : 'text-stone-400 hover:text-stone-900'}
                                 `}
                                >
                                    {filter}
                                    {/* Active Indicator Line */}
                                    {isActive && (
                                        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-stone-900" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                    {products.map((product) => {
                        // Safe check for image
                        const mainImage = product.images.length > 0
                            ? product.images.find(img => img.isMain)?.url || product.images[0].url
                            : 'https://images.unsplash.com/photo-1596627006880-6029968434d3?auto=format&fit=crop&q=80';

                        // Safe check for category
                        const categoryName = product.categories.length > 0 ? product.categories[0].name : '';

                        return (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                price={`₪${Number(product.price).toFixed(2)}`}
                                image={mainImage}
                                slug={product.slug}
                                category={categoryName}
                                stock={product.stock}
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

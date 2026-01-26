import { PrismaClient } from '@prisma/client';
import ProductCard from '@/components/shop/ProductCard';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const prisma = new PrismaClient();

async function getCategory(slug: string) {
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
}

async function getAllCategories() {
    return await prisma.category.findMany({
        orderBy: { name: 'asc' }
    });
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
    const category = await getCategory(params.category);
    const allCategories = await getAllCategories();

    if (!category) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            <div className="max-w-screen-2xl mx-auto px-6 space-y-12">
                {/* Header */}
                <div className="flex flex-col items-center text-center space-y-4">
                    <span className="text-xs uppercase tracking-[0.3em] text-stone-500">קולקציית</span>
                    <h1 className="font-serif text-5xl md:text-6xl text-stone-900">{category.name}</h1>
                    <p className="font-light text-stone-500 max-w-lg mx-auto">
                        מוצרים נבחרים מקטגוריית {category.name}, מעוצבים באהבה.
                    </p>
                </div>

                {/* Filters (Nav) */}
                <div className="relative">
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-stone-100" />
                    <div className="flex justify-start md:justify-center gap-8 overflow-x-auto scrollbar-hide pb-0 mask-gradient" style={{ WebkitMaskImage: 'linear-gradient(to left, black 90%, transparent 100%)' }}>

                        {/* "All" Link */}
                        <Link
                            href="/shop"
                            className="relative pb-4 text-sm tracking-wide transition-colors whitespace-nowrap z-10 text-stone-400 hover:text-stone-900"
                        >
                            הכל
                        </Link>

                        {/* Categories */}
                        {allCategories.map((cat) => {
                            const isActive = cat.slug === category.slug;
                            return (
                                <Link
                                    key={cat.id}
                                    href={`/shop/${cat.slug}`}
                                    className={`
                                   relative pb-4 text-sm tracking-wide transition-colors whitespace-nowrap z-10
                                   ${isActive ? 'text-stone-900 font-medium' : 'text-stone-400 hover:text-stone-900'}
                                 `}
                                >
                                    {cat.name}
                                    {isActive && (
                                        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-stone-900" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                    {category.products.map((product: any) => {
                        const mainImage = product.images.length > 0
                            ? product.images.find(img => img.isMain)?.url || product.images[0].url
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

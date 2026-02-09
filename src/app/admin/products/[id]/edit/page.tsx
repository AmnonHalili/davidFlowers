import { PrismaClient } from '@prisma/client';
import { updateProduct } from '@/app/actions/product-actions';
import { UploadCloud, ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';
import EditProductForm from './EditProductForm';

const prisma = new PrismaClient();

export default async function EditProductPage({ params }: { params: { id: string } }) {
    const [product, categories] = await Promise.all([
        prisma.product.findUnique({
            where: { id: params.id },
            include: { images: true, categories: true }
        }),
        prisma.category.findMany({
            orderBy: { name: 'asc' },
            select: { id: true, name: true, slug: true }
        })
    ]);

    if (!product) {
        notFound();
    }

    return (
        <div className="p-4 md:p-10 max-w-4xl mx-auto pb-32 md:pb-10">
            <div className="mb-8">
                <Link
                    href="/admin/products"
                    className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors mb-4 group"
                >
                    <ArrowRight className="w-4 h-4 group-hover:-mr-1 transition-all" />
                    <span>חזרה לרשימת המוצרים</span>
                </Link>
                <h1 className="text-3xl font-bold text-stone-900">עריכת מוצר</h1>
                <p className="text-stone-500 mt-2">עדכון פרטי מוצר: {product.name}</p>
            </div>

            {/* Normalize product to handle Decimal serialization */}
            <EditProductForm
                product={{
                    ...product,
                    price: Number(product.price),
                    salePrice: product.salePrice ? Number(product.salePrice) : null,
                    stock: Number(product.stock)
                }}
                availableCategories={categories}
            />
        </div>
    );
}

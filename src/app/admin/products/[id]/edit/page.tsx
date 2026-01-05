import { PrismaClient } from '@prisma/client';
import { updateProduct } from '@/app/actions/product-actions';
import { UploadCloud, ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';
import EditProductForm from './EditProductForm';

const prisma = new PrismaClient();

export default async function EditProductPage({ params }: { params: { id: string } }) {
    const product = await prisma.product.findUnique({
        where: { id: params.id },
        include: { images: true, categories: true }
    });

    if (!product) {
        notFound();
    }

    return (
        <div className="p-10 max-w-3xl mx-auto">
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

            <EditProductForm product={product} />
        </div>
    );
}

import { PrismaClient } from '@prisma/client';
import { updateProduct } from '@/app/actions/product-actions';
import { UploadCloud, ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function EditProductPage({ params }: { params: { id: string } }) {
    const product = await prisma.product.findUnique({
        where: { id: params.id },
        include: { images: true, categories: true }
    });

    if (!product) {
        notFound();
    }

    const updateProductWithId = updateProduct.bind(null, product.id);

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

            <form action={updateProductWithId} className="bg-white p-8 rounded-lg border border-stone-200 shadow-sm space-y-8">

                {/* Basic Info */}
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-900">שם המוצר</label>
                            <input name="name" type="text" required defaultValue={product.name} className="w-full text-right p-3 border border-stone-200 rounded-md focus:ring-1 focus:ring-stone-900 outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-stone-900">מחיר (₪)</label>
                                <input name="price" type="number" required defaultValue={product.price.toString()} step="0.01" className="w-full text-right p-3 border border-stone-200 rounded-md focus:ring-1 focus:ring-stone-900 outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-stone-900">מלאי</label>
                                <input name="stock" type="number" required defaultValue={product.stock} min="0" className="w-full text-right p-3 border border-stone-200 rounded-md focus:ring-1 focus:ring-stone-900 outline-none" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-900">תיאור מלא</label>
                        <textarea name="description" required defaultValue={product.description} rows={4} className="w-full text-right p-3 border border-stone-200 rounded-md focus:ring-1 focus:ring-stone-900 outline-none resize-none" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-900">קטגוריה (לקריאה בלבד כרגע)</label>
                        <input disabled value={product.categories[0]?.name || ''} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-md outline-none text-stone-500 cursor-not-allowed" />
                    </div>
                </div>

                {/* Image Upload (Mock) */}
                <div className="space-y-4 pt-6 border-t border-stone-100">
                    <label className="text-sm font-medium text-stone-900 block">תמונת מוצר</label>

                    <div className="flex items-center gap-4">
                        <input
                            name="imageUrl"
                            type="url"
                            required
                            defaultValue={product.images[0]?.url || "https://images.unsplash.com/photo-1596627006880-6029968434d3?auto=format&fit=crop&q=80"}
                            className="flex-1 p-3 text-sm text-stone-500 bg-stone-50 border border-stone-200 rounded-md font-mono ltr"
                        />
                        <div className="w-12 h-12 bg-stone-100 rounded-lg flex items-center justify-center border border-dashed border-stone-300">
                            <UploadCloud className="w-5 h-5 text-stone-400" />
                        </div>
                    </div>
                </div>

                <div className="pt-6">
                    <button type="submit" className="w-full bg-stone-900 text-white py-4 font-medium rounded-lg hover:bg-stone-800 transition-all shadow-lg active:scale-[0.98]">
                        שמור שינויים
                    </button>
                </div>
            </form>
        </div>
    );
}

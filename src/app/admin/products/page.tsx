import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { Plus, Search } from 'lucide-react';
import ProductRowActions from '@/components/admin/ProductRowActions';

const prisma = new PrismaClient();

export default async function ProductsPage() {
    const products = await prisma.product.findMany({
        include: {
            categories: true,
            images: true,
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="p-10 max-w-7xl mx-auto space-y-8">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">ניהול מוצרים</h1>
                    <p className="text-stone-500 mt-2">צפייה וניהול קטלוג הזרים ({products.length} מוצרים)</p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="bg-stone-900 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-stone-800 transition-colors shadow-lg shadow-stone-200"
                >
                    <Plus className="w-5 h-5" />
                    <span>הוסף מוצר חדש</span>
                </Link>
            </div>

            {/* Filter / Search Bar (Visual only for now) */}
            <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-sm flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                        type="text"
                        placeholder="חיפוש לפי שם זר..."
                        className="w-full pr-10 pl-4 py-2 bg-stone-50 border-none rounded-md focus:ring-1 focus:ring-stone-900 text-sm"
                    />
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg border border-stone-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]"> {/* Min width ensures columns don't squash */}
                        <thead className="bg-stone-50 border-b border-stone-200">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-bold text-stone-500 uppercase tracking-wider">מוצר</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-stone-500 uppercase tracking-wider">קטגוריה</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-stone-500 uppercase tracking-wider">מחיר</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-stone-500 uppercase tracking-wider">מלאי</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-stone-500 uppercase tracking-wider">סטטוס</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-stone-500 uppercase tracking-wider">פעולות</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {products.map((product) => (
                                <tr key={product.id} className="group hover:bg-stone-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-100">
                                                {product.images[0]?.url && (
                                                    <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-stone-900">{product.name}</div>
                                                <div className="text-xs text-stone-400">/{product.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {product.categories.map(c => (
                                            <span key={c.id} className="inline-block bg-stone-100 text-stone-600 text-xs px-2 py-1 rounded-full mr-1">
                                                {c.name}
                                            </span>
                                        ))}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-sm">
                                        ₪{Number(product.price).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock === 0 ? 'bg-red-50 text-red-700' :
                                                product.stock < 5 ? 'bg-amber-50 text-amber-700' :
                                                    'bg-stone-50 text-stone-600'
                                            }`}>
                                            {product.stock} יח'
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'
                                                }`} />
                                            {product.stock > 0 ? 'במלאי' : 'אזל'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <ProductRowActions productId={product.id} />
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-stone-400">
                                        לא נמצאו מוצרים. זה הזמן להוסיף את הזר הראשון!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

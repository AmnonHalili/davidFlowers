import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { Plus } from 'lucide-react';
import ProductRowActions from '@/components/admin/ProductRowActions';
import ProductRow from '@/components/admin/ProductRow';
import SearchInput from '@/components/admin/SearchInput';

const prisma = new PrismaClient();

export default async function ProductsPage({
    searchParams,
}: {
    searchParams?: {
        search?: string;
    };
}) {
    const query = searchParams?.search || '';

    const products = await prisma.product.findMany({
        where: {
            name: {
                contains: query,
                mode: 'insensitive',
            },
        },
        include: {
            categories: true,
            images: true,
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-24 md:pb-0">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-stone-900">ניהול מוצרים</h1>
                    <p className="text-sm md:text-base text-stone-500 mt-1 md:mt-2">צפייה וניהול קטלוג הזרים ({products.length} מוצרים)</p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="w-full md:w-auto bg-stone-900 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors shadow-lg shadow-stone-200"
                >
                    <Plus className="w-5 h-5" />
                    <span>הוסף מוצר חדש</span>
                </Link>
            </div>

            {/* Filter / Search Bar */}
            <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-sm">
                <SearchInput />
            </div>

            {/* Desktop: Products Table */}
            <div className="hidden md:block bg-white rounded-lg border border-stone-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
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
                                <ProductRow key={product.id} productId={product.id}>
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
                                </ProductRow>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile: Products Cards */}
            <div className="md:hidden space-y-4">
                {products.map((product) => (
                    <div key={product.id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-start gap-4">
                        <Link href={`/admin/products/${product.id}/edit`} className="flex items-start gap-4 flex-1 min-w-0 group">
                            {/* Image */}
                            <div className="w-20 h-20 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-100 relative">
                                {product.images[0]?.url ? (
                                    <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-stone-300 bg-stone-50">
                                        <span className="text-xs">אין תמונה</span>
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <div>
                                    <h3 className="font-bold text-stone-900 text-lg leading-tight group-hover:text-david-green transition-colors">{product.name}</h3>
                                    <p className="text-xs text-stone-400 mt-0.5">/{product.slug}</p>
                                </div>

                                <div className="mt-3 flex items-center flex-wrap gap-2">
                                    <span className="font-mono font-bold text-stone-900">₪{Number(product.price).toFixed(2)}</span>
                                    <span className="text-stone-300">|</span>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${product.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                        {product.stock > 0 ? 'במלאי' : 'אזל'} ({product.stock})
                                    </span>
                                </div>

                                {product.categories.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {product.categories.map(c => (
                                            <span key={c.id} className="bg-stone-50 text-stone-500 text-[10px] px-1.5 py-0.5 rounded">
                                                {c.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Link>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 pt-1 border-r border-stone-100 pr-4 mr-1">
                            <ProductRowActions productId={product.id} />
                        </div>
                    </div>
                ))}
            </div>

            {products.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg border border-stone-200">
                    <p className="text-stone-400">לא נמצאו מוצרים. זה הזמן להוסיף את הזר הראשון!</p>
                </div>
            )}

        </div>
    );
}

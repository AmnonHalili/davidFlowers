'use client';

import { Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { deleteProduct } from '@/app/actions/product-actions';

// This is a client component to handle interactions
export default function ProductRowActions({ productId }: { productId: string }) {
    return (
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link href={`/admin/products/${productId}/edit`} className="p-2 text-stone-400 hover:text-stone-900 hover:bg-white rounded-lg border border-transparent hover:border-stone-200 transition-all">
                <Edit className="w-4 h-4" />
            </Link>

            <form action={deleteProduct}>
                <input type="hidden" name="productId" value={productId} />
                <button type="submit" className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all">
                    <Trash2 className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}

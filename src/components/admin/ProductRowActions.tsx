'use client';

import { useState, useTransition } from 'react';
import { Edit, Trash2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { deleteProduct } from '@/app/actions/product-actions';
import Modal from '@/components/ui/Modal';

export default function ProductRowActions({ productId }: { productId: string }) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent row click
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        const formData = new FormData();
        formData.append('productId', productId);

        startTransition(async () => {
            await deleteProduct(formData);
            setIsDeleteModalOpen(false);
        });
    };

    return (
        <>
            <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <Link
                    href={`/admin/products/${productId}/edit`}
                    className="p-2 text-stone-400 hover:text-stone-900 hover:bg-white rounded-lg border border-transparent hover:border-stone-200 transition-all"
                    onClick={(e) => e.stopPropagation()} // Prevent row click bubbling
                >
                    <Edit className="w-4 h-4" />
                </Link>

                <button
                    onClick={handleDeleteClick}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="מחיקת מוצר"
                isDestructive={true}
                footer={
                    <>
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                            disabled={isPending}
                        >
                            ביטול
                        </button>
                        <button
                            onClick={handleConfirmDelete}
                            disabled={isPending}
                            className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                        >
                            {isPending ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    מוחק...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    מחק מוצר
                                </>
                            )}
                        </button>
                    </>
                }
            >
                <div className="flex flex-col items-center text-center p-4">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h4 className="text-xl font-bold text-stone-900 mb-2">אתה בטוח שברצונך למחוק?</h4>
                    <p className="text-stone-500 max-w-xs mx-auto">
                        פעולה זו תמחק את המוצר מהחנות לצמיתות ולא ניתן יהיה לשחזר אותו.
                    </p>
                </div>
            </Modal>
        </>
    );
}


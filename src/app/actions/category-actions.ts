'use server';

import prisma from '@/lib/prisma';
import { DiscountType } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function getCategoriesWithPromotions() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: [
                { order: 'asc' },
                { name: 'asc' }
            ],
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });
        return { success: true, categories };
    } catch (error) {
        console.error('Error fetching categories:', error);
        return { success: false, error: 'Failed to fetch categories' };
    }
}

export type CategoryPromotionData = {
    discountType: DiscountType | null;
    discountAmount: number;
    discountEndDate: Date | null;
    isSaleActive: boolean;
    isHidden?: boolean;
};

export async function updateCategoryPromotion(id: string, data: CategoryPromotionData) {
    try {
        await prisma.category.update({
            where: { id },
            data: {
                discountType: data.discountType || 'PERCENTAGE', // Ensure type is set if missing
                discountAmount: data.discountAmount || 0, // Ensure no nulls/NaNs get through
                discountEndDate: data.discountEndDate,
                isSaleActive: data.isSaleActive,
            },
        });

        revalidatePath('/admin/categories');
        revalidatePath('/'); // Revalidate home as prices might change
        return { success: true };
    } catch (error) {
        console.error('Error updating category promotion:', error);
        return { success: false, error: 'Failed to update promotion' };
    }
}

export async function createCategory(name: string) {
    try {
        const slug = name.trim().toLowerCase().replace(/\s+/g, '-');

        // Get the current max order to place the new category at the end
        const maxOrderCategory = await prisma.category.findFirst({
            orderBy: { order: 'desc' },
            select: { order: true }
        });

        const nextOrder = (maxOrderCategory?.order ?? -1) + 1;

        const category = await prisma.category.create({
            data: {
                name,
                slug: slug || `cat-${Date.now()}`, // Fallback
                order: nextOrder
            },
        });
        revalidatePath('/admin/categories');
        return { success: true, category };
    } catch (error) {
        console.error('Error creating category:', error);
        return { success: false, error: 'Failed to create category' };
    }
}

export async function updateCategoriesOrder(categoryOrders: { id: string; order: number }[]) {
    try {
        // Use a transaction to update all orders
        await prisma.$transaction(
            categoryOrders.map((cat) =>
                prisma.category.update({
                    where: { id: cat.id },
                    data: { order: cat.order },
                })
            )
        );

        revalidatePath('/admin/categories');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error updating category orders:', error);
        return { success: false, error: 'Failed to update category order' };
    }
}

export async function updateCategoryDetails(id: string, name: string, isHidden?: boolean) {
    try {
        await prisma.category.update({
            where: { id },
            data: {
                name,
                ...(isHidden !== undefined && { isHidden })
            }
        });

        revalidatePath('/admin/categories');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error updating category details:', error);
        return { success: false, error: 'Failed to update category' };
    }
}

export async function deleteCategory(id: string) {
    try {
        await prisma.category.delete({
            where: { id }
        });

        revalidatePath('/admin/categories');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error deleting category:', error);
        return { success: false, error: 'Failed to delete category. Ensure it has no products.' };
    }
}

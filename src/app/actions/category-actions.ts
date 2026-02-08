'use server';

import prisma from '@/lib/prisma';
import { DiscountType } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function getCategoriesWithPromotions() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' },
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
        // Simple slug generation for Hebrew support (might need better logic if hebrew strings)
        // Actually, slug usually needs to be english for URLs. 
        // If user enters Hebrew name, we might need an English slug or just use ID?
        // Let's try to keep it simple: Use a random ID if slug can't be generated, or just use the name if it's english.
        // Better: Allow user to provide slug, or auto-generate.
        // For this MVP, let's assume we use a simple transliteration or just ID-based slug if empty.
        // Let's just use the name as slug for now, but encoded.

        const slug = name.trim().toLowerCase().replace(/\s+/g, '-');

        const category = await prisma.category.create({
            data: {
                name,
                slug: slug || `cat-${Date.now()}`, // Fallback
            },
        });
        revalidatePath('/admin/categories');
        return { success: true, category };
    } catch (error) {
        console.error('Error creating category:', error);
        return { success: false, error: 'Failed to create category' };
    }
}

export async function updateCategoryDetails(id: string, name: string) {
    try {
        await prisma.category.update({
            where: { id },
            data: { name }
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

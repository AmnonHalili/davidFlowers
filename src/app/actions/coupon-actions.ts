'use server';

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma'; // Use singleton
import { revalidatePath } from 'next/cache';
import { DiscountType } from '@prisma/client';

// --- Admin Actions ---

export async function createCoupon(data: {
    code: string;
    discountType: DiscountType;
    discountAmount: number;
    usageLimit?: number | null;
    validUntil?: Date | null;
}) {
    // Basic admin check
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    try {
        const uppercaseCode = data.code.trim().toUpperCase();

        if (!uppercaseCode) {
            return { success: false, error: 'Code is required' };
        }

        const existing = await prisma.coupon.findUnique({
            where: { code: uppercaseCode }
        });

        if (existing) {
            return { success: false, error: 'Coupon code already exists' };
        }

        await prisma.coupon.create({
            data: {
                code: uppercaseCode,
                discountType: data.discountType,
                discountAmount: data.discountAmount,
                usageLimit: data.usageLimit ?? null,
                validUntil: data.validUntil ?? null,
            }
        });

        revalidatePath('/admin/coupons');
        return { success: true };
    } catch (error) {
        console.error('Create coupon error:', error);
        return {
            success: false,
            error: error instanceof Error ? `Database error: ${error.message}` : 'Failed to create coupon'
        };
    }
}

export async function getCoupons() {
    // Admin check
    const { userId } = await auth();
    if (!userId) return [];

    try {
        return await prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        return [];
    }
}

export async function deleteCoupon(id: string) {
    // Admin check
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    try {
        await prisma.coupon.delete({ where: { id } });
        revalidatePath('/admin/coupons');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed' };
    }
}

// --- Public Actions ---

export async function validateCoupon(code: string, cartTotal: number) {
    if (!code) return { success: false, error: 'Empty code' };

    try {
        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!coupon) {
            return { success: false, error: 'קופון לא קיים' };
        }

        if (!coupon.isActive) {
            return { success: false, error: 'הקופון אינו פעיל' };
        }

        if (coupon.validUntil && new Date() > coupon.validUntil) {
            return { success: false, error: 'פג תוקף הקופון' };
        }

        if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
            return { success: false, error: 'הקופון הגיע למכסת השימוש' };
        }

        // Calculate Discount
        let discountAmount = 0;
        if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = (cartTotal * Number(coupon.discountAmount)) / 100;
        } else {
            discountAmount = Number(coupon.discountAmount);
        }

        // Ensure discount doesn't exceed total
        discountAmount = Math.min(discountAmount, cartTotal);

        return {
            success: true,
            couponId: coupon.id,
            code: coupon.code,
            discountAmount,
            discountType: coupon.discountType,
            discountValue: Number(coupon.discountAmount)
        };

    } catch (error) {
        console.error('Validate coupon error:', error);
        return { success: false, error: 'שגיאה בבדיקת הקופון' };
    }
}

'use server';

import prisma from '@/lib/prisma';
import { ReviewStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function createReview(data: {
    productId: string;
    rating: number;
    content: string;
    userName?: string;
    userImage?: string;
    userId?: string; // This is the Clerk ID from the frontend
    images?: string[];
}) {
    try {
        let dbUserId: string | undefined = undefined;
        let isVerified = false;

        // If a Clerk ID is provided, find the corresponding database user record
        if (data.userId) {
            const user = await prisma.user.findUnique({
                where: { clerkId: data.userId },
                select: { id: true }
            });

            if (user) {
                dbUserId = user.id;

                // Check if verified purchase
                const purchase = await prisma.order.findFirst({
                    where: {
                        userId: dbUserId,
                        status: 'PAID',
                        items: {
                            some: {
                                productId: data.productId
                            }
                        }
                    }
                });
                if (purchase) isVerified = true;
            }
        }

        const review = await prisma.review.create({
            data: {
                productId: data.productId,
                rating: data.rating,
                content: data.content,
                userName: data.userName,
                userImage: data.userImage,
                userId: dbUserId, // Use the database cuid, or null if guest
                isVerified,
                status: 'APPROVED',
                images: {
                    create: data.images?.map(url => ({ url }))
                }
            }
        });

        revalidatePath(`/product/${data.productId}`);
        return { success: true, review };
    } catch (error) {
        console.error('Error creating review:', error);
        return { success: false, error: 'Failed to submit review' };
    }
}

export async function getProductReviews(productId: string) {
    try {
        const reviews = await prisma.review.findMany({
            where: {
                productId,
                status: 'APPROVED'
            },
            include: {
                images: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return { success: true, reviews };
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return { success: false, error: 'Failed to fetch reviews' };
    }
}

/**
 * Calculates how many people bought this product in the last X days
 */
export async function getRecentPurchaseCount(productId: string, days: number = 7) {
    try {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);

        const count = await prisma.orderItem.count({
            where: {
                productId,
                order: {
                    status: {
                        in: ['PAID', 'SHIPPED', 'DELIVERED']
                    },
                    createdAt: {
                        gte: dateLimit
                    }
                }
            }
        });

        return { success: true, count };
    } catch (error) {
        console.error('Error fetching purchase count:', error);
        return { success: false, count: 0 };
    }
}

export async function getProductRatingSummary(productId: string) {
    try {
        const aggregate = await prisma.review.aggregate({
            where: {
                productId,
                status: 'APPROVED'
            },
            _avg: {
                rating: true
            },
            _count: {
                rating: true
            }
        });

        return {
            success: true,
            averageRating: aggregate._avg.rating || 0,
            totalReviews: aggregate._count.rating || 0
        };
    } catch (error) {
        console.error('Error fetching rating summary:', error);
        return { success: false, averageRating: 0, totalReviews: 0 };
    }
}

export async function getAllReviews() {
    try {
        const reviews = await prisma.review.findMany({
            include: {
                images: true,
                product: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return { success: true, reviews };
    } catch (error) {
        console.error('Error fetching all reviews:', error);
        return { success: false, error: 'Failed to fetch reviews' };
    }
}

export async function updateReviewStatus(reviewId: string, status: 'APPROVED' | 'REJECTED' | 'PENDING') {
    try {
        const review = await prisma.review.update({
            where: { id: reviewId },
            data: { status }
        });

        revalidatePath('/admin/reviews');
        if (review.productId) {
            revalidatePath(`/product/id/${review.productId}`);
        }

        return { success: true, review };
    } catch (error) {
        console.error('Error updating review status:', error);
        return { success: false, error: 'Failed to update review status' };
    }
}

export async function deleteReview(reviewId: string) {
    try {
        await prisma.review.delete({
            where: { id: reviewId }
        });

        revalidatePath('/admin/reviews');
        return { success: true };
    } catch (error) {
        console.error('Error deleting review:', error);
        return { success: false, error: 'Failed to delete review' };
    }
}

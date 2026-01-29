'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { CATEGORIES, getCategoryName } from '@/lib/categories';

export async function createProduct(formData: FormData) {
    const name = formData.get('name') as string;
    let price = parseFloat(formData.get('price') as string);
    const stock = parseInt(formData.get('stock') as string) || 0;
    const description = formData.get('description') as string;
    const imageUrl = formData.get('imageUrl') as string;

    // Sale Fields
    const salePriceStr = formData.get('salePrice') as string;
    const saleStartDateStr = formData.get('saleStartDate') as string;
    const saleEndDateStr = formData.get('saleEndDate') as string;

    const salePrice = salePriceStr ? parseFloat(salePriceStr) : null;
    const saleStartDate = saleStartDateStr ? new Date(saleStartDateStr) : null;
    const saleEndDate = saleEndDateStr ? new Date(saleEndDateStr) : null;

    // Scheduling Fields
    const availableFromStr = formData.get('availableFrom') as string;
    const allowPreorderStr = formData.get('allowPreorder') as string;

    const availableFrom = availableFromStr ? new Date(availableFromStr) : null;
    const allowPreorder = allowPreorderStr === 'on';

    // Handle multiple categories
    const categorySlugs = formData.getAll('categories') as string[];
    const validCategorySlugs = categorySlugs.filter(slug => slug !== '');

    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w\u0590-\u05FF-]+/g, '');

    // Subscription Logic
    const isSubscriptionEnabled = formData.get('isSubscriptionEnabled') === 'true';

    // Variations Logic
    const isVariablePriceStr = formData.get('isVariablePrice') as string;
    const isVariablePrice = isVariablePriceStr === 'true';
    const variationsStr = formData.get('variations') as string;
    const variations = variationsStr ? JSON.parse(variationsStr) : null;

    // If variable price is enabled, the main price input might be missing.
    // We infer the price from the variations (e.g. the lowest price) to satisfy the DB schema.
    if (isVariablePrice && variations) {
        const variationPrices = Object.values(variations)
            .map((v: any) => Number(v.price))
            .filter(p => !isNaN(p) && p > 0);

        if (variationPrices.length > 0) {
            price = Math.min(...variationPrices);
        } else {
            price = 0; // Fallback if no valid prices found
        }
    }

    await prisma.product.create({
        data: {
            name,
            slug: slug + '-' + Math.random().toString(36).substr(2, 4),
            description,
            price,
            stock,
            salePrice,
            saleStartDate,
            saleEndDate,
            availableFrom,
            allowPreorder,
            isSubscriptionEnabled,
            isVariablePrice,
            variations,
            categories: {
                connectOrCreate: validCategorySlugs.map(catSlug => ({
                    where: { slug: catSlug },
                    create: {
                        name: getCategoryName(catSlug),
                        slug: catSlug
                    }
                }))
            },
            images: {
                create: {
                    url: imageUrl,
                    alt: name,
                    isMain: true
                }
            }
        }
    });

    revalidatePath('/admin/products');
    revalidatePath('/shop');
    redirect('/admin/products');
}

export async function updateProduct(id: string, formData: FormData) {
    const name = formData.get('name') as string;
    let price = parseFloat(formData.get('price') as string);
    const stock = parseInt(formData.get('stock') as string) || 0;
    const description = formData.get('description') as string;
    const imageUrl = formData.get('imageUrl') as string;

    // Sale Fields
    const salePriceStr = formData.get('salePrice') as string;
    const saleStartDateStr = formData.get('saleStartDate') as string;
    const saleEndDateStr = formData.get('saleEndDate') as string;

    const salePrice = salePriceStr ? parseFloat(salePriceStr) : null;
    const saleStartDate = saleStartDateStr ? new Date(saleStartDateStr) : null;
    const saleEndDate = saleEndDateStr ? new Date(saleEndDateStr) : null;

    // Scheduling Fields
    const availableFromStr = formData.get('availableFrom') as string;
    const allowPreorderStr = formData.get('allowPreorder') as string;

    const availableFrom = availableFromStr ? new Date(availableFromStr) : null;
    const allowPreorder = allowPreorderStr === 'on';

    // Subscription Logic
    const isSubscriptionEnabled = formData.get('isSubscriptionEnabled') === 'true';

    // Variations Logic
    const isVariablePriceStr = formData.get('isVariablePrice') as string;
    const isVariablePrice = isVariablePriceStr === 'true';
    const variationsStr = formData.get('variations') as string;
    const variations = variationsStr ? JSON.parse(variationsStr) : null;

    // If variable price is enabled, the main price input might be missing.
    // We infer the price from the variations (e.g. the lowest price) to satisfy the DB schema.
    if (isVariablePrice && variations) {
        const variationPrices = Object.values(variations)
            .map((v: any) => Number(v.price))
            .filter(p => !isNaN(p) && p > 0);

        if (variationPrices.length > 0) {
            price = Math.min(...variationPrices);
        } else {
            price = 0; // Fallback if no valid prices found
        }
    }

    // Handle multiple categories
    const categorySlugs = formData.getAll('categories') as string[];
    const validCategorySlugs = categorySlugs.filter(slug => slug !== '');

    await prisma.product.update({
        where: { id },
        data: {
            name,
            description,
            price,
            stock,
            salePrice,
            saleStartDate,
            saleEndDate,
            availableFrom,
            allowPreorder,
            isSubscriptionEnabled,
            isVariablePrice,
            variations,
            categories: {
                set: [], // Disconnect all existing
                connectOrCreate: validCategorySlugs.map(catSlug => ({
                    where: { slug: catSlug },
                    create: {
                        name: getCategoryName(catSlug),
                        slug: catSlug
                    }
                }))
            },
            images: {
                deleteMany: {}, // brutally simple image update: clear and add new one
                create: {
                    url: imageUrl,
                    alt: name,
                    isMain: true
                }
            }
        }
    });

    revalidatePath('/admin/products');
    revalidatePath('/shop');
    redirect('/admin/products');
}

export async function deleteProduct(formData: FormData) {
    const productId = formData.get('productId') as string;

    // In a real app, delete images from cloud storage here first

    // 1. Delete associated images first
    await prisma.productImage.deleteMany({
        where: { productId }
    });

    // 2. Delete associated OrderItems (Warning: Removes item from historical orders)
    await prisma.orderItem.deleteMany({
        where: { productId }
    });

    // 3. Delete associated Subscriptions
    await prisma.subscription.deleteMany({
        where: { productId }
    });

    // 4. Delete the product
    await prisma.product.delete({
        where: { id: productId }
    });

    revalidatePath('/admin/products');
    revalidatePath('/shop');
}

export async function searchProducts(query: string) {
    if (!query || query.length < 2) return [];

    try {
        const products = await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                ]
            },
            take: 6,
            select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                salePrice: true,
                saleStartDate: true,
                saleEndDate: true,
                availableFrom: true,
                allowPreorder: true,
                stock: true,
                images: {
                    take: 1
                },
                categories: {
                    select: {
                        name: true
                    }
                }
            }
        });

        return products;
    } catch (error) {
        console.error('Error searching products:', error);
        return [];
    }
}

export async function getUpsellProducts() {
    try {
        const products = await prisma.product.findMany({
            where: {
                categories: {
                    some: {
                        slug: { in: ['add-ons', 'gifts', 'extras'] }
                    }
                },
                stock: { gt: 0 }
            },
            take: 6,
            include: {
                images: true
            }
        });

        return { success: true, products };
    } catch (error) {
        console.error('Error fetching upsell products:', error);
        return { success: false, products: [] };
    }
}

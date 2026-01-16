'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { CATEGORIES, getCategoryName } from '@/lib/categories';

const prisma = new PrismaClient();

export async function createProduct(formData: FormData) {
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const stock = parseInt(formData.get('stock') as string) || 0;
    const description = formData.get('description') as string;
    const categorySlug = formData.get('category') as string; // Check new Form uses 'category'
    const imageUrl = formData.get('imageUrl') as string;

    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w\u0590-\u05FF-]+/g, '');
    const categoryName = getCategoryName(categorySlug);

    await prisma.product.create({
        data: {
            name,
            slug: slug + '-' + Math.random().toString(36).substr(2, 4),
            description,
            price,
            stock,
            categories: {
                connectOrCreate: {
                    where: { slug: categorySlug },
                    create: {
                        name: categoryName,
                        slug: categorySlug
                    }
                }
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
    const price = parseFloat(formData.get('price') as string);
    const stock = parseInt(formData.get('stock') as string) || 0;
    const description = formData.get('description') as string;
    const imageUrl = formData.get('imageUrl') as string;
    const categorySlug = formData.get('category') as string;
    const categoryName = getCategoryName(categorySlug);

    await prisma.product.update({
        where: { id },
        data: {
            name,
            description,
            price,
            stock,
            categories: {
                set: [], // Disconnect all existing
                connectOrCreate: {
                    where: { slug: categorySlug },
                    create: {
                        name: categoryName,
                        slug: categorySlug
                    }
                }
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

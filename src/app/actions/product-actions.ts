'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

export async function createProduct(formData: FormData) {
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const stock = parseInt(formData.get('stock') as string) || 0;
    const description = formData.get('description') as string;
    const categoryName = formData.get('category') as string;
    const imageUrl = formData.get('imageUrl') as string;

    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w\u0590-\u05FF-]+/g, '');

    await prisma.product.create({
        data: {
            name,
            slug: slug + '-' + Math.random().toString(36).substr(2, 4),
            description,
            price,
            stock,
            categories: {
                connectOrCreate: {
                    where: { name: categoryName },
                    create: { name: categoryName, slug: categoryName }
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
    // Note: Updating category is more complex with Prisma (disconnect/connect), skipping for this MVP iteration unless requested.

    await prisma.product.update({
        where: { id },
        data: {
            name, // slug usually doesn't change to preserve SEO
            description,
            price,
            stock,
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

    await prisma.product.delete({
        where: { id: productId }
    });

    revalidatePath('/admin/products');
    revalidatePath('/shop');
}

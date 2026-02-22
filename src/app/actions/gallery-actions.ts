'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getGalleryImages() {
    return await prisma.galleryImage.findMany({
        where: { isVisible: true },
        orderBy: { takenAt: 'desc' },
        take: 20,
    });
}

export async function getAllGalleryImages() {
    return await prisma.galleryImage.findMany({
        orderBy: { takenAt: 'desc' },
    });
}

export async function addGalleryImage(data: { url: string; caption?: string }) {
    const image = await prisma.galleryImage.create({
        data: {
            url: data.url,
            caption: data.caption || null,
            takenAt: new Date(),
        },
    });
    revalidatePath('/');
    revalidatePath('/admin/gallery');
    return { success: true, image };
}

export async function toggleGalleryImageVisibility(id: string) {
    const current = await prisma.galleryImage.findUnique({ where: { id } });
    if (!current) return { success: false };

    const updated = await prisma.galleryImage.update({
        where: { id },
        data: { isVisible: !current.isVisible },
    });
    revalidatePath('/');
    revalidatePath('/admin/gallery');
    return { success: true, image: updated };
}

export async function deleteGalleryImage(id: string) {
    await prisma.galleryImage.delete({ where: { id } });
    revalidatePath('/');
    revalidatePath('/admin/gallery');
    return { success: true };
}

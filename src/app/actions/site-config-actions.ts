'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import prisma from '@/lib/prisma';

export async function getSiteConfig(key: string) {
    try {
        const config = await prisma.siteConfig.findUnique({
            where: { key },
        });
        return config ? (config.value as any) : null;
    } catch (error) {
        console.error(`Error fetching site config for key ${key}:`, error);
        return null;
    }
}

export async function updateSiteConfig(key: string, value: any) {
    try {
        await prisma.siteConfig.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        });
        revalidatePath('/');
        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error) {
        console.error(`Error updating site config for key ${key}:`, error);
        return { success: false, error: 'Failed to update configuration' };
    }
}

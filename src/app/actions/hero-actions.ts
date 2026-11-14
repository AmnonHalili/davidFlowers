'use server';

import { requireAdmin } from '@/lib/admin-auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { DEFAULT_HERO_CONFIG, HeroConfig } from '@/types/hero';

const HERO_CONFIG_KEY = 'hero_media_config';

/**
 * Fetch the current hero configuration from the database.
 * Falls back to DEFAULT_HERO_CONFIG if not yet configured.
 */
export async function getHeroConfig(): Promise<HeroConfig> {
    try {
        const configRecord = await prisma.siteConfig.findUnique({
            where: { key: HERO_CONFIG_KEY },
        });

        if (!configRecord || !configRecord.value) {
            return DEFAULT_HERO_CONFIG;
        }

        const value = configRecord.value as unknown as Partial<HeroConfig>;

        return {
            mode: value.mode === 'IMAGE' ? 'IMAGE' : 'VIDEO',
            items: Array.isArray(value.items) && value.items.length > 0 ? value.items : DEFAULT_HERO_CONFIG.items,
            slideInterval: typeof value.slideInterval === 'number' ? value.slideInterval : DEFAULT_HERO_CONFIG.slideInterval,
            transitionEffect: value.transitionEffect || DEFAULT_HERO_CONFIG.transitionEffect,
            slideDirection: value.slideDirection || DEFAULT_HERO_CONFIG.slideDirection,
            showDots: typeof value.showDots === 'boolean' ? value.showDots : DEFAULT_HERO_CONFIG.showDots,
            showArrows: typeof value.showArrows === 'boolean' ? value.showArrows : DEFAULT_HERO_CONFIG.showArrows,
            overlayOpacity: typeof value.overlayOpacity === 'number' ? value.overlayOpacity : DEFAULT_HERO_CONFIG.overlayOpacity,
            enableParallaxPetal: typeof value.enableParallaxPetal === 'boolean' ? value.enableParallaxPetal : DEFAULT_HERO_CONFIG.enableParallaxPetal,
            badgeText: typeof value.badgeText === 'string' ? value.badgeText : DEFAULT_HERO_CONFIG.badgeText,
        };
    } catch (error) {
        console.error('Error fetching hero config:', error);
        return DEFAULT_HERO_CONFIG;
    }
}

/**
 * Update the hero configuration (Admin only).
 */
export async function updateHeroConfig(newConfig: Partial<HeroConfig>) {
    await requireAdmin();

    try {
        // Sanitize and ensure valid items
        const currentConfig = await getHeroConfig();
        const mergedConfig: HeroConfig = {
            ...currentConfig,
            ...newConfig,
            items: newConfig.items && newConfig.items.length > 0 ? newConfig.items : currentConfig.items,
        };

        await prisma.siteConfig.upsert({
            where: { key: HERO_CONFIG_KEY },
            update: { value: mergedConfig as any },
            create: { key: HERO_CONFIG_KEY, value: mergedConfig as any },
        });

        // Invalidate public and admin paths
        revalidatePath('/');
        revalidatePath('/admin');
        revalidatePath('/admin/hero');
        revalidatePath('/admin/settings');

        return { success: true, config: mergedConfig };
    } catch (error: any) {
        console.error('Error updating hero config:', error);
        return { success: false, error: error?.message || 'שגיאה בעדכון הגדרות ה-Hero' };
    }
}

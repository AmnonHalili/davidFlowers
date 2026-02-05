import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://davidflowers.co.il';

    // Fetch all products
    const products = await prisma.product.findMany({
        select: { slug: true, updatedAt: true }
    });

    // Fetch all categories
    const categories = await prisma.category.findMany({
        select: { slug: true, updatedAt: true }
    });

    const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
        url: `${baseUrl}/product/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
    }));

    const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
        url: `${baseUrl}/category/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/shop`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/deliveries`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ];

    return [...staticRoutes, ...categoryEntries, ...productEntries];
}

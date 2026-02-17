import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORIES_TO_RESTORE = [
    { slug: 'bouquets', name: 'זרי פרחים' },
    { slug: 'plants', name: 'עציצים' },
    { slug: 'gifts', name: 'מתנות ומתוקים' },
    { slug: 'chocolates', name: 'שוקולדים' },
    { slug: 'balloons', name: 'בלונים' },
    { slug: 'wedding', name: 'חתן וכלה' },
    { slug: 'vases', name: 'כלים ואגרטלים' },
    { slug: 'add-ons', name: 'תוספות (Upsells)' },
];

async function main() {
    console.log('Starting professional category restoration...');

    for (const cat of CATEGORIES_TO_RESTORE) {
        try {
            const result = await prisma.category.upsert({
                where: { slug: cat.slug },
                update: {
                    name: cat.name,
                    // If it exists, we ensure the name is correct (Hebrew)
                },
                create: {
                    name: cat.name,
                    slug: cat.slug,
                    isHidden: cat.slug === 'add-ons', // Hide upsells from navbar usually
                },
            });
            console.log(`✓ Restored category: ${cat.name} (${cat.slug})`);
        } catch (error) {
            console.error(`✗ Failed to restore ${cat.name}:`, error);
        }
    }

    console.log('Restoration completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

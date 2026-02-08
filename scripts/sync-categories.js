const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const CATEGORIES = [
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
    console.log('Starting category sync...');

    for (const cat of CATEGORIES) {
        const existing = await prisma.category.findUnique({
            where: { slug: cat.slug },
        });

        if (existing) {
            console.log(`Updating existing category: ${cat.name} (${cat.slug})`);
            await prisma.category.update({
                where: { slug: cat.slug },
                data: { name: cat.name },
            });
        } else {
            console.log(`Creating new category: ${cat.name} (${cat.slug})`);
            await prisma.category.create({
                data: {
                    name: cat.name,
                    slug: cat.slug,
                },
            });
        }
    }

    console.log('Sync complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

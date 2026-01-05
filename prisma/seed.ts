import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // 1. Create Categories
    const occasionCat = await prisma.category.upsert({
        where: { slug: 'by-occasion' },
        update: {},
        create: {
            name: 'By Occasion',
            slug: 'by-occasion',
        },
    });

    const flowersCat = await prisma.category.upsert({
        where: { slug: 'by-flower-type' },
        update: {},
        create: {
            name: 'By Flower Type',
            slug: 'by-flower-type',
        },
    });

    const anniversary = await prisma.category.upsert({
        where: { slug: 'anniversary' },
        update: {},
        create: {
            name: 'Anniversary',
            slug: 'anniversary',
            parentId: occasionCat.id,
        },
    });

    const peonies = await prisma.category.upsert({
        where: { slug: 'peonies' },
        update: {},
        create: {
            name: 'Peonies',
            slug: 'peonies',
            parentId: flowersCat.id,
        },
    });

    // 2. Create Products
    const noblePeony = await prisma.product.create({
        data: {
            name: 'The Noble Peony',
            slug: 'the-noble-peony',
            description: "A curated selection of the season's finest peonies, hand-tied with signature silk ribbons.",
            price: 85.00,
            images: {
                create: [
                    {
                        url: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=2000&auto=format&fit=crop',
                        alt: 'The Noble Peony Bouquet',
                        isMain: true,
                    }
                ]
            },
            categories: {
                connect: [
                    { id: peonies.id },
                    { id: anniversary.id }
                ]
            }
        }
    });

    const classicRose = await prisma.product.create({
        data: {
            name: 'Classic White Roses',
            slug: 'classic-white-roses',
            description: 'Elegance in its purest form. 12 long-stemmed premium white roses.',
            price: 65.00,
            images: {
                create: [
                    {
                        url: 'https://images.unsplash.com/photo-1559563159-12a1f044062e?q=80&w=2000&auto=format&fit=crop',
                        alt: 'Classic White Roses',
                        isMain: true,
                    }
                ]
            },
            categories: {
                connectOrCreate: [
                    {
                        where: { slug: 'roses' },
                        create: { name: 'Roses', slug: 'roses', parentId: flowersCat.id }
                    }
                ]
            }
        }
    });

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

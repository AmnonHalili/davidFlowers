
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Add-ons...');

    // 1. Create 'Add-ons' Category
    const addOnsCategory = await prisma.category.upsert({
        where: { slug: 'add-ons' },
        update: {},
        create: {
            name: 'תוספות',
            slug: 'add-ons',
        },
    });

    // 2. Create Sample Add-on Products
    const addons = [
        {
            name: 'מארז פרלינים יוקרתי',
            slug: 'premium-pralines',
            description: 'מארז שוקולד בלגי איכותי, השלמה מתוקה לכל זר.',
            price: 45,
            image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'אגרטל זכוכית מעוצב',
            slug: 'glass-vase',
            description: 'אגרטל זכוכית קלאסי המתאים לזרי דוד.',
            price: 60,
            image: 'https://images.unsplash.com/photo-1581783342308-f792ca80ddc8?auto=format&fit=crop&w=800&q=80',
        },
        {
            name: 'כרטיס ברכה מעוצב',
            slug: 'greeting-card',
            description: 'כרטיס ברכה מנייר איכותי לכתיבת מסר אישי.',
            price: 15,
            image: 'https://images.unsplash.com/photo-1586075010923-2dd45eeed8bd?auto=format&fit=crop&w=800&q=80',
        }
    ];

    for (const addon of addons) {
        await prisma.product.upsert({
            where: { slug: addon.slug },
            update: {},
            create: {
                name: addon.name,
                slug: addon.slug,
                description: addon.description,
                price: addon.price,
                stock: 100,
                images: {
                    create: [{ url: addon.image, isMain: true, alt: addon.name }]
                },
                categories: {
                    connect: { id: addOnsCategory.id }
                }
            }
        });
    }

    console.log('Add-ons seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

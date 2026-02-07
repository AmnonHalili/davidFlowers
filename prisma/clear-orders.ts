
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Clearing orders...');

    // 1. Delete OrderItems first to maintain referential integrity
    const deletedItems = await prisma.orderItem.deleteMany({});
    console.log(`Deleted ${deletedItems.count} order items.`);

    // 2. Delete Orders
    const deletedOrders = await prisma.order.deleteMany({});
    console.log(`Deleted ${deletedOrders.count} orders.`);

    console.log('Order history cleared successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

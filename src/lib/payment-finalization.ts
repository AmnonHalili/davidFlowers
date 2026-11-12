import 'server-only';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { verifyPayPlusTransaction } from '@/lib/payplus';
import { sendAdminNotification, sendOrderConfirmation } from '@/lib/email';

const settled = ['PAID', 'SHIPPED', 'DELIVERED'];

export async function finalizePayment(orderId: string, transactionUid: string) {
    if (!/^[a-zA-Z0-9_-]{1,128}$/.test(orderId) || !/^[a-zA-Z0-9_-]{1,128}$/.test(transactionUid)) return { success: false, error: 'Invalid reference' };
    const snapshot = await prisma.order.findUnique({ where: { id: orderId } });
    if (!snapshot) return { success: false, error: 'Payment cannot be confirmed' };
    // No status regression, no duplicate effects, and no fulfillment of cancelled/draft orders.
    if (settled.includes(snapshot.status)) return snapshot.payplusTransactionId === transactionUid
        ? { success: true, alreadyProcessed: true } : { success: false, error: 'Transaction mismatch' };
    if (snapshot.status !== 'PENDING' || snapshot.shippingAddress === 'Draft' || snapshot.payplusTransactionId) return { success: false, error: 'Order cannot be fulfilled' };

    const verified = await verifyPayPlusTransaction(transactionUid, orderId, snapshot.totalAmount.toString());
    if (!verified) return { success: false, error: 'Verification failed; contact the store if charged' };

    let completed = null;
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            completed = await prisma.$transaction(async tx => {
                const claim = await tx.order.updateMany({
                    where: { id: orderId, status: 'PENDING', payplusTransactionId: null,
                        totalAmount: snapshot.totalAmount, updatedAt: snapshot.updatedAt, shippingAddress: { not: 'Draft' } },
                    data: { status: 'PAID', payplusTransactionId: transactionUid },
                });
                if (claim.count !== 1) return null;
                const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true, user: true } });
                // Stable lock order plus SERIALIZABLE retries prevents lost updates/deadlocks across orders.
                const items = [...order.items].sort((a, b) => a.productId.localeCompare(b.productId));
                for (const item of items) {
                    if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0) throw new Error('Invalid quantity');
                    const product = await tx.product.findUniqueOrThrow({ where: { id: item.productId } });
                    if (product.isVariablePrice) {
                        const variations = product.variations;
                        if (!variations || Array.isArray(variations) || typeof variations !== 'object' || !item.selectedSize) throw new Error('Invalid variation');
                        const size = item.selectedSize.trim().toLowerCase();
                        const matches = Object.entries(variations).filter(([key, value]) => key.toLowerCase() === size ||
                            (value && typeof value === 'object' && !Array.isArray(value) && typeof value.label === 'string' && value.label.toLowerCase() === size));
                        if (matches.length !== 1) throw new Error('Ambiguous variation');
                        const [key, value] = matches[0];
                        const variant = value as Prisma.JsonObject;
                        if (typeof variant.stock !== 'number' || !Number.isSafeInteger(variant.stock) || variant.stock < item.quantity) throw new Error('Insufficient stock');
                        const next = { ...variations, [key]: { ...variant, stock: variant.stock - item.quantity } };
                        let total = 0;
                        for (const value of Object.values(next)) {
                            const stock = value && typeof value === 'object' && !Array.isArray(value) ? value.stock : null;
                            if (typeof stock !== 'number' || !Number.isSafeInteger(stock) || stock < 0) throw new Error('Invalid variation stock');
                            total += stock;
                        }
                        await tx.product.update({ where: { id: product.id }, data: { variations: next, stock: total } });
                    } else {
                        const stock = await tx.product.updateMany({ where: { id: product.id, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } });
                        if (stock.count !== 1) throw new Error('Insufficient stock');
                    }
                }
                return tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: { include: { product: true } }, user: true } });
            }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
            break;
        } catch (error) {
            if ((error as { code?: string }).code === 'P2034' && attempt < 2) continue;
            // Transaction rollback includes both payment claim and all inventory changes.
            console.error('Payment requires reconciliation');
            return { success: false, error: 'Payment requires store reconciliation' };
        }
    }
    if (!completed) {
        const current = await prisma.order.findUnique({ where: { id: orderId } });
        return current && settled.includes(current.status) && current.payplusTransactionId === transactionUid
            ? { success: true, alreadyProcessed: true } : { success: false, error: 'Order changed; contact the store' };
    }

    // Only the committing winner may attempt notifications. No fire-and-forget work after response.
    // At-most-once attempts: crash/delivery failures require reconciliation until an outbox is added.
    const customerEmail = completed.user?.email || completed.ordererEmail;
    const notices: Promise<unknown>[] = [sendAdminNotification({
        orderNumber: completed.id, customerName: completed.ordererName || completed.recipientName,
        totalAmount: Number(completed.totalAmount), shippingAddress: completed.shippingAddress,
        deliveryDate: completed.desiredDeliveryDate,
        items: completed.items.map(item => ({ name: item.product.name, quantity: item.quantity })),
    })];
    if (customerEmail) notices.push(sendOrderConfirmation({
        to: customerEmail, isGuest: !completed.userId, orderNumber: completed.id, customerName: completed.ordererName || completed.recipientName,
        totalAmount: Number(completed.totalAmount), shippingAddress: completed.shippingAddress,
        deliveryDate: completed.desiredDeliveryDate, deliveryNotes: completed.deliveryNotes || undefined,
        items: completed.items.map(item => ({ name: item.product.name, quantity: item.quantity, price: Number(item.price) })),
    }));
    await Promise.allSettled(notices);
    return { success: true, alreadyProcessed: false };
}

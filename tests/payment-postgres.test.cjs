const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { loader } = require('./helpers/load-ts.cjs');
const testUrl = process.env.SECURITY_TEST_DATABASE_URL;
if (!testUrl) {
  test('PostgreSQL concurrency integration requires SECURITY_TEST_DATABASE_URL', { skip: true }, () => {});
} else {
  const url = new URL(testUrl);
  if (!['127.0.0.1', 'localhost'].includes(url.hostname) || url.pathname !== '/davidflowers_security_test' || url.port !== '55439') throw new Error('Refusing non-isolated database');
  const { PrismaClient } = require('@prisma/client');
  const db = new PrismaClient({ datasources: { db: { url: testUrl } } });
  after(() => db.$disconnect());
  let notices = 0;
  const load = loader({ '@/lib/prisma': { __esModule: true, default: db },
    '@/lib/payplus': { verifyPayPlusTransaction: async () => ({ amountMinor: 10000, currency: 'ILS' }) },
    '@/lib/email': { sendAdminNotification: async () => { notices++; }, sendOrderConfirmation: async () => { notices++; } },
  });
  const { finalizePayment } = load('src/lib/payment-finalization.ts');
  async function seed(id, productId, status = 'PENDING') {
    return db.order.create({ data: { id, totalAmount: 100, recipientName: 'Synthetic', shippingAddress: 'Synthetic test address',
      ordererEmail: 'synthetic@example.test', status, items: { create: { productId, quantity: 1, price: 100 } } } });
  }
  test('real PostgreSQL: concurrent duplicate claims decrement stock and attempt notices once; delivered replay cannot regress', async () => {
    const product = await db.product.create({ data: { name: 'Synthetic', slug: 'synthetic-one', description: 'fake', price: 100, stock: 10 } });
    const order = await seed('order-concurrent', product.id);
    notices = 0;
    const results = await Promise.all([finalizePayment(order.id, 'tx-concurrent'), finalizePayment(order.id, 'tx-concurrent')]);
    assert.ok(results.some(r => r.success));
    assert.ok(results.every(r => r.success || r.requiresReconciliation));
    assert.equal((await db.product.findUnique({ where: { id: product.id } })).stock, 9); assert.equal(notices, 2);
    await db.order.update({ where: { id: order.id }, data: { status: 'DELIVERED' } });
    await finalizePayment(order.id, 'tx-concurrent');
    assert.equal((await db.order.findUnique({ where: { id: order.id } })).status, 'DELIVERED'); assert.equal(notices, 2);
    assert.equal((await finalizePayment(order.id, 'tx-unexpected-second-charge')).requiresReconciliation, true);
    assert.equal((await db.paymentVerification.findUnique({ where: { transactionId: 'tx-unexpected-second-charge' } })).fulfillmentState, 'REQUIRES_REVIEW');
    assert.equal((await db.product.findUnique({ where: { id: product.id } })).stock, 9); assert.equal(notices, 2);
  });
  test('real PostgreSQL: different concurrent orders do not lose variable inventory updates', async () => {
    const product = await db.product.create({ data: { name: 'Synthetic variant', slug: 'synthetic-two', description: 'fake', price: 100, stock: 10,
      isVariablePrice: true, variations: { small: { label: 'Small', price: 100, stock: 10 } } } });
    const a = await seed('order-variant-a', product.id); const b = await seed('order-variant-b', product.id);
    await db.orderItem.updateMany({ where: { productId: product.id }, data: { selectedSize: 'small' } });
    const results = await Promise.all([finalizePayment(a.id, 'tx-variant-a'), finalizePayment(b.id, 'tx-variant-b')]);
    assert.ok(results.every(r => r.success));
    const final = await db.product.findUnique({ where: { id: product.id } }); assert.equal(final.stock, 8); assert.equal(final.variations.small.stock, 8);
  });
  test('real PostgreSQL: inventory failure rolls back payment and all prior inventory writes; cancelled orders remain cancelled', async () => {
    const product = await db.product.create({ data: { name: 'Synthetic empty', slug: 'synthetic-three', description: 'fake', price: 100, stock: 0 } });
    const a = await seed('order-empty', product.id); notices = 0;
    assert.equal((await finalizePayment(a.id, 'tx-empty')).success, false);
    const untouched = await db.order.findUnique({ where: { id: a.id } }); assert.equal(untouched.status, 'PAYMENT_REVIEW'); assert.equal(untouched.payplusTransactionId, 'tx-empty'); assert.equal(notices, 0);
    const fact = await db.paymentVerification.findUnique({ where: { transactionId: 'tx-empty' } });
    assert.equal(fact.fulfillmentState, 'REQUIRES_REVIEW'); assert.equal(fact.amount.toString(), '100');
    const cancelled = await seed('order-cancelled', product.id, 'CANCELLED');
    assert.equal((await finalizePayment(cancelled.id, 'tx-cancelled')).success, false);
    assert.equal((await db.order.findUnique({ where: { id: cancelled.id } })).status, 'CANCELLED');
    assert.equal((await db.paymentVerification.findUnique({ where: { transactionId: 'tx-cancelled' } })).fulfillmentState, 'REQUIRES_REVIEW');
  });
  test('real PostgreSQL: draft capability supports reuse atomically, rejects replay/paid overwrite/user switch', async () => {
    const jar = new Map(); let userId = null;
    const loadDraft = loader({ '@/lib/prisma': { __esModule: true, default: db },
      '@clerk/nextjs/server': { auth: async () => ({ userId }) },
      'next/headers': { cookies: () => ({ get: key => jar.has(key) ? { value: jar.get(key) } : undefined,
        set: (key, value) => jar.set(key, value), delete: key => jar.delete(key) }) },
    }, { process: { env: { ORDER_ACCESS_SECRET: 'synthetic-order-secret-0123456789012345' } } });
    const persist = loadDraft('src/lib/draft-order.ts').persistDraftOrder;
    const product = await db.product.create({ data: { name: 'Draft test', slug: 'synthetic-draft', description: 'fake', price: 100, stock: 10 } });
    const data = { recipientName: 'Synthetic', shippingAddress: 'Draft', totalAmount: 100, items: { create: [{ product: { connect: { id: product.id } }, price: 100, quantity: 1 }] } };
    const initial = await persist(data, undefined, false);
    const oldCookie = jar.get('order_draft_' + initial.id);
    const updated = await persist(data, initial.id, false);
    assert.equal(updated.id, initial.id); assert.equal(await db.orderItem.count({ where: { orderId: initial.id } }), 1);
    const currentCookie = jar.get('order_draft_' + initial.id); jar.set('order_draft_' + initial.id, oldCookie);
    await assert.rejects(() => persist(data, initial.id, false));
    jar.set('order_draft_' + initial.id, currentCookie); userId = 'different-caller';
    await assert.rejects(() => persist(data, initial.id, false)); userId = null;
    const final = await persist({ ...data, shippingAddress: 'Synthetic actual address' }, initial.id, true);
    assert.equal(final.id, initial.id); assert.equal(jar.has('order_draft_' + initial.id), false);
    jar.set('order_draft_' + initial.id, currentCookie); await assert.rejects(() => persist(data, initial.id, false));
    await db.order.update({ where: { id: initial.id }, data: { status: 'PAID', payplusTransactionId: 'synthetic-already-paid' } });
    await assert.rejects(() => persist(data, initial.id, false));
    assert.equal((await db.order.findUnique({ where: { id: initial.id } })).status, 'PAID');
  });

  test('real PostgreSQL: simultaneous draft save/finalize has one winner and failed predicates preserve its items', async () => {
    const jar = new Map();
    const loadDraft = loader({ '@/lib/prisma': { __esModule: true, default: db },
      '@clerk/nextjs/server': { auth: async () => ({ userId: null }) },
      'next/headers': { cookies: () => ({ get: key => jar.has(key) ? { value: jar.get(key) } : undefined,
        set: (key, value) => jar.set(key, value), delete: key => jar.delete(key) }) },
    }, { process: { env: { ORDER_ACCESS_SECRET: 'synthetic-order-secret-0123456789012345' } } });
    const persist = loadDraft('src/lib/draft-order.ts').persistDraftOrder;
    const product = await db.product.create({ data: { name: 'Draft race', slug: 'synthetic-draft-race', description: 'fake', price: 100, stock: 10 } });
    const makeData = (quantity, address = 'Draft') => ({ recipientName: 'Synthetic', shippingAddress: address, totalAmount: quantity * 100,
      items: { create: [{ product: { connect: { id: product.id } }, price: 100, quantity }] } });
    const initial = await persist(makeData(1), undefined, false);
    const oldCookie = jar.get('order_draft_' + initial.id);
    const outcomes = await Promise.allSettled([persist(makeData(2), initial.id, false), persist(makeData(3, 'Synthetic address'), initial.id, true)]);
    assert.equal(outcomes.filter(result => result.status === 'fulfilled').length, 1);
    const winnerQuantity = outcomes[0].status === 'fulfilled' ? 2 : 3;
    jar.set('order_draft_' + initial.id, oldCookie);
    await assert.rejects(() => persist(makeData(99), initial.id, false));
    const items = await db.orderItem.findMany({ where: { orderId: initial.id } });
    assert.equal(items.length, 1); assert.equal(items[0].quantity, winnerQuantity);
  });

  test('real PostgreSQL: two verified buyers of the last unit retain both payment facts but only one fulfills', async () => {
    const product = await db.product.create({ data: { name: 'Last unit', slug: 'synthetic-last', description: 'fake', price: 100, stock: 1 } });
    const a = await seed('last-a', product.id); const b = await seed('last-b', product.id); notices = 0;
    const results = await Promise.all([finalizePayment(a.id, 'tx-last-a'), finalizePayment(b.id, 'tx-last-b')]);
    assert.equal(results.filter(r => r.success).length, 1); assert.equal(results.filter(r => r.requiresReconciliation).length, 1);
    const orders = await db.order.findMany({ where: { id: { in: [a.id, b.id] } } });
    assert.equal(orders.filter(o => o.status === 'PAID').length, 1); assert.equal(orders.filter(o => o.status === 'PAYMENT_REVIEW').length, 1);
    assert.ok(orders.every(o => o.payplusTransactionId)); assert.equal((await db.product.findUnique({ where: { id: product.id } })).stock, 0);
    assert.equal(await db.paymentVerification.count({ where: { orderId: { in: [a.id, b.id] } } }), 2); assert.equal(notices, 2);
    const pending = orders.find(o => o.status === 'PAYMENT_REVIEW');
    assert.equal((await finalizePayment(pending.id, pending.payplusTransactionId)).requiresReconciliation, true); assert.equal(notices, 2);
  });
  test('real PostgreSQL: variant error after verified charge retains evidence and rolls back prior stock writes', async () => {
    const good = await db.product.create({ data: { id: 'aaa-good', name: 'Good', slug: 'synthetic-good', description: 'fake', price: 50, stock: 5 } });
    const bad = await db.product.create({ data: { id: 'zzz-bad', name: 'Bad variant', slug: 'synthetic-bad', description: 'fake', price: 50, stock: 5, isVariablePrice: true, variations: {} } });
    const order = await seed('bad-variant-order', good.id);
    await db.orderItem.create({ data: { orderId: order.id, productId: bad.id, price: 50, quantity: 1, selectedSize: 'missing' } });
    const result = await finalizePayment(order.id, 'tx-bad-variant'); assert.equal(result.requiresReconciliation, true);
    assert.equal((await db.product.findUnique({ where: { id: good.id } })).stock, 5);
    assert.equal((await db.order.findUnique({ where: { id: order.id } })).status, 'PAYMENT_REVIEW');
    assert.equal((await db.paymentVerification.findUnique({ where: { transactionId: 'tx-bad-variant' } })).fulfillmentState, 'REQUIRES_REVIEW');
  });
  test('real PostgreSQL: changed/cancelled order after provider verification keeps durable charge without fulfillment', async () => {
    const product = await db.product.create({ data: { name: 'Changed', slug: 'synthetic-changed', description: 'fake', price: 100, stock: 5 } });
    for (const cancel of [false, true]) {
      const order = await seed(cancel ? 'cancel-during-verification' : 'change-during-verification', product.id);
      const txId = cancel ? 'tx-cancel-during' : 'tx-change-during';
      const loadRace = loader({ '@/lib/prisma': { __esModule: true, default: db },
        '@/lib/payplus': { verifyPayPlusTransaction: async () => {
          await db.order.update({ where: { id: order.id }, data: { ...(cancel ? { status: 'CANCELLED' } : {}), updatedAt: new Date(Date.now() + 1000) } });
          return { amountMinor: 10000, currency: 'ILS' };
        } }, '@/lib/email': { sendAdminNotification: async () => { throw Error('must not notify fulfillment'); }, sendOrderConfirmation: async () => { throw Error('must not notify fulfillment'); } },
      });
      const result = await loadRace('src/lib/payment-finalization.ts').finalizePayment(order.id, txId);
      assert.equal(result.requiresReconciliation, true);
      const fact = await db.paymentVerification.findUnique({ where: { transactionId: txId } }); assert.equal(fact.fulfillmentState, 'REQUIRES_REVIEW');
      const current = await db.order.findUnique({ where: { id: order.id } }); assert.equal(current.status, cancel ? 'CANCELLED' : 'PENDING');
    }
    assert.equal((await db.product.findUnique({ where: { id: product.id } })).stock, 5);
  });

}

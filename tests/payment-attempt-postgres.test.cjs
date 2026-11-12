const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { loader } = require('./helpers/load-ts.cjs');
const testUrl = process.env.SECURITY_TEST_DATABASE_URL;
if (!testUrl) test('payment initiation requires isolated PostgreSQL', { skip: true }, () => {});
else {
  const url = new URL(testUrl);
  if (!['127.0.0.1','localhost'].includes(url.hostname) || url.port !== '55439' || url.pathname !== '/davidflowers_security_test') throw Error('Refusing non-isolated database');
  const { PrismaClient } = require('@prisma/client');
  const db = new PrismaClient({ datasources: { db: { url: testUrl } } });
  after(() => db.$disconnect());
  let sequence = 0;
  async function fixture(overrideDb) {
    const jar = new Map(); let userId = null;
    const load = loader({ '@/lib/prisma': { __esModule: true, default: overrideDb || db },
      '@clerk/nextjs/server': { auth: async () => ({ userId }) },
      'next/headers': { cookies: () => ({ get: k => jar.has(k) ? { value: jar.get(k) } : undefined, set: (k,v) => jar.set(k,v), delete: k => jar.delete(k) }) },
      './order-access': { grantGuestReceipt: () => {} },
    }, { process: { env: { ORDER_ACCESS_SECRET: 'synthetic-order-secret-0123456789012345' } } });
    const product = await db.product.create({ data: { name: 'Attempt synthetic', slug: `attempt-${++sequence}`, description: 'fake', price: 100, stock: 10 } });
    const data = { recipientName: 'Synthetic', ordererName: 'Synthetic', ordererEmail: 'synthetic@example.test', shippingAddress: 'Draft', totalAmount: 100,
      items: { create: [{ product: { connect: { id: product.id } }, quantity: 1, price: 100 }] } };
    const order = await load('src/lib/draft-order.ts').persistDraftOrder(data, undefined, false);
    return { ...load('src/lib/payment-attempt.ts'), jar, order, data: { ...data, shippingAddress: 'Synthetic pickup' }, switchUser: () => { userId = 'another-user'; } };
  }
  test('concurrent prepare and initiation produce one attempt, one provider request and one item set', async () => {
    const f = await fixture();
    const prepared = await Promise.all([f.preparePaymentAttempt(f.order.id), f.preparePaymentAttempt(f.order.id)]);
    assert.equal(prepared[0].attemptId, prepared[1].attemptId);
    let calls = 0;
    const gateway = async () => { calls++; return 'https://synthetic.example.test/payment'; };
    const results = await Promise.all([f.initiatePaymentAttempt(prepared[0].attemptId, f.data, gateway), f.initiatePaymentAttempt(prepared[0].attemptId, f.data, gateway)]);
    assert.equal(calls, 1); assert.ok(results.some(r => r.state === 'LINK_READY'));
    assert.equal(await db.orderItem.count({ where: { orderId: f.order.id } }), 1);
    assert.equal((await f.initiatePaymentAttempt(prepared[0].attemptId, { ...f.data, totalAmount: 1 }, gateway)).url, 'https://synthetic.example.test/payment');
    assert.equal(calls, 1); assert.equal((await db.order.findUnique({ where: { id: f.order.id } })).totalAmount.toString(), '100');
  });
  test('provider timeout after link creation stays UNKNOWN across retries and page reload preparation', async () => {
    const f = await fixture(); const p = await f.preparePaymentAttempt(f.order.id); let calls = 0;
    const gateway = async () => { calls++; throw Error('Synthetic response timeout after provider created link'); };
    assert.equal((await f.initiatePaymentAttempt(p.attemptId, f.data, gateway)).state, 'UNRESOLVED');
    assert.equal((await db.paymentAttempt.findUnique({ where: { id: p.attemptId } })).state, 'UNKNOWN');
    const reload = await f.preparePaymentAttempt(); assert.equal(reload.attemptId, p.attemptId);
    assert.equal((await f.initiatePaymentAttempt(p.attemptId, f.data, gateway)).state, 'UNRESOLVED');
    assert.equal(calls, 1);
  });
  test('crash after REQUESTING and failed result persistence never issue a replacement link', async () => {
    let fail = true;
    const attemptDelegate = { ...db.paymentAttempt, updateMany: async args => {
      if (fail && args.data.state === 'LINK_READY') { fail = false; throw Error('Synthetic persistence outage'); }
      return db.paymentAttempt.updateMany(args);
    } };
    const proxy = new Proxy(db, { get: (target, key) => key === 'paymentAttempt' ? attemptDelegate : Reflect.get(target, key) });
    const f = await fixture(proxy); const p = await f.preparePaymentAttempt(f.order.id); let calls = 0;
    const gateway = async () => { calls++; return 'https://synthetic.example.test/payment'; };
    assert.equal((await f.initiatePaymentAttempt(p.attemptId, f.data, gateway)).state, 'UNRESOLVED');
    await f.initiatePaymentAttempt(p.attemptId, f.data, gateway); assert.equal(calls, 1);
    await db.paymentAttempt.update({ where: { id: p.attemptId }, data: { state: 'REQUESTING' } });
    await f.initiatePaymentAttempt(p.attemptId, f.data, gateway); assert.equal(calls, 1);
  });
  test('forgery, user switch and verified attempts cannot invoke gateway', async () => {
    const f = await fixture(); const p = await f.preparePaymentAttempt(f.order.id); let calls = 0;
    const gateway = async () => { calls++; return 'https://synthetic.example.test/payment'; };
    await assert.rejects(() => f.initiatePaymentAttempt('forged', f.data, gateway));
    await db.paymentAttempt.update({ where: { id: p.attemptId }, data: { state: 'VERIFIED' } });
    assert.equal((await f.initiatePaymentAttempt(p.attemptId, f.data, gateway)).state, 'VERIFIED');
    f.switchUser(); await assert.rejects(() => f.initiatePaymentAttempt(p.attemptId, f.data, gateway)); assert.equal(calls, 0);
  });
}

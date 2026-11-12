const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loader } = require('./helpers/load-ts.cjs');
const { validCartItems, usableCoupon } = loader()('src/lib/checkout-validation.ts');
test('cart rejects negative, fractional, unsafe, zero and malformed quantities', () => {
  for (const quantity of [-1, 0, 0.5, '1', NaN, Infinity, Number.MAX_SAFE_INTEGER, 1001]) assert.equal(validCartItems([{ productId: 'fake', quantity }]), false);
  assert.equal(validCartItems({}), false); assert.equal(validCartItems([]), false); assert.equal(validCartItems([{ productId: 'fake', quantity: 1 }]), true);
});
test('coupon rejects disabled, expired, future, exhausted, missing and malformed discounts', () => {
  const coupon = { isActive: true, validFrom: new Date('2020-01-01'), validUntil: null, usageLimit: null, usageCount: 0, discountAmount: 50, discountType: 'PERCENTAGE' };
  assert.equal(usableCoupon(coupon), true);
  for (const change of [{ isActive: false }, { validUntil: new Date('2000-01-01') }, { validFrom: new Date('2999-01-01') },
    { usageLimit: 1, usageCount: 2 }, { discountAmount: -1 }, { discountAmount: 101 }, { discountAmount: 'garbage' }]) assert.equal(usableCoupon({ ...coupon, ...change }), false);
  assert.equal(usableCoupon(null), false);
});
test('checkout rejects invalid quantity before any DB or provider call', async () => {
  let effects = 0;
  const load = loader({ '@clerk/nextjs/server': { auth: async () => ({ userId: null }), currentUser: async () => null },
    'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) } },
    '@/lib/prisma': { __esModule: true, default: new Proxy({}, { get: () => { effects++; throw Error('Forbidden DB call'); } }) },
    '@/lib/order-access': {}, '@/lib/draft-order': {},
  }, { fetch: async () => { effects++; throw Error('Forbidden provider call'); } });
  const { POST } = load('src/app/api/checkout/route.ts');
  const response = await POST({ json: async () => ({ items: [{ productId: 'one', quantity: 1 }, { productId: 'two', quantity: -1 }] }) });
  assert.equal(response.status, 400); assert.equal(effects, 0);
});
test('checkout rejects an inactive/expired/exhausted coupon before any order or gateway mutation', async () => {
  let effects = 0;
  const load = loader({ '@clerk/nextjs/server': { auth: async () => ({ userId: null }), currentUser: async () => null },
    'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) } },
    '@/lib/prisma': { __esModule: true, default: { product: { findMany: async () => [{ id: 'one', price: 100, stock: 10, categories: [] }] },
      coupon: { findUnique: async () => ({ isActive: false, validUntil: new Date('2000-01-01'), usageCount: 2, usageLimit: 1, discountAmount: 50, discountType: 'PERCENTAGE' }) } } },
    '@/lib/order-access': {}, '@/lib/draft-order': { persistDraftOrder: async () => { effects++; throw Error('Forbidden write'); } },
  }, { fetch: async () => { effects++; throw Error('Forbidden provider call'); } });
  const response = await load('src/app/api/checkout/route.ts').POST({ json: async () => ({ items: [{ productId: 'one', quantity: 1 }],
    recipientName: 'Fake', recipientPhone: '000', ordererPhone: '000', ordererName: 'Fake', ordererEmail: 'fake@example.test', shippingMethod: 'pickup', couponId: 'invalid' }) });
  assert.equal(response.status, 400); assert.equal(effects, 0);
});

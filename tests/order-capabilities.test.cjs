const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loader } = require('./helpers/load-ts.cjs');
function setup() {
  const env = { ORDER_ACCESS_SECRET: 'synthetic-order-secret-0123456789012345', NEXT_PUBLIC_APP_URL: 'https://example.test' };
  const jar = new Map(); let userId = null;
  const load = loader({ '@clerk/nextjs/server': { auth: async () => ({ userId }) }, 'next/headers': { cookies: () => ({
    get: key => jar.has(key) ? { value: jar.get(key) } : undefined, set: (key, value) => jar.set(key, value), delete: key => jar.delete(key),
  }) } }, { process: { env } });
  return { env, jar, load, user: value => { userId = value; } };
}
test('receipt signatures expire, separate purposes, reject malformed input and support per-order/global revocation', () => {
  const h = setup(); const cap = h.load('src/lib/order-capabilities.ts'); const now = Date.now();
  const token = cap.issueOrderCapability({ purpose: 'receipt', orderId: 'own', expiresAt: now + 1000 });
  assert.ok(cap.verifyOrderCapability(token, 'receipt', now));
  assert.equal(cap.verifyOrderCapability(token, 'receipt', now + 1001), null);
  assert.equal(cap.verifyOrderCapability(token, 'draft', now), null);
  for (const value of ['é'.repeat(64), 'a.b.c', token + 'a', '']) assert.equal(cap.verifyOrderCapability(value, 'receipt'), null);
  h.env.ORDER_RECEIPT_REVOKED_IDS = 'own'; assert.equal(cap.verifyOrderCapability(token, 'receipt'), null);
  delete h.env.ORDER_RECEIPT_REVOKED_IDS; h.env.ORDER_ACCESS_SECRET = 'rotated-synthetic-key-012345678901234'; assert.equal(cap.verifyOrderCapability(token, 'receipt'), null);
});
test('multiple guest orders coexist; logged-in user always gets own scope; logout never exposes registered order via guest token', async () => {
  const h = setup(); const access = h.load('src/lib/order-access.ts');
  access.grantGuestReceipt('one'); access.grantGuestReceipt('two');
  assert.equal((await access.customerOrderScope('one')).userId, null);
  assert.equal((await access.customerOrderScope('two')).userId, null);
  h.user('other-account'); assert.equal((await access.customerOrderScope('one')).user.clerkId, 'other-account');
  h.user(null); assert.equal((await access.customerOrderScope('one')).userId, null); // Null limits this capability to guest rows only.
  assert.equal((await access.customerOrderScope('registered')).userId, '__no_authenticated_owner__');
});
test('email receipt is scoped, exchangeable on another browser and invalidated by revocation', async () => {
  const a = setup(); const b = setup(); const first = a.load('src/lib/order-access.ts'); const second = b.load('src/lib/order-access.ts');
  const link = new URL(first.createGuestReceiptLink('guest-order'));
  assert.equal(link.pathname, '/receipt/access'); assert.equal(second.acceptGuestReceipt(link.searchParams.get('token')), 'guest-order');
  assert.equal((await second.customerOrderScope('guest-order')).userId, null);
  b.env.ORDER_RECEIPT_REVOKED_IDS = 'guest-order'; assert.equal((await second.customerOrderScope('guest-order')).userId, '__no_authenticated_owner__');
});
test('optional dedicated secret can bootstrap from existing server key; no credentials fail closed', () => {
  const h = setup(); const cap = h.load('src/lib/order-capabilities.ts'); delete h.env.ORDER_ACCESS_SECRET;
  assert.equal(cap.orderCapabilitiesAvailable(), false);
  h.env.CLERK_SECRET_KEY = 'fake-existing-server-key-0123456789012345'; assert.equal(cap.orderCapabilitiesAvailable(), true);
  h.env.ORDER_ACCESS_SECRET = 'short'; assert.equal(cap.orderCapabilitiesAvailable(), false);
});

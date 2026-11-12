const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loader } = require('./helpers/load-ts.cjs');
const expected = { orderId: 'order-test', transactionUid: 'transaction-test', amount: '100.00', currency: 'ILS', terminalUid: 'terminal-test' };
function response(overrides = {}) { return { results: { status: 'success', code: 0 }, data: [{ transaction: {
  transaction_uid: expected.transactionUid, more_info: expected.orderId, amount: 100, currency: 'ILS',
  transaction_type: 'Charge', status_code: '000', transaction_is_cancelled: false, ...overrides,
}, data: { terminal_uid: expected.terminalUid } }] }; }
const { parseVerifiedPayment, moneyToMinor } = loader()('src/lib/payplus.ts');
test('official View envelope validates binding; reject underpayment, foreign currency, refund, cancellation, failed/unknown state', () => {
  assert.ok(parseVerifiedPayment(response(), expected));
  for (const bad of [{ amount: 0.01 }, { currency: 'USD' }, { transaction_type: 'Refund' }, { transaction_type: 'Approval' },
    { transaction_is_cancelled: true }, { transaction_is_cancelled: undefined }, { status_code: '001' }, { transaction_uid: 'another' },
    { more_info: 'another-order' }, { amount: '100.001' }, { amount: -100 }]) assert.equal(parseVerifiedPayment(response(bad), expected), null);
  const terminal = response(); terminal.data[0].data.terminal_uid = 'another'; assert.equal(parseVerifiedPayment(terminal, expected), null);
  const ambiguous = response(); ambiguous.data.push(ambiguous.data[0]); assert.equal(parseVerifiedPayment(ambiguous, expected), null);
  assert.equal(parseVerifiedPayment({ data: response().data }, expected), null);
  assert.equal(moneyToMinor('0.00'), null); assert.equal(moneyToMinor('1e2'), null);
});
test('gateway uses documented authenticated View request and fails closed on HTTP/network/schema errors', async () => {
  let requested;
  const env = { PAYPLUS_API_KEY: 'fake', PAYPLUS_SECRET_KEY: 'fake', PAYPLUS_TERMINAL_ID: expected.terminalUid };
  let result = { ok: true, json: async () => response() };
  const load = loader({}, { process: { env }, fetch: async (url, init) => { requested = { url, init }; return result; } });
  const verify = load('src/lib/payplus.ts').verifyPayPlusTransaction;
  assert.ok(await verify(expected.transactionUid, expected.orderId, expected.amount));
  assert.equal(requested.url, 'https://restapi.payplus.co.il/api/v1.0/Transactions/View');
  assert.equal(JSON.parse(requested.init.body).transaction_uid, expected.transactionUid);
  assert.equal(requested.init.redirect, 'error');
  result = { ok: false, status: 403 }; assert.equal(await verify(expected.transactionUid, expected.orderId, expected.amount), null);
  result = { ok: true, json: async () => ({}) }; assert.equal(await verify(expected.transactionUid, expected.orderId, expected.amount), null);
});

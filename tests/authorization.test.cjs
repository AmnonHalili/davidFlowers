const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const crypto = require('node:crypto');

function harness() {
  let identity = null;
  let reads = 0;
  const jar = new Map();
  const env = { ADMIN_EMAILS: 'owner@example.test', CLERK_SECRET_KEY: 'fake-test-key' };
  const db = new Proxy({}, { get: (_, model) => new Proxy({}, { get: (_, method) => async (args) => {
    reads++; return method === 'findMany' ? [] : null;
  }}) });
  const cache = {};
  function load(file) {
    if (cache[file]) return cache[file];
    const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
    const exports = {}; cache[file] = exports;
    const mocks = {
      'server-only': {}, '@clerk/nextjs/server': { currentUser: async () => identity, auth: async () => ({ userId: identity?.id || null }) },
      '@/lib/prisma': { __esModule: true, default: db }, '@prisma/client': { PrismaClient: function() { return db; } },
      'next/navigation': {}, 'next/cache': { revalidatePath() {} }, 'next/headers': { cookies: () => ({ get: k => jar.has(k) ? { value: jar.get(k) } : undefined, set: (k,v) => jar.set(k,v) }) },
      '@/lib/email': {}, '@/lib/email-service': {}, '@/lib/payplus': {}, 'resend': {}, 'date-fns': {}, crypto,
    };
    vm.runInNewContext(code, { exports, require: name => {
      if (name in mocks) return mocks[name];
      if (name.startsWith('@/')) return load('src/' + name.slice(2) + '.ts');
      throw new Error('Unexpected import: ' + name);
    }, process: { env }, Buffer, console, Date });
    return exports;
  }
  return { load, env, jar, db, setIdentity: u => identity = u, reads: () => reads };
}
const customer = { id: 'customer', role: 'ADMIN', emailAddresses: [{ emailAddress: 'customer@example.test', verification: { status: 'verified' } }] };
const admin = { id: 'owner', emailAddresses: [{ emailAddress: 'owner@example.test', verification: { status: 'verified' } }] };
const privileged = {
  'category-actions': ['getCategoriesWithPromotions','updateCategoryPromotion','createCategory','updateCategoriesOrder','updateCategoryDetails','deleteCategory'],
  'coupon-actions': ['createCoupon','getCoupons','deleteCoupon'],
  'gallery-actions': ['getAllGalleryImages','addGalleryImage','toggleGalleryImageVisibility','deleteGalleryImage'],
  'product-actions': ['createProduct','updateProduct','deleteProduct'],
  'review-actions': ['getAllReviews','updateReviewStatus','deleteReview'],
  'site-config-actions': ['updateSiteConfig'], 'report-actions': ['getMonthlyReport'],
  'demo-actions': ['createDemoOrder'], 'debug-email': ['sendTestEmailAction'], 'order-actions': ['getOrders','getOrder','updateOrderStatus'],
};
for (const [file, names] of Object.entries(privileged)) for (const name of names) {
  test(`${name} rejects unauthenticated and contaminated ADMIN customers before database access`, async () => {
    const h = harness(); const fn = h.load(`src/app/actions/${file}.ts`)[name];
    await assert.rejects(() => fn(), /Forbidden/);
    h.setIdentity(customer); await assert.rejects(() => fn(), /Forbidden/);
    assert.equal(h.reads(), 0);
  });
}
test('allowlist requires verified email and is reevaluated after revocation/session end', async () => {
  const h = harness(); const a = h.load('src/lib/admin-auth.ts');
  h.setIdentity(admin); await a.requireAdmin();
  h.env.ADMIN_EMAILS = ''; await assert.rejects(a.requireAdmin, /Forbidden/);
  h.env.ADMIN_EMAILS = 'owner@example.test'; h.setIdentity({ ...admin, emailAddresses: [{ emailAddress: 'owner@example.test', verification: { status: 'unverified' } }] });
  await assert.rejects(a.requireAdmin, /Forbidden/);
  h.setIdentity(null); await assert.rejects(a.requireAdmin, /Forbidden/);
});
test('authorized admin reaches financial read, stale DB role does not affect authorization', async () => {
  const h = harness(); h.setIdentity(admin);
  await h.load('src/app/actions/order-actions.ts').getOrders(); assert.equal(h.reads(), 1);
});
test('customer read scope cannot select another owner; guest receipts cannot be forged or reused for another order', async () => {
  const h = harness(); const a = h.load('src/lib/order-access.ts');
  assert.equal((await a.customerOrderScope('other')).userId, '__no_authenticated_owner__');
  h.setIdentity(customer); assert.equal((await a.customerOrderScope('other')).user.clerkId, 'customer');
  h.setIdentity(null); a.grantGuestReceipt('own');
  assert.deepEqual(JSON.parse(JSON.stringify(await a.customerOrderScope('own'))), { id: 'own' });
  assert.equal((await a.customerOrderScope('other')).userId, '__no_authenticated_owner__');
  h.jar.set('order_receipt', 'other:forged'); assert.equal((await a.customerOrderScope('other')).userId, '__no_authenticated_owner__');
});
test('repeat sign-in cannot promote and sync never relinks an existing email', async () => {
  const source = fs.readFileSync('src/lib/user-sync.ts', 'utf8');
  assert.doesNotMatch(source, /user\.update|role:\s*'ADMIN'/);
  const h = harness(); h.setIdentity(customer); const sync = h.load('src/lib/user-sync.ts').syncUser;
  await sync(); await sync();
  assert.match(source, /if \(emailOwner\) return null/);
});
test('every server admin page gates before its body and checkout cannot overwrite an existing order', () => {
  for (const file of fs.readdirSync('src/app/admin', { recursive: true }).filter(f => f.endsWith('page.tsx'))) {
    const source = fs.readFileSync(path.join('src/app/admin', file), 'utf8');
    if (source.includes('export default async function')) assert.match(source, /export default async function[\s\S]*?\) \{\s*await requireAdmin\(\);/);
  }
  for (const file of ['src/app/api/checkout/route.ts', 'src/app/actions/order-actions.ts']) {
    const source = fs.readFileSync(file, 'utf8'); assert.doesNotMatch(source, /orderItem\.deleteMany/);
  }
  const source = fs.readFileSync('src/app/cancel/page.tsx', 'utf8'); assert.doesNotMatch(source, /prisma\.order\.update/);
});

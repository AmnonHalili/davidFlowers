# Security follow-up — draft, not approved for production

Base: production containment 8d38f9c. No production data/configuration changes are part of this work. No schema migration is required. Build remains `prisma generate && next build`.

## Payment integrity (priority)

Both callback and success processing call one finalizer. It uses documented authenticated `Transactions/View`, validates the success envelope and exactly one transaction, and binds transaction ID, order ID, positive exact minor-unit amount, ILS currency, configured terminal, successful Charge type and explicit non-cancelled status. Missing/ambiguous fields, API errors and redirects fail closed. No callback financial fields or raw callback body logs are trusted/retained.

Official reference inspected 2026-11-12: https://docs.payplus.co.il/reference/post_transactions-view (including its downloadable `.md` OpenAPI schema and 200 response example). The earlier `Transactions/GetStatus` contract could not be established. `PaymentPages/ipn` and `ipn-full` reference examples were empty objects, so this implementation does not assume their response layout. Callback reference: https://docs.payplus.co.il/reference/get_yourdomain-yourendpoint . GET and POST routing hints are supported; both reverify through View.

A SERIALIZABLE database transaction conditionally claims an unchanged PENDING non-draft order, decrements inventory, and records the unique transaction ID together. Serialization conflicts retry, at most three attempts. Already PAID/SHIPPED/DELIVERED orders never regress. CANCELLED orders and cancelled/refund provider records cannot be fulfilled. Exact variant key/label matching replaces substring guessing. Stock shortfalls roll back the claim and require operator reconciliation; this code never initiates a refund or another charge.

Only the committed winner attempts customer/admin email. Calls are awaited rather than abandoned after response. This is **at-most-once notification attempt**, not guaranteed delivery: a process crash after commit or failed delivery requires reconciliation. A durable transactional outbox with idempotent downstream delivery remains a separate reliability change. Push remains off. Refund callbacks are acknowledged for reconciliation; automated refund accounting/stock restoration is not implemented. The documented cancellation flag is checked, but live provider semantics for historical refunds still require validation.

Production View health has NOT been demonstrated: no live credentials or transactions were queried. Parent's read-only runtime audit established historical GetStatus 403s. Before rollout, a separately authorized operator should verify a legitimate existing transaction via View or provide a sanitized official sandbox fixture, confirm terminal permissions, and confirm dashboard callback configuration. Never re-enable unsigned callback fallback.

Checkout rejects nonpositive/fractional/unsafe quantities, invalid coupons and unavailable products/variants; uses server catalog/category pricing; rounds monetary totals to cents; and refuses zero-value payment initiation. This is not a complete reservation/coupon accounting system. Inventory is checked at checkout and atomically at finalization, without reservation; a customer can pay just before another order consumes stock and then require reconciliation. Coupon usage consumption/reservations and anti-abuse/rate limits remain follow-up work.

## Receipt access and draft reuse

Capabilities are HMAC signed, purpose separated, exact-order scoped and have a server-enforced expiration. Browser cookies are HttpOnly/SameSite=Lax, Secure in production, and named per order so separate tabs/orders coexist.

- Guest receipt links: seven days. Only issued by successful-payment email for guest orders. The exchange route renders no page/assets, sets no-store/no-referrer/noindex, and redirects to a clean URL. Cookies last at most 24 hours and never outlive the token. Links are bearer secrets: forwarding grants read-only access to that guest order, and infrastructure/email tooling can retain URLs. Do not log query strings. No public resend-by-order-ID endpoint is introduced.
- Receipt scope always prefers the currently authenticated Clerk owner. Guest capabilities only match `userId: null`; they never expose registered-account orders after logout or override another signed-in user's identity.
- Optional dedicated `ORDER_ACCESS_SECRET` must have at least 32 characters. If absent, a domain-separated key derived in memory from the existing Clerk server key bootstraps functionality. No secret values were fetched/copied. A malformed explicit override fails closed. If all signing credentials are absent, draft capture returns no reusable order ID and checkout can create a fresh order; receipt access requires the owning account.
- Revocation: `ORDER_RECEIPT_REVOKED_IDS` is a comma-separated server-only order denylist checked on every read; configuration changes require redeployment. Rotating the dedicated secret revokes all capabilities. Moving from the Clerk-derived fallback to a dedicated key also revokes earlier capabilities. Per-order immediate DB-backed revocation and a management UI are deliberately deferred.
- Draft write capabilities: two hours, bound to the current session subject (or anonymous), order ID and exact `updatedAt`. Reuse performs one atomic nested update with PENDING, no payment transaction, `shippingAddress: Draft`, ownership and version predicates. Final checkout changes the draft marker and removes the write cookie. Stale/foreign/paid/finalized drafts cannot change items. A rejected checkout clears the client's stale draft ID before retry. Replays/races fail safely; user may need to repeat checkout.

## Push UX and secure re-enrollment design

The UI truthfully states delivery is paused and never reports browser subscription existence as delivery enabled. Enrollment returns 503 after checking admin identity; no new device records are persisted while disabled.

Restoring delivery requires a reviewed additive enrollment design, not a role-based query:
1. New enrollment epoch/version with historical records defaulting to ineligible. Do not mass-promote old endpoints.
2. An authenticated currently allowlisted admin explicitly unsubscribes the old browser endpoint, creates a new browser subscription, and confirms the device. Store immutable Clerk identity, epoch, enrollment time, revocation state and fresh endpoint keys.
3. At delivery, require current epoch, unrevoked enrollment, and current verified Clerk identity/allowlist membership. Fail closed on identity lookup errors; never rely on cached DB ADMIN role.
4. Use generic push text without customer names/amounts. The deep link still requires server admin authorization.
5. Test role contamination, removed admins, key/epoch rotation, revoked endpoints and account switching before enabling the sender. Keep schema/config activation separate from this PR.

## Verification and release gate

Automated synthetic tests cover direct action denials, capabilities, input abuse, provider response mismatch, and real local PostgreSQL concurrency/rollback/draft guards. Test database is constrained to localhost:55439/davidflowers_security_test; payment and notification dependencies are mocked. No live provider calls, real messages or production database writes occurred.

Browser inventory contained no David Flowers tab or explicit authorized test account. No one was logged out and no customer was impersonated. Real signed-in customer/admin checks need a legitimate session or user-provided test-account access; this remains a rollout check.

Do not merge/deploy until independent security/payment review, operator acceptance of the listed operational tradeoffs, and explicit coordinated authorization. Never rollback to the pre-containment vulnerable deployment.

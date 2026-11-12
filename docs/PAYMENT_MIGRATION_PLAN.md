# Payment ledger migration assessment — draft, not executed

Read-only assessment on 2026-11-12. No production schema/data/configuration writes, backup creation, restore, or gateway transaction was performed.

## Observed baseline and recovery metadata

The connected Neon project named DavidFlowers (`tiny-sound-48195259`) has a default branch named production (`br-calm-violet-a45qazxt`), database `neondb`, PostgreSQL 17. Catalog-only queries confirm no `public._prisma_migrations`, no PaymentVerification or PaymentAttempt table, and no PAYMENT_REVIEW OrderStatus value. This matches the repository's lack of migration history at containment commit 8d38f9c. This is not a complete schema-drift comparison, nor independent confirmation of Vercel's encrypted DATABASE_URL target.

Project metadata reports `history_retention_seconds: 86400` (24 hours). The snapshot inventory is empty. An archived February branch exists, but is not a current pre-change backup. No restore rehearsal or independently retained backup was verified. Branch protection is currently false; this assessment does not change it.

## Required approval and deployment gates

1. Confirm production Vercel database identity without exposing credentials. Obtain a reviewed schema-only comparison of the actual target with 8d38f9c, including indexes, constraints, triggers and extensions. Do not infer full equivalence from the four existence checks above.
2. Before any production migration, approve and create a current recovery point/backup with recorded time, retention and responsible operator. Rehearse restoring it into an isolated branch with all live payment/email integrations disabled. Validate schema and aggregate consistency there without exporting customer records. A configured 24-hour history window is not proof of a successful restore and will expire.
3. Add a reviewed `0_baseline` migration representing the **existing** schema, excluding the two new ledgers and enum value. Test creating an empty disposable database from baseline plus both additions. On a restored clone of the existing database, mark only the verified baseline as applied, then apply the two additions. Never mark unapplied payment additions as applied. No baseline file is committed yet because complete live drift has not been established.
4. Use the installed Prisma 6 CLI and a direct connection for approved migration execution. Confirm CLI flags for that installed version. Run migrations independently of Vercel builds with bounded lock/statement timeouts. Do not run `db push`, `migrate reset`, seed scripts, or restoration scripts on production. Build remains `prisma generate && next build`.
5. Apply the additive schema before deploying code that reads it. The migrations add PaymentVerification, PAYMENT_REVIEW, and PaymentAttempt with unique orderId and an allowed-state check; they do not rewrite orders, inventory or contaminated user roles. Record migration checksums and verify catalog results. Synthetic local upgrade from the exact containment schema succeeded with both SQL files.
6. Review the exact code head and use isolated preview configuration. Existing preview credentials must not be assumed to be sandbox credentials. Provider integration health still needs an authorized read-only verification of a legitimate existing transaction; no live transaction is part of these tests.

## Rollback and reconciliation

Prefer a forward fix. Preserve both ledgers and all verified charge evidence. Do not drop tables, remove enum values, revert PAYMENT_REVIEW to PENDING, or automatically reset UNKNOWN/REQUESTING attempts. A prior client may not understand PAYMENT_REVIEW, so an application rollback requires compatibility review; never roll back to the pre-containment vulnerable build. Database point-in-time restoration can discard subsequent legitimate orders and charges and must not be an automatic rollback. Restore into a separate branch first, reconcile newer provider facts, and obtain a separately reviewed recovery decision.

Unknown initiation attempts require operator reconciliation with PayPlus using the order reference. Lack of a response or missing webhook is not evidence of no charge. There is deliberately no “reset/retry” admin control. A replacement attempt may only be designed after provider cancellation/non-charge facts are established. No provider idempotency or cancellation contract has been assumed.

References: [Prisma baselining](https://www.prisma.io/docs/orm/prisma-migrate/workflows/baselining), [Neon restore](https://neon.com/docs/introduction/branch-restore). The current Prisma documentation redirects to v7; this repository uses v6, so commands require version-specific validation.

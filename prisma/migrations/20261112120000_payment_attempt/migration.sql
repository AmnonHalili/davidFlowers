-- Additive only; requires a separately approved baseline/backup/rollout procedure.
CREATE TABLE "PaymentAttempt" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "subject" TEXT,
  "draftVersion" TIMESTAMP(3) NOT NULL,
  "state" TEXT NOT NULL DEFAULT 'PREPARED',
  "requestFingerprint" TEXT,
  "paymentUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PaymentAttempt_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PaymentAttempt_state_check" CHECK ("state" IN ('PREPARED', 'REQUESTING', 'LINK_READY', 'UNKNOWN', 'VERIFIED'))
);
CREATE UNIQUE INDEX "PaymentAttempt_orderId_key" ON "PaymentAttempt"("orderId");
CREATE INDEX "PaymentAttempt_state_idx" ON "PaymentAttempt"("state");

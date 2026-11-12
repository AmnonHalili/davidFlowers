-- Reviewed rollout prerequisite; never run as part of next build.
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'PAYMENT_REVIEW';
CREATE TABLE "PaymentVerification" (
    "transactionId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderStatusAtVerification" TEXT NOT NULL,
    "fulfillmentState" TEXT NOT NULL DEFAULT 'REQUIRES_REVIEW',
    CONSTRAINT "PaymentVerification_pkey" PRIMARY KEY ("transactionId")
);
CREATE INDEX "PaymentVerification_orderId_idx" ON "PaymentVerification"("orderId");
CREATE INDEX "PaymentVerification_fulfillmentState_idx" ON "PaymentVerification"("fulfillmentState");

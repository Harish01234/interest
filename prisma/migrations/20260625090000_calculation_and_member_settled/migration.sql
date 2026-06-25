-- AlterTable: Member soft-delete timestamp + interest (interest may already exist on some envs)
ALTER TABLE "member" ADD COLUMN IF NOT EXISTS "interest" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "member" ADD COLUMN IF NOT EXISTS "settledAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "member_settledAt_idx" ON "member"("settledAt");

-- CreateTable
CREATE TABLE IF NOT EXISTS "calculation" (
    "id" SERIAL NOT NULL,
    "TotalTobill" INTEGER NOT NULL DEFAULT 0,
    "Asol" INTEGER NOT NULL DEFAULT 0,
    "Interest" INTEGER NOT NULL DEFAULT 0,
    "Dewa" INTEGER NOT NULL DEFAULT 0,
    "CashInHome" INTEGER NOT NULL DEFAULT 0,
    "CashInShop" INTEGER NOT NULL DEFAULT 0,
    "cashToPersons" JSONB NOT NULL DEFAULT '[]',
    "periodStartedAt" TIMESTAMP(3),
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calculation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "main_calculation" (
    "id" SERIAL NOT NULL,
    "TotalTobill" INTEGER NOT NULL,
    "interest" INTEGER NOT NULL,
    "Bandak" INTEGER NOT NULL,
    "jinisChara" INTEGER NOT NULL,
    "cash" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "main_calculation_pkey" PRIMARY KEY ("id")
);

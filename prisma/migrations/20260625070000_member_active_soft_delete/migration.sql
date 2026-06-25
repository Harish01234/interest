-- AlterTable
ALTER TABLE "member" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "member_active_idx" ON "member"("active");

-- CreateIndex
CREATE INDEX "member_active_slNo_idx" ON "member"("active", "slNo");

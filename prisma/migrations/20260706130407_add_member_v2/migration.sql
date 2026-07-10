-- CreateTable
CREATE TABLE "member_v2" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "credit" INTEGER NOT NULL DEFAULT 0,
    "percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "mobileNo" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "member_v2_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "member_v2_name_idx" ON "member_v2"("name");

-- CreateIndex
CREATE INDEX "member_v2_mobileNo_idx" ON "member_v2"("mobileNo");

-- CreateIndex
CREATE INDEX "member_v2_active_idx" ON "member_v2"("active");

-- CreateIndex
CREATE INDEX "member_v2_date_idx" ON "member_v2"("date");

-- CreateIndex
CREATE INDEX "member_v2_userId_idx" ON "member_v2"("userId");

-- AddForeignKey
ALTER TABLE "member_v2" ADD CONSTRAINT "member_v2_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "MemberType" AS ENUM ('gold', 'silver', 'both', 'unknown');

-- CreateTable
CREATE TABLE "member" (
    "id" SERIAL NOT NULL,
    "slNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fatherName" TEXT NOT NULL,
    "credit" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "phoneNo" TEXT NOT NULL,
    "type" "MemberType" NOT NULL DEFAULT 'unknown',
    "jinsis" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "member_slNo_idx" ON "member"("slNo");

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

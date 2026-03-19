-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "Company" ADD COLUMN "businessNo" TEXT,
ADD COLUMN "status" "CompanyStatus" NOT NULL DEFAULT 'ACTIVE';

CREATE UNIQUE INDEX "Company_businessNo_key" ON "Company"("businessNo");

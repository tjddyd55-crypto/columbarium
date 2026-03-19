-- AlterTable (Site: 시설별 재판매 수수료 %)
ALTER TABLE "Site" ADD COLUMN "resaleFeePercent" INTEGER;

-- AlterTable (SeatResaleTransaction: 플랫폼 수수료)
ALTER TABLE "SeatResaleTransaction" ADD COLUMN "platformFee" INTEGER NOT NULL DEFAULT 0;

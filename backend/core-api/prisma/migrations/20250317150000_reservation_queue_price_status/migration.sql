-- AlterEnum: add RESERVED to ReservationStatus (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'ReservationStatus' AND e.enumlabel = 'RESERVED'
  ) THEN
    ALTER TYPE "ReservationStatus" ADD VALUE 'RESERVED';
  END IF;
END $$;

-- AlterTable: add queueOrder (nullable), price (default 0)
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "queueOrder" INTEGER;
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "price" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex for (seatId, status, queueOrder)
CREATE INDEX IF NOT EXISTS "Reservation_seatId_status_queueOrder_idx" ON "Reservation"("seatId", "status", "queueOrder");

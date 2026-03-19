-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('FIXED_PRICE', 'MARKET_PRICE', 'NEGOTIABLE');

-- CreateTable
CREATE TABLE "SeatResaleListing" (
    "id" BIGSERIAL NOT NULL,
    "reservationId" BIGINT NOT NULL,
    "sellerId" BIGINT NOT NULL,
    "pricingType" "PricingType" NOT NULL,
    "price" INTEGER,
    "marketRefPrice" INTEGER,
    "minPrice" INTEGER,
    "maxPrice" INTEGER,
    "status" "ResaleStatus" NOT NULL DEFAULT 'LISTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeatResaleListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeatResaleTransaction" (
    "id" BIGSERIAL NOT NULL,
    "listingId" BIGINT NOT NULL,
    "reservationId" BIGINT NOT NULL,
    "buyerId" BIGINT NOT NULL,
    "finalPrice" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeatResaleTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SeatResaleListing_reservationId_key" ON "SeatResaleListing"("reservationId");

-- CreateIndex
CREATE INDEX "SeatResaleListing_status_idx" ON "SeatResaleListing"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SeatResaleTransaction_listingId_key" ON "SeatResaleTransaction"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "SeatResaleTransaction_reservationId_key" ON "SeatResaleTransaction"("reservationId");

-- AddForeignKey
ALTER TABLE "SeatResaleListing" ADD CONSTRAINT "SeatResaleListing_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatResaleListing" ADD CONSTRAINT "SeatResaleListing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatResaleTransaction" ADD CONSTRAINT "SeatResaleTransaction_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "SeatResaleListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatResaleTransaction" ADD CONSTRAINT "SeatResaleTransaction_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatResaleTransaction" ADD CONSTRAINT "SeatResaleTransaction_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

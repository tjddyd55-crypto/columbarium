-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('CONFIRMED', 'WAITING', 'CANCELLED');

-- CreateTable
CREATE TABLE "Company" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Site" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "companyId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" BIGSERIAL NOT NULL,
    "facilityId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "rows" INTEGER NOT NULL,
    "cols" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seat" (
    "id" BIGSERIAL NOT NULL,
    "sectionId" BIGINT NOT NULL,
    "row" INTEGER NOT NULL,
    "col" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Seat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "seatId" BIGINT NOT NULL,
    "status" "ReservationStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeatPolicy" (
    "id" BIGSERIAL NOT NULL,
    "facilityId" BIGINT NOT NULL,
    "maxWaiting" INTEGER,
    "maxYears" INTEGER,

    CONSTRAINT "SeatPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reservation_seatId_status_idx" ON "Reservation"("seatId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SeatPolicy_facilityId_key" ON "SeatPolicy"("facilityId");

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "Seat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatPolicy" ADD CONSTRAINT "SeatPolicy_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

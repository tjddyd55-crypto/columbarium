import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessError, ErrorCode } from '../common/errors/business.error';
import { PricingType, ResaleStatus } from '@prisma/client';

/**
 * 재판매(SeatResale)와 AGENT 정책 (초기):
 * - 재판매 거래에는 새로운 agentCode를 적용하지 않는다.
 * - Reservation.agentId·Commission은 최초 판매(좌석 예약 시 agentCode) 시점만 인정한다.
 * - buyListing 시 소유권만 이전하며, 에이전트 커미션 재발생·재배분 로직은 두지 않는다.
 * - 향후 “재판매 수수료/신규 소개” 등이 필요하면 별도 모델·정책 플래그로 확장할 것.
 */

/** 재판매 가격 상한 배수 (originalPrice * 이 값). 시설 설정으로 대체 가능 */
const RESALE_MAX_PRICE_MULTIPLE = 2;
/** 재판매 등록 가능일: 예약 확정일로부터 이 값(일) 이후만 등록 가능 */
const RESALE_ELIGIBLE_DAYS = 30;

export interface CreateSeatResaleListBody {
  reservationId: string;
  pricingType: PricingType;
  price?: number;
  marketRefPrice?: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface BuySeatResaleBody {
  offerPrice?: number; // NEGOTIABLE일 때 필수
}

@Injectable()
export class SeatResaleService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 시세 계산: listing.marketRefPrice 우선, 없으면 동일 시설 최근 거래 평균.
   */
  private async getMarketPrice(listing: {
    marketRefPrice: number | null;
    reservation: { seat: { section: { facilityId: bigint } } };
  }): Promise<number | null> {
    if (listing.marketRefPrice != null && listing.marketRefPrice > 0) {
      return listing.marketRefPrice;
    }
    const facilityId = listing.reservation.seat.section.facilityId;
    const avg = await this.prisma.seatResaleTransaction.aggregate({
      where: {
        listing: { reservation: { seat: { section: { facilityId } } } },
      },
      _avg: { finalPrice: true },
      _count: true,
    });
    if (avg._count > 0 && avg._avg.finalPrice != null) {
      return Math.round(avg._avg.finalPrice);
    }
    return null;
  }

  /** POST /resale/list - 좌석 재판매 등록 */
  async createListing(userId: string, body: CreateSeatResaleListBody) {
    const uid = BigInt(userId);
    const reservationId = BigInt(body.reservationId);

    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { seat: true },
    });
    if (!reservation) throw new BusinessError(ErrorCode.NOT_FOUND, '예약을 찾을 수 없습니다.', 404);
    if (reservation.userId !== uid) throw new BusinessError(ErrorCode.RESALE_NOT_OWNER, '본인 소유의 예약만 등록할 수 있습니다.', 403);
    if (reservation.status !== 'CONFIRMED') {
      throw new BusinessError(ErrorCode.RESERVATION_NOT_CONFIRMED, '결제 확정(CONFIRMED)된 예약만 재판매 등록할 수 있습니다.', 400);
    }

    const existing = await this.prisma.seatResaleListing.findUnique({
      where: { reservationId },
    });
    if (existing && existing.status === ResaleStatus.LISTED) {
      throw new BusinessError(ErrorCode.RESALE_ALREADY_LISTED, '이미 등록된 재판매 건이 있습니다.', 400);
    }

    const eligibleAt = new Date(reservation.createdAt.getTime() + RESALE_ELIGIBLE_DAYS * 24 * 60 * 60 * 1000);
    if (eligibleAt > new Date()) {
      console.log('[RESALE_PRICE_VALIDATION_FAILED]', { reason: 'RESALE_TOO_EARLY', reservationId: body.reservationId, createdAt: reservation.createdAt.toISOString() });
      throw new BusinessError(
        ErrorCode.RESALE_TOO_EARLY,
        `재판매는 예약 확정일로부터 ${RESALE_ELIGIBLE_DAYS}일 이후에만 가능합니다.`,
        400,
      );
    }

    const originalPrice = reservation.price;
    const maxPriceAllowed = originalPrice * RESALE_MAX_PRICE_MULTIPLE;

    const { pricingType, price, marketRefPrice, minPrice, maxPrice } = body;

    if (pricingType === 'FIXED_PRICE') {
      if (price == null || price <= 0) {
        throw new BusinessError(ErrorCode.RESALE_FIXED_PRICE_REQUIRED, '고정가(FIXED_PRICE)는 price(>0)가 필요합니다.', 400);
      }
      if (price < originalPrice || price > maxPriceAllowed) {
        console.log('[RESALE_PRICE_VALIDATION_FAILED]', { reason: 'FIXED_PRICE_OUT_OF_RANGE', originalPrice, price, maxAllowed: maxPriceAllowed });
        throw new BusinessError(
          ErrorCode.RESALE_PRICE_OUT_OF_RANGE,
          `가격은 원가(${originalPrice}) 이상, 원가의 ${RESALE_MAX_PRICE_MULTIPLE}배(${maxPriceAllowed}) 이하여야 합니다.`,
          400,
        );
      }
    }
    if (pricingType === 'NEGOTIABLE') {
      if (minPrice == null || maxPrice == null) {
        throw new BusinessError(ErrorCode.RESALE_NEGOTIABLE_RANGE, '협의가(NEGOTIABLE)는 minPrice, maxPrice가 필요합니다.', 400);
      }
      if (minPrice > maxPrice) {
        throw new BusinessError(ErrorCode.RESALE_NEGOTIABLE_RANGE, 'minPrice <= maxPrice 여야 합니다.', 400);
      }
      if (minPrice < originalPrice || maxPrice > maxPriceAllowed) {
        console.log('[RESALE_PRICE_VALIDATION_FAILED]', { reason: 'NEGOTIABLE_RANGE_OUT', originalPrice, minPrice, maxPrice, maxAllowed: maxPriceAllowed });
        throw new BusinessError(
          ErrorCode.RESALE_PRICE_OUT_OF_RANGE,
          `min/max는 원가(${originalPrice}) 이상, 원가의 ${RESALE_MAX_PRICE_MULTIPLE}배(${maxPriceAllowed}) 이하여야 합니다.`,
          400,
        );
      }
    }
    if (pricingType === 'MARKET_PRICE' && marketRefPrice != null && marketRefPrice > 0) {
      if (marketRefPrice < originalPrice || marketRefPrice > maxPriceAllowed) {
        console.log('[RESALE_PRICE_VALIDATION_FAILED]', { reason: 'MARKET_REF_OUT_OF_RANGE', originalPrice, marketRefPrice, maxAllowed: maxPriceAllowed });
        throw new BusinessError(
          ErrorCode.RESALE_PRICE_OUT_OF_RANGE,
          `참고가는 원가(${originalPrice}) 이상, 원가의 ${RESALE_MAX_PRICE_MULTIPLE}배(${maxPriceAllowed}) 이하여야 합니다.`,
          400,
        );
      }
    }

    const listing = await this.prisma.seatResaleListing.create({
      data: {
        reservationId,
        sellerId: uid,
        pricingType,
        price: price ?? undefined,
        marketRefPrice: marketRefPrice ?? undefined,
        minPrice: minPrice ?? undefined,
        maxPrice: maxPrice ?? undefined,
        status: ResaleStatus.LISTED,
      },
    });
    console.log('[SEAT_RESALE_LIST]', { listingId: String(listing.id), reservationId: body.reservationId, pricingType });
    return {
      id: String(listing.id),
      reservationId: body.reservationId,
      pricingType: listing.pricingType,
      price: listing.price,
      marketRefPrice: listing.marketRefPrice,
      minPrice: listing.minPrice,
      maxPrice: listing.maxPrice,
      status: listing.status,
      createdAt: listing.createdAt.toISOString(),
    };
  }

  /** POST /resale/seat/:id/buy - 좌석 재판매 구매 (동일 listing 동시 구매 방지: FOR UPDATE) */
  async buyListing(userId: string, listingId: string, body: BuySeatResaleBody = {}) {
    const buyerId = BigInt(userId);
    const lid = BigInt(listingId);

    return this.prisma.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<{ id: bigint }[]>(
        Prisma.sql`SELECT id FROM "SeatResaleListing" WHERE id = ${lid} FOR UPDATE`,
      );
      if (!locked?.length) {
        throw new BusinessError(ErrorCode.NOT_FOUND, '재판매 글을 찾을 수 없습니다.', 404);
      }

      const listing = await tx.seatResaleListing.findUnique({
        where: { id: lid },
        include: {
          reservation: { include: { seat: { include: { section: { include: { site: true } } } } } },
        },
      });
      if (!listing) throw new BusinessError(ErrorCode.NOT_FOUND, '재판매 글을 찾을 수 없습니다.', 404);
      if (listing.status !== ResaleStatus.LISTED) {
        console.log('[RESALE_CONCURRENT_BUY_PREVENTED]', { listingId, currentStatus: listing.status });
        throw new BusinessError(ErrorCode.RESALE_NOT_LISTED, '판매 중(LISTED)인 글만 구매할 수 있습니다.', 400);
      }
      if (listing.sellerId === buyerId) {
        throw new BusinessError(ErrorCode.UNAUTHORIZED, '본인 판매 글은 구매할 수 없습니다.', 400);
      }

      let finalPrice: number;

      if (listing.pricingType === 'FIXED_PRICE') {
        if (listing.price == null || listing.price <= 0) {
          throw new BusinessError(ErrorCode.RESALE_FIXED_PRICE_REQUIRED, '고정가가 설정되지 않았습니다.', 400);
        }
        finalPrice = listing.price;
      } else if (listing.pricingType === 'MARKET_PRICE') {
        const market = await this.getMarketPrice(listing);
        if (market == null) {
          throw new BusinessError(ErrorCode.RESALE_MARKET_PRICE_FAILED, '시세 계산에 실패했습니다. marketRefPrice를 설정해 주세요.', 400);
        }
        finalPrice = market;
      } else {
        const offer = body.offerPrice;
        if (offer == null) {
          throw new BusinessError(ErrorCode.RESALE_OFFER_OUT_OF_RANGE, '협의가 건은 offerPrice가 필요합니다.', 400);
        }
        const min = listing.minPrice ?? 0;
        const max = listing.maxPrice ?? Number.MAX_SAFE_INTEGER;
        if (offer < min || offer > max) {
          throw new BusinessError(ErrorCode.RESALE_OFFER_OUT_OF_RANGE, `제안가는 ${min} ~ ${max} 범위여야 합니다.`, 400);
        }
        finalPrice = offer;
      }

      const site = listing.reservation.seat.section.site;
      const feePercent = site?.resaleFeePercent ?? 0;
      const platformFee = Math.round((finalPrice * feePercent) / 100);
      console.log('[RESALE_FEE]', { listingId, finalPrice, feePercent, platformFee });

      // 결제 진행 (실제 PG 연동은 생략, 여기서는 상태만 변경)
      // 5. Reservation.userId → buyerId
      await tx.reservation.update({
        where: { id: listing.reservationId },
        data: { userId: buyerId },
      });
      // 6. listing → SOLD
      await tx.seatResaleListing.update({
        where: { id: lid },
        data: { status: ResaleStatus.SOLD },
      });
      // 7. ResaleTransaction 생성 (platformFee 포함)
      const txn = await tx.seatResaleTransaction.create({
        data: {
          listingId: lid,
          reservationId: listing.reservationId,
          buyerId,
          finalPrice,
          platformFee,
        },
      });
      console.log('[SEAT_RESALE_BUY]', { listingId, finalPrice, platformFee, transactionId: String(txn.id) });
      return {
        transactionId: String(txn.id),
        listingId: listingId,
        reservationId: String(listing.reservationId),
        finalPrice: txn.finalPrice,
        platformFee: txn.platformFee,
        createdAt: txn.createdAt.toISOString(),
      };
    });
  }
}

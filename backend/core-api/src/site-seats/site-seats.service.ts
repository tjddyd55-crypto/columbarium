import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessError, ErrorCode } from '../common/errors/business.error';
import { getSeatState, type SeatStatus } from '../common/utils/seat-state.util';
import { CommissionStatus, ReservationStatus } from '@prisma/client';

/** RESERVED 타임아웃(분). 만료 시 자동 CANCELLED 처리 */
const RESERVED_EXPIRE_MINUTES = 10;

@Injectable()
export class SiteSeatsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 만료된 RESERVED 예약을 CANCELLED로 일괄 처리.
   * reserve/wait/cancel/조회 시 호출(방법 1 권장).
   * @param tx 트랜잭션 내에서 호출 시 전달. 없으면 단독 실행.
   * @returns 취소된 건수
   */
  private async cancelExpiredReserved(
    tx?: Pick<PrismaService, 'reservation'>,
  ): Promise<number> {
    const now = new Date();
    const client = tx ?? this.prisma;
    const result = await client.reservation.updateMany({
      where: {
        status: ReservationStatus.RESERVED,
        expiresAt: { not: null, lt: now },
      },
      data: { status: ReservationStatus.CANCELLED },
    });
    if (result.count > 0) {
      console.log('[RESERVED_EXPIRED_AUTO_CANCEL]', { count: result.count, now: now.toISOString() });
    }
    return result.count;
  }

  async listFacilities() {
    const sites = await this.prisma.site.findMany({
      orderBy: { createdAt: 'desc' },
      include: { company: true },
    });
    return sites.map((s) => ({
      id: String(s.id),
      name: s.name,
      address: s.address,
      companyId: String(s.companyId),
      companyName: s.company.name,
      createdAt: s.createdAt.toISOString(),
    }));
  }

  async getFacilityById(id: bigint) {
    const site = await this.prisma.site.findUnique({
      where: { id },
      include: { company: true, sections: true },
    });
    if (!site) throw new BusinessError(ErrorCode.NOT_FOUND, '시설을 찾을 수 없습니다.', 404);
    return {
      id: String(site.id),
      name: site.name,
      address: site.address,
      companyId: String(site.companyId),
      companyName: site.company.name,
      sectionCount: site.sections.length,
      createdAt: site.createdAt.toISOString(),
    };
  }

  async getSeatsByFacilityId(facilityId: bigint) {
    await this.cancelExpiredReserved();

    const site = await this.prisma.site.findUnique({
      where: { id: facilityId },
      include: {
        sections: { include: { seats: { include: { reservations: true } } } },
        policies: true,
      },
    });
    if (!site) throw new BusinessError(ErrorCode.NOT_FOUND, '시설을 찾을 수 없습니다.', 404);

    const policy = site.policies[0] ?? null;
    const result: { id: number; row: number; col: number; price: number; status: SeatStatus; waitingCount: number }[] = [];

    for (const section of site.sections) {
      for (const seat of section.seats) {
        const reservations = seat.reservations.map((r) => ({ status: r.status, expiresAt: r.expiresAt }));
        const waitingCount = seat.reservations.filter((r) => r.status === ReservationStatus.WAITING).length;
        const status = getSeatState(
          {
            id: seat.id,
            row: seat.row,
            col: seat.col,
            price: seat.price,
            isBlocked: seat.isBlocked,
          },
          reservations,
          policy ? { maxWaiting: policy.maxWaiting, maxYears: policy.maxYears } : null,
        );
        result.push({
          id: Number(seat.id),
          row: seat.row,
          col: seat.col,
          price: seat.price,
          status,
          waitingCount,
        });
      }
    }

    return result;
  }

  /** 좌석 행 락 (트랜잭션 내에서 호출) */
  private async lockSeat(tx: Pick<PrismaService, '$executeRaw'>, seatId: bigint) {
    await tx.$executeRaw(Prisma.sql`SELECT 1 FROM "Seat" WHERE id = ${seatId} FOR UPDATE`);
  }

  /** 즉시 예약: GREEN → RESERVED 생성, price·expiresAt 저장. agentCode 시 Agent·Commission 연결. */
  async reserveSeat(seatId: bigint, userId: string, opts?: { agentCode?: string }) {
    const userIdBig = BigInt(userId);
    const agentCodeTrimmed = opts?.agentCode?.trim() || undefined;
    return this.prisma.$transaction(async (tx) => {
      await this.cancelExpiredReserved(tx);
      await this.lockSeat(tx, seatId);
      const seat = await tx.seat.findUnique({
        where: { id: seatId },
        include: { section: { include: { site: true } }, reservations: true },
      });
      if (!seat) throw new BusinessError(ErrorCode.NOT_FOUND, '좌석을 찾을 수 없습니다.', 404);
      if (seat.isBlocked) throw new BusinessError(ErrorCode.SEAT_BLOCKED, '차단된 좌석입니다.', 400);

      const policy = await tx.seatPolicy.findUnique({
        where: { facilityId: seat.section.facilityId },
      });
      const reservations = seat.reservations.map((r) => ({ status: r.status, expiresAt: r.expiresAt }));
      const status = getSeatState(
        { id: seat.id, row: seat.row, col: seat.col, price: seat.price, isBlocked: seat.isBlocked },
        reservations,
        policy ? { maxWaiting: policy.maxWaiting, maxYears: policy.maxYears } : null,
      );
      if (status !== 'GREEN') {
        throw new BusinessError(ErrorCode.SEAT_NOT_GREEN, '즉시 구매 가능한 좌석이 아닙니다.', 400);
      }
      const occupied = seat.reservations.some(
        (r) => r.status === ReservationStatus.RESERVED || r.status === ReservationStatus.CONFIRMED,
      );
      if (occupied) {
        throw new BusinessError(ErrorCode.CONFIRMED_ALREADY_EXISTS, '이미 예약/확정된 좌석입니다.', 400);
      }

      const lockedPrice = seat.price;
      const expiresAt = new Date(Date.now() + RESERVED_EXPIRE_MINUTES * 60 * 1000);

      let agentId: bigint | undefined;
      if (agentCodeTrimmed) {
        const agent = await tx.agent.findUnique({ where: { code: agentCodeTrimmed } });
        if (!agent) {
          throw new BusinessError(ErrorCode.AGENT_CODE_INVALID, '유효하지 않은 에이전트 코드입니다.', 400);
        }
        if (agent.companyId !== seat.section.site.companyId) {
          throw new BusinessError(
            ErrorCode.AGENT_COMPANY_MISMATCH,
            '해당 시설과 연결되지 않은 에이전트 코드입니다.',
            400,
          );
        }
        agentId = agent.id;
      }

      const reservation = await tx.reservation.create({
        data: {
          seatId,
          userId: userIdBig,
          status: ReservationStatus.RESERVED,
          price: lockedPrice,
          expiresAt,
          ...(agentId != null && { agentId }),
        },
      });

      if (agentId != null) {
        const agentRow = await tx.agent.findUniqueOrThrow({ where: { id: agentId } });
        const amount = Math.round((lockedPrice * agentRow.commissionRate) / 100);
        const commission = await tx.commission.create({
          data: {
            reservationId: reservation.id,
            agentId,
            amount,
            status: CommissionStatus.PENDING,
          },
        });
        console.log('[RESERVE_AGENT_LINK]', {
          reservationId: String(reservation.id),
          agentId: String(agentId),
          agentCode: agentCodeTrimmed,
        });
        console.log('[COMMISSION_CREATED]', {
          commissionId: String(commission.id),
          reservationId: String(reservation.id),
          agentId: String(agentId),
          amount,
        });
      }

      console.log('[RESERVE_PRICE_LOCK]', {
        reservationId: String(reservation.id),
        seatId: String(seatId),
        price: reservation.price,
        expiresAt: expiresAt.toISOString(),
        agentId: agentId != null ? String(agentId) : null,
      });
      return {
        id: String(reservation.id),
        seatId: String(seatId),
        status: reservation.status,
        price: reservation.price,
        expiresAt: reservation.expiresAt?.toISOString() ?? null,
        agentId: agentId != null ? String(agentId) : null,
        createdAt: reservation.createdAt.toISOString(),
      };
    });
  }

  /** 대기 등록: YELLOW → WAITING, queueOrder = max(queueOrder)+1. 트랜잭션 + seat lock */
  async waitSeat(seatId: bigint, userId: string) {
    const userIdBig = BigInt(userId);
    return this.prisma.$transaction(async (tx) => {
      await this.cancelExpiredReserved(tx);
      await this.lockSeat(tx, seatId);
      const seat = await tx.seat.findUnique({
        where: { id: seatId },
        include: { section: true, reservations: true },
      });
      if (!seat) throw new BusinessError(ErrorCode.NOT_FOUND, '좌석을 찾을 수 없습니다.', 404);
      if (seat.isBlocked) throw new BusinessError(ErrorCode.SEAT_BLOCKED, '차단된 좌석입니다.', 400);

      const policy = await tx.seatPolicy.findUnique({
        where: { facilityId: seat.section.facilityId },
      });
      const reservations = seat.reservations.map((r) => ({ status: r.status, expiresAt: r.expiresAt }));
      const status = getSeatState(
        { id: seat.id, row: seat.row, col: seat.col, price: seat.price, isBlocked: seat.isBlocked },
        reservations,
        policy ? { maxWaiting: policy.maxWaiting, maxYears: policy.maxYears } : null,
      );
      if (status !== 'YELLOW') {
        throw new BusinessError(ErrorCode.SEAT_NOT_YELLOW, '대기 가능한 좌석이 아닙니다.', 400);
      }
      const waitingCount = seat.reservations.filter((r) => r.status === ReservationStatus.WAITING).length;
      if (policy?.maxWaiting != null && waitingCount >= policy.maxWaiting) {
        throw new BusinessError(ErrorCode.WAITING_LIMIT_REACHED, '대기 인원이 마감되었습니다.', 400);
      }
      const alreadyWaiting = seat.reservations.some(
        (r) => r.status === ReservationStatus.WAITING && r.userId === userIdBig,
      );
      if (alreadyWaiting) {
        throw new BusinessError(ErrorCode.DUPLICATE_WAITING, '이미 이 좌석에 대기 중입니다.', 400);
      }

      const maxOrder = await tx.reservation.aggregate({
        where: { seatId, status: ReservationStatus.WAITING },
        _max: { queueOrder: true },
      });
      const nextOrder = (maxOrder._max.queueOrder ?? 0) + 1;

      const reservation = await tx.reservation.create({
        data: {
          seatId,
          userId: userIdBig,
          status: ReservationStatus.WAITING,
          queueOrder: nextOrder,
          price: 0,
        },
      });
      return {
        id: String(reservation.id),
        seatId: String(seatId),
        status: reservation.status,
        queueOrder: reservation.queueOrder,
        createdAt: reservation.createdAt.toISOString(),
      };
    });
  }

  /** 결제 실패: RESERVED → CANCELLED (POST /payments/fail) */
  async recordPaymentFailure(reservationId: bigint) {
    const r = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
    });
    if (!r) throw new BusinessError(ErrorCode.NOT_FOUND, '예약을 찾을 수 없습니다.', 404);
    if (r.status !== ReservationStatus.RESERVED) {
      throw new BusinessError(ErrorCode.SEAT_NOT_AVAILABLE, '결제 대기 상태(RESERVED)만 실패 처리할 수 있습니다.', 400);
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.reservation.update({
        where: { id: reservationId },
        data: { status: ReservationStatus.CANCELLED },
      });
      await tx.commission.updateMany({
        where: { reservationId, status: CommissionStatus.PENDING },
        data: { status: CommissionStatus.CANCELLED },
      });
    });
    console.log('[PAYMENT_FAIL]', { reservationId: String(reservationId), previousStatus: r.status });
    return { reservationId: String(reservationId), status: 'CANCELLED' };
  }

  /** 결제 완료: RESERVED → CONFIRMED */
  async confirmPayment(reservationId: bigint, userId: string) {
    const userIdBig = BigInt(userId);
    const r = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { seat: true },
    });
    if (!r) throw new BusinessError(ErrorCode.NOT_FOUND, '예약을 찾을 수 없습니다.', 404);
    if (r.userId !== userIdBig) throw new BusinessError(ErrorCode.UNAUTHORIZED, '본인 예약만 결제할 수 있습니다.', 403);
    if (r.status !== ReservationStatus.RESERVED) {
      throw new BusinessError(ErrorCode.SEAT_NOT_AVAILABLE, '결제 대기 상태(RESERVED)가 아닙니다.', 400);
    }
    const updated = await this.prisma.reservation.update({
      where: { id: reservationId },
      data: { status: ReservationStatus.CONFIRMED },
    });
    return {
      id: String(updated.id),
      status: updated.status,
      price: updated.price,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  /** 예약 취소. CONFIRMED 취소 시 1번 대기 → CONFIRMED 승격, 나머지 queueOrder -1. 트랜잭션 + seat lock */
  async cancelReservation(reservationId: bigint, userId: string) {
    const userIdBig = BigInt(userId);
    return this.prisma.$transaction(async (tx) => {
      await this.cancelExpiredReserved(tx);
      const r = await tx.reservation.findUnique({
        where: { id: reservationId },
        include: { seat: true },
      });
      if (!r) throw new BusinessError(ErrorCode.NOT_FOUND, '예약을 찾을 수 없습니다.', 404);
      if (r.userId !== userIdBig) throw new BusinessError(ErrorCode.UNAUTHORIZED, '본인 예약만 취소할 수 있습니다.', 403);
      if (r.status !== ReservationStatus.RESERVED && r.status !== ReservationStatus.CONFIRMED) {
        throw new BusinessError(ErrorCode.SEAT_NOT_AVAILABLE, '예약 또는 확정 상태만 취소할 수 있습니다.', 400);
      }

      await this.lockSeat(tx, r.seatId);

      await tx.reservation.update({
        where: { id: reservationId },
        data: { status: ReservationStatus.CANCELLED },
      });
      await tx.commission.updateMany({
        where: { reservationId, status: CommissionStatus.PENDING },
        data: { status: CommissionStatus.CANCELLED },
      });

      const promoted: { id: string; queueOrder: number } | null = null;
      if (r.status === ReservationStatus.CONFIRMED) {
        const firstWaiting = await tx.reservation.findFirst({
          where: { seatId: r.seatId, status: ReservationStatus.WAITING },
          orderBy: { queueOrder: 'asc' },
        });
        if (firstWaiting) {
          await tx.reservation.update({
            where: { id: firstWaiting.id },
            data: {
              status: ReservationStatus.CONFIRMED,
              price: r.price,
              queueOrder: null,
            },
          });
          const rest = await tx.reservation.findMany({
            where: { seatId: r.seatId, status: ReservationStatus.WAITING, id: { not: firstWaiting.id } },
            orderBy: { queueOrder: 'asc' },
          });
          for (const w of rest) {
            if (w.queueOrder != null) {
              await tx.reservation.update({
                where: { id: w.id },
                data: { queueOrder: w.queueOrder - 1 },
              });
            }
          }
          // Log for [7] output
          console.log('[CANCEL_PROMOTION]', {
            cancelledReservationId: String(reservationId),
            promotedReservationId: String(firstWaiting.id),
            seatId: String(r.seatId),
          });
          return {
            id: String(reservationId),
            status: 'CANCELLED',
            promoted: { id: String(firstWaiting.id), queueOrder: firstWaiting.queueOrder },
          };
        }
      }
      return { id: String(reservationId), status: 'CANCELLED', promoted: null };
    });
  }
}

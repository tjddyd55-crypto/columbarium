import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueueStatus } from '@prisma/client';
import { UnitService } from '../units/unit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';
import { BusinessError, ErrorCode } from '../common/errors/business.error';

const ACTIVE_EXPIRES_HOURS = 24;

@Injectable()
export class QueueService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly unitService: UnitService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * 대기열 참여. 동일 user + unit 중복 불가. position = max+1. 트랜잭션으로 동시성 처리.
   */
  async joinQueue(userId: string, unitId: string) {
    const uid = BigInt(userId);
    const uId = BigInt(unitId);

    const unit = await this.unitService.getUnitById(uId);

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.queueEntry.findUnique({
        where: { unitId_userId: { unitId: uId, userId: uid } },
      });
      if (existing && (existing.status === 'WAITING' || existing.status === 'ACTIVE'))
        throw new BusinessError(ErrorCode.QUEUE_ALREADY_JOINED, '이미 해당 칸에 대기 중입니다.', 400);

      const maxPos = await tx.queueEntry.aggregate({
        where: { unitId: uId },
        _max: { queuePosition: true },
      });
      const nextPosition = (maxPos._max.queuePosition ?? 0) + 1;

      const entry = await tx.queueEntry.create({
        data: {
          operatorId: unit.operatorId,
          facilityId: unit.facilityId,
          unitId: uId,
          userId: uid,
          queuePosition: nextPosition,
          status: QueueStatus.WAITING,
        },
        include: { unit: { include: { facility: true } } },
      });

      await this.unitService.syncUnitStatus(uId, tx as any);
      return {
        id: String(entry.id),
        unitId: String(entry.unitId),
        unitCode: entry.unit.unitCode,
        facilityName: entry.unit.facility!.name,
        queuePosition: entry.queuePosition,
        status: entry.status,
        createdAt: entry.createdAt.toISOString(),
      };
    });
  }

  /**
   * WAITING 상태만 취소 가능.
   */
  async cancelQueue(userId: string, queueEntryId: string) {
    const uid = BigInt(userId);
    const qid = BigInt(queueEntryId);

    return this.prisma.$transaction(async (tx) => {
      const entry = await tx.queueEntry.findFirst({
        where: { id: qid, userId: uid },
        include: { unit: true },
      });
      if (!entry) throw new BusinessError(ErrorCode.NOT_FOUND, '대기열 정보를 찾을 수 없습니다.', 404);
      if (entry.status !== QueueStatus.WAITING)
        throw new BusinessError(ErrorCode.INVALID_QUEUE_STATE, '대기 중인 건만 취소할 수 있습니다.', 400);

      await tx.queueEntry.update({
        where: { id: qid },
        data: { status: QueueStatus.CANCELLED },
      });
      await this.unitService.syncUnitStatus(entry.unitId, tx as any);
      return { cancelled: true };
    });
  }

  /**
   * 내 대기열 목록 (unit, 순번, 앞 대기 수, 상태, 예상 정보)
   */
  async getMyQueues(userId: string) {
    const uid = BigInt(userId);
    const entries = await this.prisma.queueEntry.findMany({
      where: { userId: uid },
      orderBy: [{ unitId: 'asc' }, { queuePosition: 'asc' }],
      include: {
        unit: { include: { facility: true } },
      },
    });

    const result = await Promise.all(
      entries.map(async (e) => {
        const aheadCount =
          e.status === 'WAITING'
            ? await this.prisma.queueEntry.count({
                where: { unitId: e.unitId, status: 'WAITING', queuePosition: { lt: e.queuePosition } },
              })
            : 0;
        return {
          id: String(e.id),
          unitId: String(e.unitId),
          unitCode: e.unit.unitCode,
          facilityName: e.unit.facility.name,
          queuePosition: e.queuePosition,
          aheadCount,
          status: e.status,
          activatedAt: e.activatedAt?.toISOString() ?? null,
          expiresAt: e.expiresAt?.toISOString() ?? null,
          createdAt: e.createdAt.toISOString(),
        };
      }),
    );
    return result;
  }

  /**
   * 단일 unit에 대해 다음 WAITING 1건을 ACTIVE로 전환. ACTIVE가 없을 때만.
   * Worker에서 호출.
   */
  async activateNextQueue(unitId: string) {
    const uId = BigInt(unitId);

    return this.prisma.$transaction(async (tx) => {
      const active = await tx.queueEntry.findFirst({
        where: { unitId: uId, status: 'ACTIVE' },
      });
      if (active) return null; // 이미 ACTIVE 있음

      const next = await tx.queueEntry.findFirst({
        where: { unitId: uId, status: 'WAITING' },
        orderBy: { queuePosition: 'asc' },
        include: { unit: { include: { facility: true } } },
      });
      if (!next) return null;

      const now = new Date();
      const expiresAt = new Date(now.getTime() + ACTIVE_EXPIRES_HOURS * 60 * 60 * 1000);

      await tx.queueEntry.update({
        where: { id: next.id },
        data: { status: QueueStatus.ACTIVE, activatedAt: now, expiresAt },
      });
      await this.unitService.syncUnitStatus(uId, tx as any);
      await this.notifications.createMultiChannelNotifications(
        {
          userId: next.userId,
          type: NotificationType.QUEUE_ACTIVE_NOW,
          relatedTable: 'queue_entries',
          relatedId: String(next.id),
          metadata: {
            facilityName: next.unit.facility.name,
            unitCode: next.unit.unitCode,
            unitId: String(next.unitId),
            facilityId: String(next.facilityId),
            queueEntryId: String(next.id),
            expiresAt: expiresAt.toISOString(),
          },
        },
        tx as any,
      );
      await tx.queueEntry.update({
        where: { id: next.id },
        data: { notifiedActiveAt: now },
      });

      return this.prisma.queueEntry.findUnique({
        where: { id: next.id },
        include: { unit: true, user: true },
      });
    });
  }

  /**
   * 만료된 ACTIVE를 EXPIRED로 바꾸고, 해당 unit의 다음 WAITING을 ACTIVE로 승격.
   * Worker에서 주기 호출.
   */
  async expireQueue() {
    const now = new Date();
    const expired = await this.prisma.queueEntry.findMany({
      where: { status: 'ACTIVE', expiresAt: { lt: now } },
      include: { unit: true },
    });

    const results: { expiredId: string; activatedId: string | null }[] = [];
    for (const e of expired) {
      const activated = await this.prisma.$transaction(async (tx) => {
        await tx.queueEntry.update({
          where: { id: e.id },
          data: { status: QueueStatus.EXPIRED },
        });
        await this.unitService.syncUnitStatus(e.unitId, tx as any);

        const next = await tx.queueEntry.findFirst({
          where: { unitId: e.unitId, status: 'WAITING' },
          orderBy: { queuePosition: 'asc' },
          include: { unit: { include: { facility: true } } },
        });
        if (!next) return null;

        const expiresAt = new Date(now.getTime() + ACTIVE_EXPIRES_HOURS * 60 * 60 * 1000);
        await tx.queueEntry.update({
          where: { id: next.id },
          data: { status: QueueStatus.ACTIVE, activatedAt: now, expiresAt },
        });
        await this.unitService.syncUnitStatus(e.unitId, tx as any);
        await this.notifications.createMultiChannelNotifications(
          {
            userId: next.userId,
            type: NotificationType.QUEUE_ACTIVE_NOW,
            relatedTable: 'queue_entries',
            relatedId: String(next.id),
            metadata: {
              facilityName: next.unit.facility.name,
              unitCode: next.unit.unitCode,
              unitId: String(next.unitId),
              facilityId: String(next.facilityId),
              queueEntryId: String(next.id),
              expiresAt: expiresAt.toISOString(),
            },
          },
          tx as any,
        );
        await tx.queueEntry.update({
          where: { id: next.id },
          data: { notifiedActiveAt: now },
        });
        return next;
      });
      results.push({
        expiredId: String(e.id),
        activatedId: activated ? String(activated.id) : null,
      });
    }
    return results;
  }

  /**
   * 단일 대기열 상세 (내 것만)
   */
  async getQueueById(userId: string, queueEntryId: string) {
    const uid = BigInt(userId);
    const qid = BigInt(queueEntryId);
    const entry = await this.prisma.queueEntry.findFirst({
      where: { id: qid, userId: uid },
      include: { unit: { include: { facility: true } } },
    });
    if (!entry) throw new BusinessError(ErrorCode.NOT_FOUND, '대기열 정보를 찾을 수 없습니다.', 404);
    const aheadCount =
      entry.status === 'WAITING'
        ? await this.prisma.queueEntry.count({
            where: { unitId: entry.unitId, status: 'WAITING', queuePosition: { lt: entry.queuePosition } },
          })
        : 0;
    return {
      id: String(entry.id),
      unitId: String(entry.unitId),
      unitCode: entry.unit.unitCode,
      facilityName: entry.unit.facility.name,
      queuePosition: entry.queuePosition,
      aheadCount,
      status: entry.status,
      activatedAt: entry.activatedAt?.toISOString() ?? null,
      expiresAt: entry.expiresAt?.toISOString() ?? null,
      createdAt: entry.createdAt.toISOString(),
    };
  }
}

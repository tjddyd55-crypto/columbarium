import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import { NotificationsService } from './notifications.service';
import { NotificationDispatcherService } from './notification-dispatcher.service';

/** WAITING 순번당 예상 대기 일수 (단순 추정). 추후 facility/operator 정책으로 교체 가능 */
const DAYS_PER_QUEUE_POSITION = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly dispatcher: NotificationDispatcherService,
  ) {}

  /**
   * 매일 09:00 - 7일 전 / 1일 전 리마인더 알림 생성
   */
  @Cron('0 9 * * *')
  async processQueueReminders() {
    const now = new Date();
    const in7d = new Date(now.getTime() + 7 * MS_PER_DAY);
    const in1d = new Date(now.getTime() + 1 * MS_PER_DAY);

    const waiting = await this.prisma.queueEntry.findMany({
      where: { status: 'WAITING' },
      include: { unit: { include: { facility: true } } },
      orderBy: [{ unitId: 'asc' }, { queuePosition: 'asc' }],
    });

    let created7d = 0;
    let created1d = 0;
    for (const e of waiting) {
      const expectedActiveAt = new Date(
        e.createdAt.getTime() +
          (e.queuePosition - 1) * DAYS_PER_QUEUE_POSITION * MS_PER_DAY,
      );
      if (expectedActiveAt >= now && expectedActiveAt <= in7d && !e.notified7dAt) {
        const meta = {
          facilityName: e.unit.facility.name,
          unitCode: e.unit.unitCode,
          unitId: String(e.unitId),
          facilityId: String(e.facilityId),
          queueEntryId: String(e.id),
        };
        await this.notifications.createMultiChannelNotifications({
          userId: e.userId,
          type: NotificationType.QUEUE_7D_REMINDER,
          relatedTable: 'queue_entries',
          relatedId: String(e.id),
          metadata: meta,
        });
        await this.prisma.queueEntry.update({
          where: { id: e.id },
          data: { notified7dAt: now },
        });
        created7d += 1;
      }
      if (expectedActiveAt >= now && expectedActiveAt <= in1d && !e.notified1dAt) {
        const meta = {
          facilityName: e.unit.facility.name,
          unitCode: e.unit.unitCode,
          unitId: String(e.unitId),
          facilityId: String(e.facilityId),
          queueEntryId: String(e.id),
        };
        await this.notifications.createMultiChannelNotifications({
          userId: e.userId,
          type: NotificationType.QUEUE_1D_REMINDER,
          relatedTable: 'queue_entries',
          relatedId: String(e.id),
          metadata: meta,
        });
        await this.prisma.queueEntry.update({
          where: { id: e.id },
          data: { notified1dAt: now },
        });
        created1d += 1;
      }
    }
    this.logger.log(
      `processQueueReminders: 7d=${created7d} 1d=${created1d} scanned=${waiting.length}`,
    );
  }

  /**
   * 1분마다 - PENDING/SCHEDULED 알림 실제 발송
   */
  @Cron('* * * * *')
  async processPendingNotifications() {
    const result = await this.dispatcher.dispatchPendingNotifications();
    if (result.processed > 0) {
      this.logger.log(
        `processPendingNotifications: processed=${result.processed} sent=${result.sent} failed=${result.failed}`,
      );
    }
  }
}

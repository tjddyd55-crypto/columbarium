import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
} from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { NotificationTemplateService } from './notification-template.service';
import { NotificationPolicyService } from './notification-policy.service';
import type {
  CreateNotificationInput,
  NotificationMetadata,
} from './types/notification.types';

function buildDedupeKey(
  type: NotificationType,
  channel: NotificationChannel,
  relatedTable: string | undefined,
  relatedId: string | undefined,
  userId: bigint,
): string {
  const a = [type, channel, relatedTable ?? '', relatedId ?? '', String(userId)];
  return a.join(':');
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly template: NotificationTemplateService,
    private readonly policy: NotificationPolicyService,
  ) {}

  /**
   * 단일 채널 알림 레코드 생성. 중복 키 있으면 스킵.
   */
  async createNotification(
    input: Omit<CreateNotificationInput, 'channels'> & { channel: NotificationChannel },
    tx?: Omit<PrismaService, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>,
  ): Promise<{ id: bigint } | null> {
    const client = (tx ?? this.prisma) as PrismaService;
    const key =
      input.dedupeKey ??
      buildDedupeKey(
        input.type,
        input.channel,
        input.relatedTable,
        input.relatedId,
        input.userId,
      );
    const existing = await client.notification.findUnique({
      where: { dedupeKey: key },
    });
    const skipStatuses: string[] = [
      NotificationStatus.PENDING,
      NotificationStatus.SCHEDULED,
      NotificationStatus.SENT,
    ];
    if (existing && skipStatuses.includes(existing.status)) {
      return null;
    }
    const { title, body } = this.template.build(input.type, input.metadata);
    const n = await client.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title,
        body,
        channel: input.channel,
        status: NotificationStatus.PENDING,
        relatedTable: input.relatedTable,
        relatedId: input.relatedId,
        metadata: (input.metadata ?? {}) as object,
        dedupeKey: key,
      },
    });
    return { id: n.id };
  }

  /**
   * 정책에 따라 다중 채널 알림 생성. 채널별로 dedupe 적용.
   */
  async createMultiChannelNotifications(
    input: Omit<CreateNotificationInput, 'channels'> & { channels?: NotificationChannel[] },
    tx?: Omit<PrismaService, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>,
  ): Promise<number> {
    const channels =
      input.channels ?? this.policy.resolveChannels(input.type);
    let created = 0;
    for (const channel of channels) {
      const { channels: _ch, ...rest } = input;
      const result = await this.createNotification(
        { ...rest, channel },
        tx,
      );
      if (result) created += 1;
    }
    return created;
  }

  async markAsRead(notificationId: bigint, userId: bigint): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: bigint): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        status: { in: [NotificationStatus.PENDING, NotificationStatus.SENT] },
      },
      data: { status: NotificationStatus.READ, readAt: new Date() },
    });
  }

  async getMyNotifications(
    userId: bigint,
    query: { limit?: number; cursor?: string; unreadFirst?: boolean } = {},
  ) {
    const limit = Math.min(query.limit ?? 50, 100);
    const cursor = query.cursor
      ? { id: BigInt(query.cursor) }
      : undefined;
    const orderBy: Prisma.NotificationOrderByWithRelationInput[] = query.unreadFirst
      ? [{ readAt: 'asc' }, { createdAt: 'desc' }]
      : [{ createdAt: 'desc' }];
    const list = await this.prisma.notification.findMany({
      where: { userId },
      orderBy,
      take: limit + 1,
      cursor: cursor ? { id: cursor.id } : undefined,
      skip: cursor ? 1 : 0,
    });
    const nextCursor =
      list.length > limit ? String(list[limit - 1].id) : null;
    const items = list.slice(0, limit);
    return {
      items: items.map((n) => ({
        id: String(n.id),
        type: n.type,
        title: n.title,
        body: n.body,
        channel: n.channel,
        status: n.status,
        relatedTable: n.relatedTable,
        relatedId: n.relatedId,
        metadata: n.metadata,
        readAt: n.readAt?.toISOString() ?? null,
        createdAt: n.createdAt.toISOString(),
      })),
      nextCursor,
    };
  }

  async getUnreadCount(userId: bigint): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        channel: NotificationChannel.IN_APP,
        status: { in: [NotificationStatus.PENDING, NotificationStatus.SENT] },
        readAt: null,
      },
    });
  }

  /** 디스패처/재시도용: 발송 대기 또는 재시도 가능 건 조회 */
  async findDispatchable(limit: number) {
    const now = new Date();
    return this.prisma.notification.findMany({
      where: {
        OR: [
          { status: NotificationStatus.PENDING },
          {
            status: NotificationStatus.SCHEDULED,
            scheduledAt: { lte: now },
          },
          {
            status: NotificationStatus.FAILED,
            retryCount: { lt: 3 },
            scheduledAt: { lte: now },
          },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      include: { user: { select: { id: true, phone: true, email: true } } },
    });
  }

  /** 발송 성공 처리 */
  async markSent(
    id: bigint,
    providerName: string,
    providerMessageId: string | null,
    tx?: PrismaService,
  ) {
    const client = tx ?? this.prisma;
    await client.notification.update({
      where: { id },
      data: {
        status: NotificationStatus.SENT,
        sentAt: new Date(),
        providerName,
        providerMessageId,
        errorCode: null,
        errorMessage: null,
      },
    });
  }

  /** 발송 실패 처리 및 재시도 예약 */
  async markFailed(
    id: bigint,
    errorCode: string,
    errorMessage: string,
    tx?: PrismaService,
  ) {
    const client = tx ?? this.prisma;
    const n = await client.notification.findUnique({ where: { id } });
    if (!n) return;
    const retryCount = n.retryCount + 1;
    const nextAt = retryCount === 1 ? 5 : 30; // 분
    const scheduledAt = new Date(Date.now() + nextAt * 60 * 1000);
    const status =
      retryCount >= 3 ? NotificationStatus.FAILED : NotificationStatus.SCHEDULED;
    await client.notification.update({
      where: { id },
      data: {
        status,
        failedAt: new Date(),
        retryCount,
        errorCode,
        errorMessage,
        ...(retryCount < 3 ? { scheduledAt } : {}),
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { NotificationChannel, NotificationType } from '@prisma/client';

/**
 * 알림 타입별 채널 정책.
 * 추후 사용자 알림 설정이 생기면 userContext로 분기.
 */
const CHANNEL_POLICY: Record<NotificationType, NotificationChannel[]> = {
  QUEUE_7D_REMINDER: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
  QUEUE_1D_REMINDER: [NotificationChannel.IN_APP, NotificationChannel.PUSH, NotificationChannel.SMS],
  QUEUE_ACTIVE_NOW: [NotificationChannel.IN_APP, NotificationChannel.PUSH, NotificationChannel.SMS],
  QUEUE_EXPIRE_SOON: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
  CONTRACT_COMPLETED: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
  RESALE_APPROVED: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
  RESALE_REJECTED: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
  QUEUE_CANCELLED: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
  ADMIN_NOTICE: [NotificationChannel.IN_APP],
};

@Injectable()
export class NotificationPolicyService {
  resolveChannels(
    type: NotificationType,
    _userContext?: { preferences?: Partial<Record<NotificationChannel, boolean>> },
  ): NotificationChannel[] {
    const channels = CHANNEL_POLICY[type] ?? [NotificationChannel.IN_APP];
    // 추후: userContext?.preferences 로 필터
    return channels;
  }
}

import { NotificationType, NotificationChannel } from '@prisma/client';

export type NotificationMetadata = {
  facilityName?: string;
  unitCode?: string;
  unitId?: string;
  facilityId?: string;
  queueEntryId?: string;
  contractNo?: string;
  contractId?: string;
  resaleId?: string;
  expiresAt?: string;
  reason?: string;
  [key: string]: string | undefined;
};

export interface CreateNotificationInput {
  userId: bigint;
  type: NotificationType;
  channels: NotificationChannel[];
  relatedTable?: string;
  relatedId?: string;
  metadata?: NotificationMetadata;
  dedupeKey?: string;
}

export const MAX_RETRY_COUNT = 3;
export const RETRY_DELAY_MINUTES = [5, 30]; // 1차 5분, 2차 30분, 3차 후 FAILED 고정

import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationChannel } from '@prisma/client';
import { NotificationsService } from './notifications.service';
import type { IPushProvider } from './providers/push/push.provider.interface';
import type { ISmsProvider } from './providers/sms/sms.provider.interface';
import type { IEmailProvider } from './providers/email/email.provider.interface';

export const PUSH_PROVIDER = 'PUSH_PROVIDER';
export const SMS_PROVIDER = 'SMS_PROVIDER';
export const EMAIL_PROVIDER = 'EMAIL_PROVIDER';

const DISPATCH_BATCH_SIZE = 50;

@Injectable()
export class NotificationDispatcherService {
  private readonly logger = new Logger(NotificationDispatcherService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    @Inject(PUSH_PROVIDER) private readonly pushProvider: IPushProvider,
    @Inject(SMS_PROVIDER) private readonly smsProvider: ISmsProvider,
    @Inject(EMAIL_PROVIDER) private readonly emailProvider: IEmailProvider,
  ) {}

  /**
   * 발송 대기 건을 채널별 provider로 발송.
   */
  async dispatchPendingNotifications(): Promise<{ processed: number; sent: number; failed: number }> {
    const list = await this.notifications.findDispatchable(DISPATCH_BATCH_SIZE);
    let sent = 0;
    let failed = 0;
    for (const n of list) {
      try {
        const ok = await this.dispatchOne(n.id);
        if (ok) sent += 1;
        else failed += 1;
      } catch (e) {
        this.logger.warn(`dispatch notification ${n.id} error: ${e}`);
        failed += 1;
      }
    }
    return { processed: list.length, sent, failed };
  }

  /**
   * 단일 알림 발송 (관리자 재시도용).
   */
  async dispatchOne(notificationId: bigint): Promise<boolean> {
    const n = await this.prisma.notification.findUnique({
      where: { id: notificationId },
      include: { user: { select: { id: true, phone: true, email: true } } },
    });
    if (!n) return false;
    const attemptNo =
      (await this.prisma.notificationLog.count({
        where: { notificationId },
      })) + 1;
    const payload = {
      title: n.title,
      body: n.body,
      type: n.type,
      relatedId: n.relatedId ?? undefined,
    };
    let logStatus = 'FAILED';
    let logError: string | null = null;
    let providerName: string | null = null;
    let providerMessageId: string | null = null;

    try {
      if (n.channel === NotificationChannel.IN_APP) {
        await this.notifications.markSent(n.id, 'IN_APP', null);
        await this.createLog(notificationId, attemptNo, n.channel, 'IN_APP', null, null, 'SUCCESS', null);
        return true;
      }

      if (n.channel === NotificationChannel.PUSH) {
        const tokens = await this.getActivePushTokens(n.userId);
        const result = await this.pushProvider.sendToTokens(tokens, {
          ...payload,
          data: {
            type: n.type,
            relatedId: n.relatedId ?? undefined,
            ...((n.metadata as Record<string, string>) ?? {}),
          },
        });
        providerName = 'FCM';
        providerMessageId = result.messageId ?? null;
        if (result.success) {
          await this.notifications.markSent(n.id, 'FCM', providerMessageId);
          if (result.invalidTokens?.length) await this.deactivateTokens(result.invalidTokens);
          logStatus = 'SUCCESS';
        } else {
          await this.notifications.markFailed(
            n.id,
            result.errorCode ?? 'PUSH_PROVIDER_ERROR',
            result.errorMessage ?? 'Unknown',
          );
          logError = result.errorMessage ?? null;
        }
        await this.createLog(
          notificationId,
          attemptNo,
          n.channel,
          'FCM',
          { tokensCount: tokens.length },
          { success: result.success, messageId: result.messageId, errorMessage: result.errorMessage },
          logStatus,
          logError,
        );
        return result.success;
      }

      if (n.channel === NotificationChannel.SMS) {
        const phone = n.user?.phone;
        if (!phone) {
          await this.notifications.markFailed(n.id, 'SMS_PROVIDER_ERROR', 'User phone missing');
          await this.createLog(notificationId, attemptNo, n.channel, 'SMS', null, null, 'FAILED', 'User phone missing');
          return false;
        }
        const result = await this.smsProvider.send(phone, n.body);
        providerName = 'SMS';
        providerMessageId = result.messageId ?? null;
        if (result.success) {
          await this.notifications.markSent(n.id, 'SMS', providerMessageId);
          logStatus = 'SUCCESS';
        } else {
          await this.notifications.markFailed(
            n.id,
            result.errorCode ?? 'SMS_PROVIDER_ERROR',
            result.errorMessage ?? 'Unknown',
          );
          logError = result.errorMessage ?? null;
        }
        await this.createLog(
          notificationId,
          attemptNo,
          n.channel,
          'SMS',
          { phone: phone.slice(-4) },
          { success: result.success, messageId: result.messageId },
          logStatus,
          logError,
        );
        return result.success;
      }

      if (n.channel === NotificationChannel.EMAIL) {
        const email = n.user?.email;
        if (!email) {
          await this.notifications.markFailed(n.id, 'EMAIL_PROVIDER_ERROR', 'User email missing');
          await this.createLog(notificationId, attemptNo, n.channel, 'EMAIL', null, null, 'FAILED', 'User email missing');
          return false;
        }
        const result = await this.emailProvider.send(email, n.title, n.body);
        providerName = 'EMAIL';
        providerMessageId = result.messageId ?? null;
        if (result.success) {
          await this.notifications.markSent(n.id, 'EMAIL', providerMessageId);
          logStatus = 'SUCCESS';
        } else {
          await this.notifications.markFailed(
            n.id,
            result.errorCode ?? 'EMAIL_PROVIDER_ERROR',
            result.errorMessage ?? 'Unknown',
          );
          logError = result.errorMessage ?? null;
        }
        await this.createLog(
          notificationId,
          attemptNo,
          n.channel,
          'EMAIL',
          null,
          { success: result.success, messageId: result.messageId },
          logStatus,
          logError,
        );
        return result.success;
      }
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      await this.notifications.markFailed(n.id, 'NOTIFICATION_DISPATCH_FAILED', err);
      await this.createLog(notificationId, attemptNo, n.channel, providerName ?? 'UNKNOWN', null, null, 'FAILED', err);
      return false;
    }
    return false;
  }

  private async getActivePushTokens(userId: bigint): Promise<string[]> {
    const devices = await this.prisma.userDevice.findMany({
      where: { userId, isActive: true },
      select: { pushToken: true },
    });
    return devices.map((d) => d.pushToken);
  }

  private async deactivateTokens(tokens: string[]): Promise<void> {
    if (!tokens.length) return;
    await this.prisma.userDevice.updateMany({
      where: { pushToken: { in: tokens } },
      data: { isActive: false },
    });
  }

  private async createLog(
    notificationId: bigint,
    attemptNo: number,
    channel: NotificationChannel,
    providerName: string | null,
    requestPayload: object | null,
    responsePayload: object | null,
    status: string,
    errorMessage: string | null,
  ) {
    await this.prisma.notificationLog.create({
      data: {
        notificationId,
        attemptNo,
        channel,
        providerName,
        requestPayload: requestPayload ?? undefined,
        responsePayload: responsePayload ?? undefined,
        status,
        errorMessage,
      },
    });
  }
}

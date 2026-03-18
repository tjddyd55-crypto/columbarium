import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsService } from './notifications.service';
import { NotificationTemplateService } from './notification-template.service';
import { NotificationPolicyService } from './notification-policy.service';
import { NotificationDispatcherService, PUSH_PROVIDER, SMS_PROVIDER, EMAIL_PROVIDER } from './notification-dispatcher.service';
import { NotificationSchedulerService } from './notification-scheduler.service';
import { NotificationsController } from './notifications.controller';
import { AdminNotificationsController } from './admin-notifications.controller';
import { FcmPushProvider } from './providers/push/fcm.push.provider';
import { MockSmsProvider } from './providers/sms/mock.sms.provider';
import { MockEmailProvider } from './providers/email/mock.email.provider';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController, AdminNotificationsController],
  providers: [
    NotificationTemplateService,
    NotificationPolicyService,
    NotificationsService,
    { provide: PUSH_PROVIDER, useClass: FcmPushProvider },
    { provide: SMS_PROVIDER, useClass: MockSmsProvider },
    { provide: EMAIL_PROVIDER, useClass: MockEmailProvider },
    NotificationDispatcherService,
    NotificationSchedulerService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}

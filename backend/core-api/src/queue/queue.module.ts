import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { QueueWorkerController } from './worker.controller';
import { QueueSchedulerService } from './queue-scheduler.service';
import { UnitsModule } from '../units/units.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [UnitsModule, NotificationsModule],
  controllers: [QueueController, QueueWorkerController],
  providers: [QueueService, QueueSchedulerService],
  exports: [QueueService],
})
export class QueueModule {}

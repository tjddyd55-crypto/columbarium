import { Module } from '@nestjs/common';
import { ResaleService } from './resale.service';
import { ResaleController } from './resale.controller';
import { UnitsModule } from '../units/units.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [UnitsModule, NotificationsModule, AuditModule],
  controllers: [ResaleController],
  providers: [ResaleService],
  exports: [ResaleService],
})
export class ResaleModule {}
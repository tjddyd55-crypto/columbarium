import { Module } from '@nestjs/common';
import { ResaleService } from './resale.service';
import { ResaleController } from './resale.controller';
import { SeatResaleService } from './seat-resale.service';
import { SeatResaleController } from './seat-resale.controller';
import { UnitsModule } from '../units/units.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [UnitsModule, NotificationsModule, AuditModule],
  controllers: [ResaleController, SeatResaleController],
  providers: [ResaleService, SeatResaleService],
  exports: [ResaleService, SeatResaleService],
})
export class ResaleModule {}
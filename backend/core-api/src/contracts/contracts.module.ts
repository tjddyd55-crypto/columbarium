import { Module } from '@nestjs/common';
import { ContractService } from './contract.service';
import { ContractsController } from './contracts.controller';
import { UnitsModule } from '../units/units.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [UnitsModule, NotificationsModule, AuditModule],
  controllers: [ContractsController],
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractsModule {}

import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { OperatorScopeController } from './operator-scope.controller';
import { AdminService } from './admin.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [AdminController, OperatorScopeController],
  providers: [AdminService],
})
export class AdminModule {}

import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { CompanyPortalController } from './company-portal.controller';
import { OperatorScopeController } from './operator-scope.controller';
import { AdminService } from './admin.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [AdminController, CompanyPortalController, OperatorScopeController],
  providers: [AdminService],
})
export class AdminModule {}

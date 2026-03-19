import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'OPERATOR_ADMIN', 'AGENT', 'SALES_MANAGER')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async summary(@CurrentUser() user: { id: string; roles?: string[]; role?: string; companyId?: string }) {
    const roles = user.roles?.length ? user.roles : user.role ? [user.role] : [];
    return this.dashboardService.getSummary({
      id: user.id,
      roles,
      companyId: user.companyId,
    });
  }
}

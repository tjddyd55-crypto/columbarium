import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdminService, type CompanyPortalUser } from './admin.service';
import { CompanyPortalCreateFacilityDto } from './dto/company-portal-create-facility.dto';

/**
 * 사업자(Company) 단위 포털 API — ADMIN 전체, OPERATOR 는 본인 companyId 만
 */
@Controller('admin/companies')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'OPERATOR_ADMIN')
export class CompanyPortalController {
  constructor(private readonly adminService: AdminService) {}

  @Get(':companyId')
  async detail(@Param('companyId') companyId: string, @CurrentUser() user: CompanyPortalUser) {
    const id = this.adminService.parseCompanyPathId(companyId);
    return this.adminService.getCompanyPortalDetail(id, user);
  }

  @Get(':companyId/facilities')
  async facilities(@Param('companyId') companyId: string, @CurrentUser() user: CompanyPortalUser) {
    const id = this.adminService.parseCompanyPathId(companyId);
    return this.adminService.getCompanyPortalFacilities(id, user);
  }

  @Post(':companyId/facilities')
  async createFacility(
    @Param('companyId') companyId: string,
    @Body() body: CompanyPortalCreateFacilityDto,
    @CurrentUser() user: CompanyPortalUser,
  ) {
    const id = this.adminService.parseCompanyPathId(companyId);
    return this.adminService.createCompanyPortalFacility(id, user, body);
  }

  @Get(':companyId/reservations')
  async reservations(
    @Param('companyId') companyId: string,
    @Query('status') status: string | undefined,
    @CurrentUser() user: CompanyPortalUser,
  ) {
    const id = this.adminService.parseCompanyPathId(companyId);
    return this.adminService.listCompanyPortalReservations(id, user, status);
  }

  @Get(':companyId/resales')
  async resales(@Param('companyId') companyId: string, @CurrentUser() user: CompanyPortalUser) {
    const id = this.adminService.parseCompanyPathId(companyId);
    return this.adminService.listCompanyPortalResales(id, user);
  }

  @Get(':companyId/agents')
  async agents(@Param('companyId') companyId: string, @CurrentUser() user: CompanyPortalUser) {
    const id = this.adminService.parseCompanyPathId(companyId);
    return this.adminService.listCompanyPortalAgents(id, user);
  }
}

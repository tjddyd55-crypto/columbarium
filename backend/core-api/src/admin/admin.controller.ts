import { Controller, Get, Post, Patch, Body, Query, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuditLogService } from '../audit/audit-log.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AdminResetPasswordDto } from './dto/reset-password.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly auditLog: AuditLogService,
  ) {}

  @Get('operators')
  async getOperators() {
    const list = await this.adminService.getOperators();
    return list;
  }

  @Post('operators')
  async createOperator(@Body() body: any) {
    return this.adminService.createOperator(body);
  }

  @Get('users')
  async getUsers() {
    const list = await this.adminService.getUsers();
    return list;
  }

  @Post('reset-password')
  async resetPassword(@Body() body: AdminResetPasswordDto) {
    return this.adminService.resetUserPassword({
      userId: body.userId,
      newPassword: body.newPassword,
    });
  }

  @Get('audit-logs')
  async getAuditLogs(
    @Query('userId') userId?: string,
    @Query('entityType') entityType?: string,
    @Query('action') action?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.auditLog.list({
      userId,
      entityType,
      action,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('companies')
  async getCompanies() {
    return this.adminService.getCompanies();
  }

  @Get('facilities')
  async getFacilities() {
    return this.adminService.getFacilities();
  }

  @Get('facilities/:id/sections')
  async getSections(@Param('id') id: string) {
    return this.adminService.getSectionsByFacility(BigInt(id));
  }

  @Get('sections/:id/seats')
  async getSeats(@Param('id') id: string) {
    return this.adminService.getSeatsBySection(BigInt(id));
  }

  @Get('facilities/:id/policy')
  async getPolicy(@Param('id') id: string) {
    return this.adminService.getPolicyByFacility(BigInt(id));
  }

  @Post('company')
  async createCompany(@Body() body: { name: string }) {
    return this.adminService.createCompany(body);
  }

  @Post('facility')
  async createFacility(@Body() body: { name: string; address: string; companyId: number }) {
    return this.adminService.createFacility(body);
  }

  @Post('section')
  async createSection(@Body() body: { facilityId: number; name: string; rows: number; cols: number }) {
    return this.adminService.createSection(body);
  }

  @Patch('seat/:id')
  async updateSeatPrice(@Param('id') id: string, @Body() body: { price: number }) {
    return this.adminService.updateSeatPrice(BigInt(id), body.price);
  }

  @Patch('seat/:id/block')
  async blockSeat(@Param('id') id: string, @Body() body: { isBlocked: boolean }) {
    return this.adminService.setSeatBlocked(BigInt(id), body.isBlocked);
  }

  @Post('policy')
  async createPolicy(@Body() body: { facilityId: number; maxWaiting?: number; maxYears?: number }) {
    return this.adminService.upsertPolicy(body);
  }

  @Post('agents')
  async createAgent(
    @Body()
    body: {
      userId: string;
      companyId: string;
      name: string;
      commissionRate: number;
      code?: string;
    },
  ) {
    return this.adminService.createAgent(body);
  }

  @Get('agents')
  async listAgents() {
    return this.adminService.listAgents();
  }

  /** [1] 사업자(Company) + OPERATOR 계정 + companyId + 초기 비밀번호(선택) */
  @Post('onboarding/company-with-operator')
  async onboardingCompanyWithOperator(
    @Body()
    body: {
      companyName: string;
      operatorLoginId: string;
      operatorPassword?: string;
      operatorName: string;
      operatorPhone: string;
      operatorBirthDate?: string;
    },
  ) {
    return this.adminService.createCompanyWithOperator(body);
  }

  /** [2] AGENT User + Agent 프로필 + code 자동 + commissionRate */
  @Post('onboarding/agent-user')
  async onboardingAgentUser(
    @Body()
    body: {
      companyId: string;
      loginId: string;
      password?: string;
      userName: string;
      phone: string;
      birthDate?: string;
      agentDisplayName: string;
      commissionRate: number;
    },
  ) {
    return this.adminService.createAgentUserWithProfile(body);
  }
}

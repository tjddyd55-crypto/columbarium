import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuditLogService } from '../audit/audit-log.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
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
}

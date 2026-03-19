import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

/**
 * OPERATOR: JWT companyId 범위 내에서만 시설·구역·좌석·정책 CRUD (전체 /admin/* 와 분리)
 */
@Controller('admin/me')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('OPERATOR', 'OPERATOR_ADMIN')
export class OperatorScopeController {
  constructor(private readonly adminService: AdminService) {}

  private companyIdOrThrow(user: { companyId?: string }): bigint {
    if (!user.companyId) {
      throw new ForbiddenException('사업자(Company)에 소속되지 않은 운영자 계정입니다.');
    }
    return BigInt(user.companyId);
  }

  @Get('facilities')
  async myFacilities(@CurrentUser() user: { companyId?: string }) {
    return this.adminService.getFacilitiesForCompany(this.companyIdOrThrow(user));
  }

  @Post('facility')
  async createFacility(
    @CurrentUser() user: { companyId?: string },
    @Body() body: { name: string; address: string },
  ) {
    return this.adminService.operatorCreateFacility(this.companyIdOrThrow(user), body);
  }

  @Get('facilities/:facilityId/sections')
  async sections(@CurrentUser() user: { companyId?: string }, @Param('facilityId') facilityId: string) {
    return this.adminService.operatorGetSections(this.companyIdOrThrow(user), facilityId);
  }

  @Get('sections/:sectionId/seats')
  async seats(@CurrentUser() user: { companyId?: string }, @Param('sectionId') sectionId: string) {
    return this.adminService.operatorGetSeats(this.companyIdOrThrow(user), sectionId);
  }

  @Get('facilities/:facilityId/policy')
  async policy(@CurrentUser() user: { companyId?: string }, @Param('facilityId') facilityId: string) {
    return this.adminService.operatorGetPolicy(this.companyIdOrThrow(user), facilityId);
  }

  @Post('section')
  async createSection(
    @CurrentUser() user: { companyId?: string },
    @Body() body: { facilityId: number; name: string; rows: number; cols: number },
  ) {
    return this.adminService.operatorCreateSection(this.companyIdOrThrow(user), body);
  }

  @Patch('seat/:id')
  async updateSeatPrice(
    @CurrentUser() user: { companyId?: string },
    @Param('id') id: string,
    @Body() body: { price: number },
  ) {
    return this.adminService.operatorUpdateSeatPrice(this.companyIdOrThrow(user), id, body.price);
  }

  @Patch('seat/:id/block')
  async blockSeat(
    @CurrentUser() user: { companyId?: string },
    @Param('id') id: string,
    @Body() body: { isBlocked: boolean },
  ) {
    return this.adminService.operatorSetSeatBlocked(this.companyIdOrThrow(user), id, body.isBlocked);
  }

  @Post('policy')
  async upsertPolicy(
    @CurrentUser() user: { companyId?: string },
    @Body() body: { facilityId: number; maxWaiting?: number; maxYears?: number },
  ) {
    return this.adminService.operatorUpsertPolicy(this.companyIdOrThrow(user), body);
  }
}

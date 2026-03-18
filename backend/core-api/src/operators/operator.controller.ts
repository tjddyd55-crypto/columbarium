import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { OperatorService } from './operator.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('operator')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'OPERATOR_ADMIN')
export class OperatorController {
  constructor(private readonly operatorService: OperatorService) {}

  @Get('facilities')
  async getFacilities(@CurrentUser() user: { id: string; role?: string }) {
    return this.operatorService.getFacilities(user.id, user.role);
  }

  @Post('facilities')
  async createFacility(@CurrentUser() user: { id: string }, @Body() body: any) {
    return this.operatorService.createFacility(user.id, body);
  }

  @Patch('facilities/:id')
  async updateFacility(@CurrentUser() user: { id: string }, @Param('id') id: string, @Body() body: any) {
    return this.operatorService.updateFacility(user.id, id, body);
  }

  @Get('queue')
  async getQueue(@CurrentUser() user: { id: string; role?: string }, @Query('facilityId') facilityId?: string) {
    return this.operatorService.getQueue(user.id, user.role, facilityId);
  }

  @Get('contracts')
  async getContracts(
    @CurrentUser() user: { id: string; role?: string },
    @Query('facilityId') facilityId?: string,
    @Query('status') status?: string,
  ) {
    return this.operatorService.getContracts(user.id, user.role, facilityId || status ? { facilityId, status } : undefined);
  }

  @Get('resale')
  async getResale(@CurrentUser() user: { id: string; role?: string }, @Query('status') status?: string) {
    return this.operatorService.getResaleList(user.id, user.role, status);
  }

  @Post('units/bulk')
  async bulkCreateUnits(@CurrentUser() user: { id: string }, @Body() body: { facilityId: string; units: any[] }) {
    return this.operatorService.bulkCreateUnits(user.id, body.facilityId, body.units);
  }

  @Patch('units/:id')
  async updateUnit(@CurrentUser() user: { id: string }, @Param('id') id: string, @Body() body: any) {
    return this.operatorService.updateUnit(user.id, id, body);
  }
}

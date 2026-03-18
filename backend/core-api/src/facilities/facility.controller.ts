import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { FacilityService } from './facility.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('facilities')
@UseGuards(JwtAuthGuard)
export class FacilityController {
  constructor(private readonly facilityService: FacilityService) {}

  @Get()
  async findAll(@Query('operatorId') operatorId?: string) {
    return this.facilityService.findAll(operatorId ? { operatorId } : undefined);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.facilityService.findById(id);
  }

  @Get(':id/units')
  async findUnits(@Param('id') id: string) {
    return this.facilityService.findUnitsByFacilityId(id);
  }
}

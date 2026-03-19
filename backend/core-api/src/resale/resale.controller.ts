import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ResaleService } from './resale.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestResaleDto } from './dto/request-resale.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('resale')
@UseGuards(JwtAuthGuard)
export class ResaleController {
  constructor(private readonly resaleService: ResaleService) {}

  @Post()
  async request(@CurrentUser() user: { id: string }, @Body() dto: RequestResaleDto) {
    return this.resaleService.requestResale(user.id, dto);
  }

  @Get('my')
  async getMy(@CurrentUser() user: { id: string }) {
    return this.resaleService.getMyResaleListings(user.id);
  }

  @Get('listings')
  async getListings() {
    return this.resaleService.getListings();
  }

  @Post(':id/buy')
  async buy(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.resaleService.buyResale(user.id, id);
  }

  @Post(':id/approve')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATOR_ADMIN')
  async approve(@CurrentUser() user: { id: string }, @Param('id') id: string, @Body() body: { operatorId: string }) {
    const operatorId = body.operatorId ?? user.id;
    return this.resaleService.approveResale(operatorId, id);
  }

  @Post(':id/reject')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATOR_ADMIN')
  async reject(@CurrentUser() user: { id: string }, @Param('id') id: string, @Body() body: { operatorId: string }) {
    const operatorId = body.operatorId ?? user.id;
    return this.resaleService.rejectResale(operatorId, id);
  }
}

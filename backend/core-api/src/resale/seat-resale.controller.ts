import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SeatResaleService, CreateSeatResaleListBody, BuySeatResaleBody } from './seat-resale.service';

@Controller('resale')
@UseGuards(JwtAuthGuard)
export class SeatResaleController {
  constructor(private readonly seatResaleService: SeatResaleService) {}

  @Post('list')
  async createListing(@CurrentUser() user: { id: string }, @Body() body: CreateSeatResaleListBody) {
    return this.seatResaleService.createListing(user.id, body);
  }

  @Post('seat/:id/buy')
  async buy(@CurrentUser() user: { id: string }, @Param('id') id: string, @Body() body: BuySeatResaleBody) {
    return this.seatResaleService.buyListing(user.id, id, body);
  }
}

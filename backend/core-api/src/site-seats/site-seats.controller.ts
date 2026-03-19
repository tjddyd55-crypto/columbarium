import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { SiteSeatsService } from './site-seats.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('facilities')
export class SiteSeatsController {
  constructor(private readonly siteSeatsService: SiteSeatsService) {}

  @Public()
  @Get()
  async listFacilities() {
    return this.siteSeatsService.listFacilities();
  }

  @Public()
  @Get(':id')
  async getFacility(@Param('id') id: string) {
    return this.siteSeatsService.getFacilityById(BigInt(id));
  }

  @Public()
  @Get(':id/seats')
  async getSeats(@Param('id') id: string) {
    return this.siteSeatsService.getSeatsByFacilityId(BigInt(id));
  }
}

@Controller('seats')
@UseGuards(JwtAuthGuard)
export class SeatsReserveController {
  constructor(private readonly siteSeatsService: SiteSeatsService) {}

  @Post(':id/reserve')
  async reserve(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.siteSeatsService.reserveSeat(BigInt(id), user.id);
  }

  @Post(':id/wait')
  async wait(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.siteSeatsService.waitSeat(BigInt(id), user.id);
  }
}

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsConfirmController {
  constructor(private readonly siteSeatsService: SiteSeatsService) {}

  @Post('confirm')
  async confirm(@Body() body: { reservationId: string }, @CurrentUser() user: { id: string }) {
    return this.siteSeatsService.confirmPayment(BigInt(body.reservationId), user.id);
  }

  @Post('fail')
  async fail(@Body() body: { reservationId: string }) {
    return this.siteSeatsService.recordPaymentFailure(BigInt(body.reservationId));
  }
}

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsCancelController {
  constructor(private readonly siteSeatsService: SiteSeatsService) {}

  @Patch(':id/cancel')
  async cancel(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.siteSeatsService.cancelReservation(BigInt(id), user.id);
  }
}

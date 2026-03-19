import { Module } from '@nestjs/common';
import { SiteSeatsService } from './site-seats.service';
import {
  SiteSeatsController,
  SeatsReserveController,
  PaymentsConfirmController,
  ReservationsCancelController,
} from './site-seats.controller';

@Module({
  controllers: [
    SiteSeatsController,
    SeatsReserveController,
    PaymentsConfirmController,
    ReservationsCancelController,
  ],
  providers: [SiteSeatsService],
  exports: [SiteSeatsService],
})
export class SiteSeatsModule {}

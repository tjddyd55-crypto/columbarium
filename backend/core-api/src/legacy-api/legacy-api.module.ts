import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FacilitiesModule } from '../facilities/facilities.module';
import { UnitsModule } from '../units/units.module';
import { LegacyApiController } from './legacy-api.controller';

@Module({
  imports: [AuthModule, FacilitiesModule, UnitsModule],
  controllers: [LegacyApiController],
})
export class LegacyApiModule {}

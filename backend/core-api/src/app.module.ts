import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { OperatorsModule } from './operators/operators.module';
import { FacilitiesModule } from './facilities/facilities.module';
import { UnitsModule } from './units/units.module';
import { QueueModule } from './queue/queue.module';
import { ContractsModule } from './contracts/contracts.module';
import { ResaleModule } from './resale/resale.module';
import { ReferralsModule } from './referrals/referrals.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentsModule } from './payments/payments.module';
import { AdminModule } from './admin/admin.module';
import { DevicesModule } from './devices/devices.module';
import { AuditModule } from './audit/audit.module';
import { SiteSeatsModule } from './site-seats/site-seats.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { LegacyApiModule } from './legacy-api/legacy-api.module';

@Module({
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '.env.local'] }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    OperatorsModule,
    FacilitiesModule,
    UnitsModule,
    QueueModule,
    ContractsModule,
    ResaleModule,
    ReferralsModule,
    NotificationsModule,
    PaymentsModule,
    AdminModule,
    DevicesModule,
    AuditModule,
    SiteSeatsModule,
    LegacyApiModule,
  ],
})
export class AppModule {}

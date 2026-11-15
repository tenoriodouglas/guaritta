import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { DatabaseExceptionFilter } from './common/filters/database-exception.filter.js';
import { validateEnv } from './config/env.js';
import { DatabaseModule } from './database/database.module.js';
import { AccessModule } from './modules/access/access.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { DeliveriesModule } from './modules/deliveries/deliveries.module.js';
import { GatesModule } from './modules/gates/gates.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { ResidentsModule } from './modules/residents/residents.module.js';
import { UnitsModule } from './modules/units/units.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { VehiclesModule } from './modules/vehicles/vehicles.module.js';
import { VisitorsModule } from './modules/visitors/visitors.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, validate: validateEnv }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),
    DatabaseModule,
    AuthModule,
    HealthModule,
    UsersModule,
    UnitsModule,
    ResidentsModule,
    VehiclesModule,
    VisitorsModule,
    DeliveriesModule,
    GatesModule,
    AccessModule,
    NotificationsModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: DatabaseExceptionFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}

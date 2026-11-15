import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DeliveriesModule } from './modules/deliveries/deliveries.module';
import { HealthModule } from './modules/health/health.module';
import { VisitorsModule } from './modules/visitors/visitors.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HealthModule, VisitorsModule, DeliveriesModule],
})
export class AppModule {}

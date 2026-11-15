import { Module } from '@nestjs/common';
import { DeliveriesController } from './deliveries.controller.js';
import { DeliveriesRepository } from './deliveries.repository.js';
import { DeliveriesService } from './deliveries.service.js';

@Module({
  controllers: [DeliveriesController],
  providers: [DeliveriesService, DeliveriesRepository],
})
export class DeliveriesModule {}

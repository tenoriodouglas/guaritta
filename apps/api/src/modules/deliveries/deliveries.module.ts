import { Module } from '@nestjs/common';
import { DeliveriesController } from './deliveries.controller';
import { DeliveriesService } from './deliveries.service';
import { DELIVERY_REPOSITORY } from './domain/delivery.repository';
import { InMemoryDeliveryRepository } from './infra/in-memory-delivery.repository';

@Module({
  controllers: [DeliveriesController],
  providers: [DeliveriesService, { provide: DELIVERY_REPOSITORY, useClass: InMemoryDeliveryRepository }],
})
export class DeliveriesModule {}

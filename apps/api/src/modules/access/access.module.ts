import { Module } from '@nestjs/common';
import { AlprModule } from '../alpr/alpr.module.js';
import { GatesModule } from '../gates/gates.module.js';
import { VehiclesModule } from '../vehicles/vehicles.module.js';
import { VisitorsModule } from '../visitors/visitors.module.js';
import { AccessExpirationTask } from './access-expiration.task.js';
import { AccessStreamService } from './access-stream.service.js';
import { AccessController } from './access.controller.js';
import { AccessRepository } from './access.repository.js';
import { AccessService } from './access.service.js';
import { DeviceController } from './device.controller.js';
import { DeviceKeyGuard } from './guards/device-key.guard.js';

@Module({
  imports: [AlprModule, GatesModule, VehiclesModule, VisitorsModule],
  controllers: [AccessController, DeviceController],
  providers: [AccessService, AccessRepository, AccessStreamService, AccessExpirationTask, DeviceKeyGuard],
})
export class AccessModule {}

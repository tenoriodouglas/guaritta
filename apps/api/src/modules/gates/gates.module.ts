import { Module } from '@nestjs/common';
import { HttpRelayGateDriver } from './drivers/http-relay-gate.driver.js';
import { SimulatedGateDriver } from './drivers/simulated-gate.driver.js';
import { GateCommanderService } from './gate-commander.service.js';
import { GatesController } from './gates.controller.js';
import { GatesRepository } from './gates.repository.js';
import { GatesService } from './gates.service.js';

@Module({
  controllers: [GatesController],
  providers: [GatesService, GatesRepository, GateCommanderService, SimulatedGateDriver, HttpRelayGateDriver],
  exports: [GatesService, GateCommanderService],
})
export class GatesModule {}

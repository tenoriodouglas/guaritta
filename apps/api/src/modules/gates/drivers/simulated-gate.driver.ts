import { Injectable, Logger } from '@nestjs/common';
import type { Gate } from '../gates.repository.js';
import type { GateDriver } from './gate-driver.js';

/** No hardware: logs the command. Useful for development and demos. */
@Injectable()
export class SimulatedGateDriver implements GateDriver {
  private readonly logger = new Logger(SimulatedGateDriver.name);

  async open(gate: Gate, context: { accessRequestId: string }): Promise<void> {
    this.logger.log(`Gate "${gate.name}" opened (request ${context.accessRequestId})`);
  }
}

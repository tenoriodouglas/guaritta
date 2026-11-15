import { Injectable } from '@nestjs/common';
import type { GateDriver } from './drivers/gate-driver.js';
import { HttpRelayGateDriver } from './drivers/http-relay-gate.driver.js';
import { SimulatedGateDriver } from './drivers/simulated-gate.driver.js';
import type { Gate } from './gates.repository.js';

/** Dispatches open commands to the driver configured for each gate. */
@Injectable()
export class GateCommanderService {
  private readonly drivers: Record<Gate['driver'], GateDriver>;

  constructor(simulated: SimulatedGateDriver, httpRelay: HttpRelayGateDriver) {
    this.drivers = { SIMULATED: simulated, HTTP_RELAY: httpRelay };
  }

  open(gate: Gate, accessRequestId: string): Promise<void> {
    return this.drivers[gate.driver].open(gate, { accessRequestId });
  }
}

import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { Gate } from '../gates.repository.js';
import type { GateDriver } from './gate-driver.js';

const TIMEOUT_MS = 5_000;

/** Calls a network relay/controller (e.g. IoT board) via HTTP POST to open the gate. */
@Injectable()
export class HttpRelayGateDriver implements GateDriver {
  async open(gate: Gate, context: { accessRequestId: string }): Promise<void> {
    if (!gate.endpoint) throw new ServiceUnavailableException(`Gate "${gate.name}" has no endpoint`);
    try {
      const response = await fetch(gate.endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'open', gateId: gate.id, accessRequestId: context.accessRequestId }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      throw new ServiceUnavailableException(
        `Gate "${gate.name}" did not respond: ${(error as Error).message}`,
      );
    }
  }
}

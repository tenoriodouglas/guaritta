import type { Gate } from '../gates.repository.js';

/** Strategy for physically opening a gate or releasing a turnstile. */
export interface GateDriver {
  open(gate: Gate, context: { accessRequestId: string }): Promise<void>;
}

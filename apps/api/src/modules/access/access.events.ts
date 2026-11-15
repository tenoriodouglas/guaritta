import type { AccessRequest } from './access.repository.js';

export const ACCESS_REQUESTED = 'access.requested';
export const ACCESS_DECIDED = 'access.decided';

export class AccessEvent {
  constructor(readonly request: AccessRequest) {}
}

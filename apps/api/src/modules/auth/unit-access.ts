import { ForbiddenException } from '@nestjs/common';
import type { AuthUser } from './auth-user.js';

/** Residents may only touch data from their own unit; staff roles are unrestricted. */
export function assertUnitAccess(user: AuthUser, unitId: string): void {
  if (user.role === 'RESIDENT' && user.unitId !== unitId) {
    throw new ForbiddenException('Access restricted to your own unit');
  }
}

/** Forces resident queries to their own unit. */
export function scopeUnitId(user: AuthUser, requested?: string): string | undefined {
  return user.role === 'RESIDENT' ? user.unitId : requested;
}

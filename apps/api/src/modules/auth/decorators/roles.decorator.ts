import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '../auth-user.js';

export const ROLES = 'roles';

/** Restricts a route to the given roles. */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES, roles);

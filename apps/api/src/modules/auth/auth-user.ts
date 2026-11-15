export type UserRole = 'ADMIN' | 'CONCIERGE' | 'RESIDENT';

/** Identity attached to each authenticated request (JWT payload). */
export interface AuthUser {
  sub: string;
  role: UserRole;
  // Present only for residents; scopes their data to a single unit.
  unitId?: string;
}

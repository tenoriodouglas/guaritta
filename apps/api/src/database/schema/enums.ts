import { pgEnum } from 'drizzle-orm/pg-core';

export const userRole = pgEnum('user_role', ['ADMIN', 'CONCIERGE', 'RESIDENT']);
export const vehicleStatus = pgEnum('vehicle_status', ['ACTIVE', 'BLOCKED']);
export const visitStatus = pgEnum('visit_status', ['AUTHORIZED', 'INSIDE', 'LEFT', 'CANCELLED']);
export const deliveryStatus = pgEnum('delivery_status', ['RECEIVED', 'PICKED_UP']);
export const gateKind = pgEnum('gate_kind', ['TURNSTILE', 'VEHICLE_GATE', 'DOOR']);
export const gateDriver = pgEnum('gate_driver', ['SIMULATED', 'HTTP_RELAY']);
export const accessDirection = pgEnum('access_direction', ['IN', 'OUT']);
export const accessSource = pgEnum('access_source', ['LPR', 'MANUAL']);
export const accessSubject = pgEnum('access_subject', [
  'RESIDENT_VEHICLE',
  'VISITOR_VEHICLE',
  'BLOCKED_VEHICLE',
  'UNKNOWN_VEHICLE',
  'VISITOR',
  'PERSON',
]);
export const accessSuggestion = pgEnum('access_suggestion', ['APPROVE', 'REVIEW', 'DENY']);
export const accessStatus = pgEnum('access_status', ['PENDING', 'APPROVED', 'DENIED', 'EXPIRED']);
export const notificationType = pgEnum('notification_type', [
  'DELIVERY_RECEIVED',
  'VISITOR_ARRIVED',
  'VEHICLE_ENTERED',
  'ACCESS_DENIED',
]);

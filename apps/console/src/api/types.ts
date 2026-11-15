export type Role = 'ADMIN' | 'CONCIERGE' | 'RESIDENT';
export type AccessStatus = 'PENDING' | 'APPROVED' | 'DENIED' | 'EXPIRED';
export type AccessSuggestion = 'APPROVE' | 'REVIEW' | 'DENY';
export type AccessSubject =
  'RESIDENT_VEHICLE' | 'VISITOR_VEHICLE' | 'BLOCKED_VEHICLE' | 'UNKNOWN_VEHICLE' | 'VISITOR' | 'PERSON';
export type Direction = 'IN' | 'OUT';

export interface SessionUser {
  sub: string;
  role: Role;
  unitId?: string;
}

export interface AccessRequest {
  id: string;
  createdAt: string;
  gateId: string;
  direction: Direction;
  source: 'LPR' | 'MANUAL';
  plateRead: string | null;
  confidence: number | null;
  snapshotUrl: string | null;
  subject: AccessSubject;
  suggestion: AccessSuggestion;
  reason: string;
  unitId: string | null;
  vehicleId: string | null;
  visitorId: string | null;
  status: AccessStatus;
  expiresAt: string;
  decidedAt: string | null;
  decisionNote: string | null;
}

export interface AccessSummary {
  since: string;
  total: number;
  byStatus: Partial<Record<AccessStatus, number>>;
  bySubject: Partial<Record<AccessSubject, number>>;
}

export interface Gate {
  id: string;
  name: string;
  kind: 'TURNSTILE' | 'VEHICLE_GATE' | 'DOOR';
  driver: 'SIMULATED' | 'HTTP_RELAY';
}

export interface Unit {
  id: string;
  block: string;
  number: string;
}

export interface Vehicle {
  id: string;
  unitId: string;
  plate: string;
  brand: string | null;
  model: string | null;
  color: string | null;
  status: 'ACTIVE' | 'BLOCKED';
}

export interface Visitor {
  id: string;
  unitId: string;
  name: string;
  document: string | null;
  plate: string | null;
  status: 'AUTHORIZED' | 'INSIDE' | 'LEFT' | 'CANCELLED';
  validFrom: string;
  validUntil: string;
  enteredAt: string | null;
}

export interface Delivery {
  id: string;
  unitId: string;
  carrier: string;
  trackingCode: string | null;
  description: string | null;
  status: 'RECEIVED' | 'PICKED_UP';
  createdAt: string;
  pickedUpAt: string | null;
  pickedUpBy: string | null;
}

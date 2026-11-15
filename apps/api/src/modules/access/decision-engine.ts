export type AccessSubject =
  'RESIDENT_VEHICLE' | 'VISITOR_VEHICLE' | 'BLOCKED_VEHICLE' | 'UNKNOWN_VEHICLE' | 'VISITOR' | 'PERSON';
export type AccessSuggestion = 'APPROVE' | 'REVIEW' | 'DENY';

export interface DecisionInput {
  direction: 'IN' | 'OUT';
  /** Recognition confidence (0..1); null when the read is trusted (manual input). */
  confidence: number | null;
  minConfidence: number;
  vehicle?: { id: string; unitId: string; status: 'ACTIVE' | 'BLOCKED' };
  visitor?: { id: string; unitId: string };
}

export interface Decision {
  subject: AccessSubject;
  suggestion: AccessSuggestion;
  reason: string;
  unitId?: string;
  vehicleId?: string;
  visitorId?: string;
}

/**
 * Computes the suggested action shown to the operator.
 * The final release is always a human decision; this only pre-qualifies the request.
 */
export function decideAccess(input: DecisionInput): Decision {
  const lowConfidence = input.confidence !== null && input.confidence < input.minConfidence;
  const confident = (reason: string): Pick<Decision, 'suggestion' | 'reason'> =>
    lowConfidence
      ? { suggestion: 'REVIEW', reason: `${reason}; low read confidence, confirm the plate` }
      : { suggestion: 'APPROVE', reason };

  const { vehicle, visitor } = input;
  if (vehicle?.status === 'BLOCKED') {
    return {
      subject: 'BLOCKED_VEHICLE',
      suggestion: 'DENY',
      reason: 'Vehicle is blocked',
      unitId: vehicle.unitId,
      vehicleId: vehicle.id,
    };
  }
  if (vehicle) {
    return {
      subject: 'RESIDENT_VEHICLE',
      ...confident('Registered resident vehicle'),
      unitId: vehicle.unitId,
      vehicleId: vehicle.id,
    };
  }
  if (visitor) {
    const reason = input.direction === 'IN' ? 'Pre-authorized visitor' : 'Visitor leaving';
    return {
      subject: 'VISITOR_VEHICLE',
      ...confident(reason),
      unitId: visitor.unitId,
      visitorId: visitor.id,
    };
  }
  return {
    subject: 'UNKNOWN_VEHICLE',
    suggestion: 'REVIEW',
    reason: input.direction === 'IN' ? 'Unregistered vehicle' : 'Unregistered vehicle leaving',
  };
}

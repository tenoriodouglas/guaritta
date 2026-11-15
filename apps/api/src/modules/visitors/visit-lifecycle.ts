export type VisitStatus = 'AUTHORIZED' | 'INSIDE' | 'LEFT' | 'CANCELLED';
export type VisitAction = 'enter' | 'exit' | 'cancel';

// Allowed lifecycle: AUTHORIZED -> INSIDE -> LEFT, or AUTHORIZED -> CANCELLED.
const TRANSITIONS: Record<VisitAction, { from: VisitStatus; to: VisitStatus }> = {
  enter: { from: 'AUTHORIZED', to: 'INSIDE' },
  exit: { from: 'INSIDE', to: 'LEFT' },
  cancel: { from: 'AUTHORIZED', to: 'CANCELLED' },
};

export function visitTransition(action: VisitAction): { from: VisitStatus; to: VisitStatus } {
  return TRANSITIONS[action];
}

/** True when the authorization window covers the given instant. */
export function isWithinWindow(visit: { validFrom: Date; validUntil: Date }, at = new Date()): boolean {
  return visit.validFrom <= at && at <= visit.validUntil;
}

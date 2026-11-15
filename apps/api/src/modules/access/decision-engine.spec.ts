import { decideAccess, type DecisionInput } from './decision-engine.js';

const base: DecisionInput = { direction: 'IN', confidence: 0.95, minConfidence: 0.8 };
const vehicle = { id: 'v1', unitId: 'u1', status: 'ACTIVE' as const };

describe('decideAccess', () => {
  it('suggests approval for registered vehicles', () => {
    expect(decideAccess({ ...base, vehicle })).toMatchObject({
      subject: 'RESIDENT_VEHICLE',
      suggestion: 'APPROVE',
      unitId: 'u1',
    });
  });

  it('asks for review on low confidence', () => {
    expect(decideAccess({ ...base, confidence: 0.5, vehicle }).suggestion).toBe('REVIEW');
  });

  it('suggests denial for blocked vehicles', () => {
    expect(decideAccess({ ...base, vehicle: { ...vehicle, status: 'BLOCKED' } })).toMatchObject({
      subject: 'BLOCKED_VEHICLE',
      suggestion: 'DENY',
    });
  });

  it('recognizes pre-authorized visitors', () => {
    expect(decideAccess({ ...base, visitor: { id: 'x', unitId: 'u2' } })).toMatchObject({
      subject: 'VISITOR_VEHICLE',
      suggestion: 'APPROVE',
      visitorId: 'x',
    });
  });

  it('flags unknown vehicles for review', () => {
    expect(decideAccess(base)).toMatchObject({ subject: 'UNKNOWN_VEHICLE', suggestion: 'REVIEW' });
  });

  it('trusts manual reads regardless of threshold', () => {
    expect(decideAccess({ ...base, confidence: null, vehicle }).suggestion).toBe('APPROVE');
  });
});

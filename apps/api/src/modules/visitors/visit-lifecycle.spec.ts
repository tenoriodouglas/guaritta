import { isWithinWindow, visitTransition } from './visit-lifecycle.js';

describe('visit lifecycle', () => {
  it('defines valid transitions', () => {
    expect(visitTransition('enter')).toEqual({ from: 'AUTHORIZED', to: 'INSIDE' });
    expect(visitTransition('exit')).toEqual({ from: 'INSIDE', to: 'LEFT' });
    expect(visitTransition('cancel')).toEqual({ from: 'AUTHORIZED', to: 'CANCELLED' });
  });

  it('checks the authorization window', () => {
    const now = new Date('2026-01-01T12:00:00Z');
    const visit = {
      validFrom: new Date('2026-01-01T10:00:00Z'),
      validUntil: new Date('2026-01-01T14:00:00Z'),
    };
    expect(isWithinWindow(visit, now)).toBe(true);
    expect(isWithinWindow(visit, new Date('2026-01-01T15:00:00Z'))).toBe(false);
  });
});

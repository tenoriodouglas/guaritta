import { AlprService } from './alpr.service.js';

describe('AlprService.pickBest', () => {
  it('returns the highest-confidence valid plate after OCR correction', () => {
    const best = AlprService.pickBest([
      { plate: 'XX12', confidence: 0.99 },
      { plate: 'A8C1234', confidence: 0.9 },
      { plate: 'ABD1234', confidence: 0.7 },
    ]);
    expect(best).toEqual({ plate: 'ABC1234', confidence: 0.9 });
  });

  it('returns undefined when nothing is valid', () => {
    expect(AlprService.pickBest([{ plate: '???', confidence: 1 }])).toBeUndefined();
  });
});

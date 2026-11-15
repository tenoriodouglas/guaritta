import { correctOcrPlate, isValidPlate, normalizePlate, plateKey } from './plate.js';

describe('plate utils', () => {
  it('normalizes separators and case', () => {
    expect(normalizePlate('abc-1234')).toBe('ABC1234');
  });

  it('validates legacy and Mercosul formats', () => {
    expect(isValidPlate('ABC1234')).toBe(true);
    expect(isValidPlate('ABC1D23')).toBe(true);
    expect(isValidPlate('AB12345')).toBe(false);
  });

  it('maps legacy plates to the Mercosul key', () => {
    expect(plateKey('ABC1234')).toBe('ABC1C34');
    expect(plateKey('ABC1C34')).toBe('ABC1C34');
    expect(plateKey('XYZ9055')).toBe('XYZ9A55');
  });

  it('corrects OCR confusions by position', () => {
    expect(correctOcrPlate('A8C1O34')).toBe('ABC1O34');
    expect(correctOcrPlate('0BCI234')).toBe('OBC1234');
  });
});

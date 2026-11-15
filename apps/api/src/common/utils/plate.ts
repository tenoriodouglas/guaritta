/**
 * Brazilian license plate helpers.
 * Legacy format: ABC1234. Mercosul format: ABC1D23 (5th char is a letter).
 */

const PLATE_PATTERN = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;

// Common OCR confusions, resolved by the expected character class at each position.
const TO_LETTER: Record<string, string> = {
  '0': 'O',
  '1': 'I',
  '2': 'Z',
  '4': 'A',
  '5': 'S',
  '6': 'G',
  '8': 'B',
};
const TO_DIGIT: Record<string, string> = {
  O: '0',
  Q: '0',
  D: '0',
  I: '1',
  L: '1',
  Z: '2',
  A: '4',
  S: '5',
  G: '6',
  B: '8',
  T: '7',
};

const LETTER_POSITIONS = new Set([0, 1, 2]);
const DIGIT_POSITIONS = new Set([3, 5, 6]);

/** Uppercases and strips separators: "abc-1234" -> "ABC1234". */
export function normalizePlate(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/** Fixes OCR misreads based on the character expected at each position. */
export function correctOcrPlate(raw: string): string {
  const plate = normalizePlate(raw);
  if (plate.length !== 7) return plate;
  return plate
    .split('')
    .map((char, i) => {
      if (LETTER_POSITIONS.has(i)) return TO_LETTER[char] ?? char;
      if (DIGIT_POSITIONS.has(i)) return TO_DIGIT[char] ?? char;
      return char;
    })
    .join('');
}

export function isValidPlate(raw: string): boolean {
  return PLATE_PATTERN.test(normalizePlate(raw));
}

/**
 * Canonical Mercosul key, so legacy and converted plates match the same vehicle.
 * Conversion rule: 5th digit maps to a letter (0->A, 1->B, ..., 9->J).
 */
export function plateKey(raw: string): string {
  const plate = normalizePlate(raw);
  const fifth = plate.charAt(4);
  if (/[0-9]/.test(fifth)) {
    return plate.slice(0, 4) + String.fromCharCode(65 + Number(fifth)) + plate.slice(5);
  }
  return plate;
}

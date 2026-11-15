import { createHash, randomBytes } from 'node:crypto';

/** Generates a random device API key (shown once to the admin). */
export function generateDeviceKey(): string {
  return `gk_${randomBytes(32).toString('base64url')}`;
}

/** Keys are high-entropy random values, so a fast SHA-256 is sufficient for storage. */
export function hashDeviceKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

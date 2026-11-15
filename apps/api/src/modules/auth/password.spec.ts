import { hashPassword, verifyPassword } from './password.js';

describe('password', () => {
  it('verifies the original password only', async () => {
    const stored = await hashPassword('s3cret!');
    expect(await verifyPassword('s3cret!', stored)).toBe(true);
    expect(await verifyPassword('wrong', stored)).toBe(false);
  });
});

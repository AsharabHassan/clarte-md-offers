import { randomBytes } from 'node:crypto';

/** Cryptographically-random url-safe token used as the offer link id. */
export function generateToken(bytes = 24): string {
  return randomBytes(bytes).toString('base64url');
}

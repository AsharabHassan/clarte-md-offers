import { describe, it, expect } from 'vitest';
import { generateToken } from '@/lib/winback/token';

describe('generateToken', () => {
  it('returns a url-safe string (no +, /, =)', () => {
    const t = generateToken();
    expect(t).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('is long enough to be unguessable (>= 30 chars by default)', () => {
    expect(generateToken().length).toBeGreaterThanOrEqual(30);
  });

  it('produces unique values across many calls', () => {
    const set = new Set(Array.from({ length: 1000 }, () => generateToken()));
    expect(set.size).toBe(1000);
  });
});

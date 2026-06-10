import { describe, it, expect } from 'vitest';
import { pickHeroMode, isExpired } from '@/lib/winback/hero';

describe('pickHeroMode', () => {
  it('uses before+after when both present', () => {
    expect(pickHeroMode({ before: 'b', after: 'a' })).toBe('before-after');
  });
  it('uses after-only when before missing', () => {
    expect(pickHeroMode({ before: null, after: 'a' })).toBe('after-only');
  });
  it('falls back to generic when no after image', () => {
    expect(pickHeroMode({ before: 'b', after: null })).toBe('generic');
    expect(pickHeroMode({ before: null, after: null })).toBe('generic');
  });
});

describe('isExpired', () => {
  const now = new Date('2026-06-10T12:00:00Z');
  it('is true when expiry is in the past', () => {
    expect(isExpired(new Date('2026-06-10T11:59:59Z'), now)).toBe(true);
  });
  it('is false when expiry is in the future', () => {
    expect(isExpired(new Date('2026-06-10T12:00:01Z'), now)).toBe(false);
  });
});

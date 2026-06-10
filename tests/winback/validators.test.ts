import { describe, it, expect } from 'vitest';
import { CreateWinbackSchema, WinbackOrderSchema } from '@/lib/validators/winback';

const validUuid = '11111111-1111-4111-8111-111111111111';

describe('CreateWinbackSchema', () => {
  it('accepts a valid GHL payload', () => {
    const r = CreateWinbackSchema.safeParse({
      ai_session_id: validUuid, name: 'Ayesha', email: 'a@b.com', phone: '03001234567',
    });
    expect(r.success).toBe(true);
  });

  it('rejects a non-uuid ai_session_id', () => {
    const r = CreateWinbackSchema.safeParse({
      ai_session_id: 'nope', name: 'Ayesha', email: 'a@b.com', phone: '03001234567',
    });
    expect(r.success).toBe(false);
  });

  it('rejects a bad email', () => {
    const r = CreateWinbackSchema.safeParse({
      ai_session_id: validUuid, name: 'Ayesha', email: 'not-an-email', phone: '03001234567',
    });
    expect(r.success).toBe(false);
  });
});

describe('WinbackOrderSchema', () => {
  it('accepts a minimal order body', () => {
    const r = WinbackOrderSchema.safeParse({
      token: 'abc12345',
      contact: { name: 'Ayesha', phone: '03001234567', email: 'a@b.com' },
      shipping: { address: '12 Mall Rd', city: 'Lahore' },
      items: [{ sku: 'acne', qty: 1 }],
    });
    expect(r.success).toBe(true);
  });

  it('rejects an empty items array', () => {
    const r = WinbackOrderSchema.safeParse({
      token: 'abc12345',
      contact: { name: 'Ayesha', phone: '03001234567', email: 'a@b.com' },
      shipping: { address: '12 Mall Rd', city: 'Lahore' },
      items: [],
    });
    expect(r.success).toBe(false);
  });
});

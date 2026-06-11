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

  it('treats a non-uuid / empty / unresolved ai_session_id as absent (offer still valid)', () => {
    for (const ai_session_id of ['nope', '', '   ', '{{contact.ai_session_id}}']) {
      const r = CreateWinbackSchema.safeParse({
        ai_session_id, name: 'Ayesha', email: 'a@b.com', phone: '03001234567',
      });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.ai_session_id).toBeUndefined();
    }
  });

  it('accepts a payload with no ai_session_id at all', () => {
    const r = CreateWinbackSchema.safeParse({
      name: 'Ayesha', email: 'a@b.com', phone: '03001234567',
    });
    expect(r.success).toBe(true);
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

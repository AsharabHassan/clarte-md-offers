import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create mock functions that will be set up in beforeEach
let selectChain: any;
let insertChain: any;
let db: any;

vi.mock('@/lib/db/client', () => {
  return {
    get db() {
      return db;
    },
    schema: { winbackOffers: {} },
  };
});

import { createOrGetOffer } from '@/lib/winback/offers';

beforeEach(() => {
  // Set up chain for select().from().where().limit()
  selectChain = {
    from: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
  };
  selectChain.from.mockReturnValue(selectChain);
  selectChain.where.mockReturnValue(selectChain);

  // Set up chain for insert().values().returning()
  insertChain = {
    values: vi.fn(),
    returning: vi.fn(),
  };
  insertChain.values.mockReturnValue(insertChain);

  // Set up db object
  db = {
    select: vi.fn(() => selectChain),
    insert: vi.fn(() => insertChain),
    update: vi.fn(),
  };
});

describe('createOrGetOffer', () => {
  it('returns the existing live offer without inserting (idempotent)', async () => {
    const existing = { token: 'EXISTING', expiresAt: new Date(Date.now() + 1e6) };
    selectChain.limit.mockResolvedValue([existing]);

    const out = await createOrGetOffer({
      aiSessionId: 'sess', name: 'A', email: 'a@b.com', phone: '0300', ghlContactId: null, ttlHours: 48,
    });

    expect(out.token).toBe('EXISTING');
    expect(db.insert).not.toHaveBeenCalled();
  });

  it('inserts a new offer when none live exists', async () => {
    selectChain.limit.mockResolvedValue([]); // no existing
    const created = { token: 'NEW', expiresAt: new Date(Date.now() + 1e6) };
    insertChain.returning.mockResolvedValue([created]);

    const out = await createOrGetOffer({
      aiSessionId: 'sess', name: 'A', email: 'a@b.com', phone: '0300', ghlContactId: null, ttlHours: 48,
    });

    expect(db.insert).toHaveBeenCalledTimes(1);
    expect(out.token).toBe('NEW');
  });
});

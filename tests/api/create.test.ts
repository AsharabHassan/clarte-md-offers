import { describe, it, expect, vi, beforeEach } from 'vitest';

const { createOrGetOffer, selectChain, db } = vi.hoisted(() => {
  const selectChain = {
    from: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
  };
  selectChain.from.mockReturnValue(selectChain);
  selectChain.where.mockReturnValue(selectChain);
  const db = { select: vi.fn(() => selectChain) };
  const createOrGetOffer = vi.fn();
  return { createOrGetOffer, selectChain, db };
});

vi.mock('@/lib/winback/offers', () => ({ createOrGetOffer }));
vi.mock('@/lib/db/client', () => ({ db, schema: { aiSessions: {} } }));

import { POST } from '@/app/api/winback/create/route';

const validUuid = '11111111-1111-4111-8111-111111111111';
function req(body: unknown, secret?: string) {
  return new Request('http://x/api/winback/create', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(secret ? { 'x-winback-secret': secret } : {}) },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  selectChain.from.mockReturnValue(selectChain);
  selectChain.where.mockReturnValue(selectChain);
  db.select.mockReturnValue(selectChain);
  process.env.WINBACK_INGEST_SECRET = 'topsecret';
  process.env.NEXT_PUBLIC_SITE_URL = 'https://offer.test';
  process.env.OFFER_TTL_HOURS = '48';
});

describe('POST /api/winback/create', () => {
  it('401s without the correct secret', async () => {
    const res = await POST(req({ ai_session_id: validUuid, name: 'A', email: 'a@b.com', phone: '03001234' }, 'wrong') as never);
    expect(res.status).toBe(401);
  });

  it('400s on an invalid body', async () => {
    const res = await POST(req({ name: 'A' }, 'topsecret') as never);
    expect(res.status).toBe(400);
  });

  it('creates a sessionless offer when the ai_session is unknown', async () => {
    selectChain.limit.mockResolvedValue([]); // not found
    createOrGetOffer.mockResolvedValue({ token: 'TOK', expiresAt: new Date('2026-06-12T10:00:00Z') });
    const res = await POST(req({ ai_session_id: validUuid, name: 'A', email: 'a@b.com', phone: '03001234' }, 'topsecret') as never);
    expect(res.status).toBe(200);
    expect(createOrGetOffer).toHaveBeenCalledWith(expect.objectContaining({ aiSessionId: null }));
  });

  it('creates a sessionless offer when ai_session_id is omitted entirely', async () => {
    createOrGetOffer.mockResolvedValue({ token: 'TOK', expiresAt: new Date('2026-06-12T10:00:00Z') });
    const res = await POST(req({ name: 'A', email: 'a@b.com', phone: '03001234' }, 'topsecret') as never);
    expect(res.status).toBe(200);
    expect(db.select).not.toHaveBeenCalled(); // no session lookup when none supplied
    expect(createOrGetOffer).toHaveBeenCalledWith(expect.objectContaining({ aiSessionId: null }));
  });

  it('links the session and returns a url for a valid request', async () => {
    selectChain.limit.mockResolvedValue([{ id: validUuid }]);
    createOrGetOffer.mockResolvedValue({ token: 'TOK', expiresAt: new Date('2026-06-12T10:00:00Z') });
    const res = await POST(req({ ai_session_id: validUuid, name: 'A', email: 'a@b.com', phone: '03001234' }, 'topsecret') as never);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.url).toBe('https://offer.test/o/TOK');
    expect(createOrGetOffer).toHaveBeenCalledWith(expect.objectContaining({ aiSessionId: validUuid }));
  });
});

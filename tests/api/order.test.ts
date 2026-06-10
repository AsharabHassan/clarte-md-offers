import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  findByToken,
  markConverted,
  dispatchWebhook,
  db,
  selectChain,
  insertChain,
  productsRows,
} = vi.hoisted(() => {
  const productsRows = [{ sku: 'acne', name: 'Clarifying Acne Serum', pricePkr: 2100 }];

  const insertChain = {
    values: vi.fn(),
    returning: vi.fn(),
  };
  insertChain.values.mockReturnValue(insertChain);
  insertChain.returning.mockResolvedValue([{ id: 'order-1', orderNumber: 'CLR-TEST-1' }]);

  const selectChain = {
    from: vi.fn(),
    where: vi.fn(),
  };
  selectChain.from.mockReturnValue(selectChain);
  // .where() returns a thenable so `await db.select().from().where()` works
  selectChain.where.mockReturnValue(Object.assign(Promise.resolve(productsRows), selectChain));

  const db = {
    execute: vi.fn().mockResolvedValue([{ c: 0 }]),
    select: vi.fn(() => selectChain),
    insert: vi.fn(() => insertChain),
  };

  const findByToken = vi.fn();
  const markConverted = vi.fn();
  const dispatchWebhook = vi.fn();

  return { findByToken, markConverted, dispatchWebhook, db, selectChain, insertChain, productsRows };
});

vi.mock('@/lib/winback/offers', () => ({ findByToken, markConverted }));
vi.mock('@/lib/webhooks/dispatcher', () => ({ dispatchWebhook }));
vi.mock('@/lib/webhooks/payloads', () => ({ buildOrderEventPayload: () => ({}) }));
vi.mock('@/lib/orders/order-number', () => ({ nextOrderNumber: async () => 'CLR-TEST-1' }));
vi.mock('@/lib/db/client', () => ({
  db,
  schema: { products: {}, bundles: {}, orders: {}, orderItems: {} },
}));

import { POST } from '@/app/api/winback/order/route';

function req(body: unknown) {
  return new Request('http://x/api/winback/order', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.IP_HASH_PEPPER = 'pep';
  db.execute.mockResolvedValue([{ c: 0 }]);
  db.select.mockReturnValue(selectChain);
  selectChain.from.mockReturnValue(selectChain);
  selectChain.where.mockReturnValue(Object.assign(Promise.resolve(productsRows), selectChain));
  insertChain.values.mockReturnValue(insertChain);
  insertChain.returning.mockResolvedValue([{ id: 'order-1', orderNumber: 'CLR-TEST-1' }]);
  db.insert.mockReturnValue(insertChain);
  dispatchWebhook.mockResolvedValue(undefined);
});

describe('POST /api/winback/order', () => {
  it('rejects an unknown/expired token', async () => {
    findByToken.mockResolvedValue(null);
    const res = await POST(req({
      token: 'badtoken1', contact: { name: 'A', phone: '03001234', email: 'a@b.com' },
      shipping: { address: '12 Mall', city: 'Lahore' }, items: [{ sku: 'acne', qty: 1 }],
    }) as never);
    expect(res.status).toBe(404);
  });

  it('creates an order and marks the offer converted', async () => {
    findByToken.mockResolvedValue({
      id: 'offer-1', status: 'opened', aiSessionId: 'sess',
      expiresAt: new Date(Date.now() + 1e6),
    });
    const res = await POST(req({
      token: 'goodtoken1', contact: { name: 'A', phone: '03001234', email: 'a@b.com' },
      shipping: { address: '12 Mall', city: 'Lahore' }, items: [{ sku: 'acne', qty: 1 }],
    }) as never);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.order_number).toBe('CLR-TEST-1');
    expect(markConverted).toHaveBeenCalledWith('offer-1', 'order-1');
  });
});

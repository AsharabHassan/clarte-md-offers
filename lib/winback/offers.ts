import { and, eq, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db/client';
import type { WinbackOffer } from '@/lib/db/schema';
import { generateToken } from './token';

export interface CreateOfferArgs {
  aiSessionId: string | null;
  name: string;
  email: string;
  phone: string;
  ghlContactId: string | null;
  ttlHours: number;
}

/**
 * Idempotent: if a non-expired, non-converted offer already exists, return it;
 * otherwise mint a new token + row. Dedupe key is the ai_session when present,
 * otherwise the customer email (so sessionless contacts don't get a fresh
 * offer on every workflow run).
 */
export async function createOrGetOffer(args: CreateOfferArgs): Promise<WinbackOffer> {
  const dedupeKey = args.aiSessionId
    ? eq(schema.winbackOffers.aiSessionId, args.aiSessionId)
    : and(sql`ai_session_id is null`, eq(schema.winbackOffers.customerEmail, args.email));
  const existing = await db
    .select()
    .from(schema.winbackOffers)
    .where(
      and(
        dedupeKey,
        sql`status <> 'converted'`,
        sql`expires_at > now()`,
      ),
    )
    .limit(1);
  if (existing.length) return existing[0];

  const token = generateToken();
  const expiresAt = new Date(Date.now() + args.ttlHours * 3600 * 1000);
  const [row] = await db
    .insert(schema.winbackOffers)
    .values({
      token,
      aiSessionId: args.aiSessionId,
      customerName: args.name,
      customerEmail: args.email,
      customerPhone: args.phone,
      ghlContactId: args.ghlContactId,
      status: 'created',
      expiresAt,
    })
    .returning();
  return row;
}

export async function findByToken(token: string): Promise<WinbackOffer | null> {
  const rows = await db
    .select()
    .from(schema.winbackOffers)
    .where(eq(schema.winbackOffers.token, token))
    .limit(1);
  return rows[0] ?? null;
}

export async function markOpened(id: string): Promise<void> {
  await db
    .update(schema.winbackOffers)
    .set({ status: 'opened', openedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(schema.winbackOffers.id, id), sql`status = 'created'`));
}

export async function markExpired(id: string): Promise<void> {
  await db
    .update(schema.winbackOffers)
    .set({ status: 'expired', updatedAt: new Date() })
    .where(and(eq(schema.winbackOffers.id, id), sql`status in ('created','opened')`));
}

export async function markConverted(id: string, orderId: string): Promise<void> {
  await db
    .update(schema.winbackOffers)
    .set({ status: 'converted', orderId, updatedAt: new Date() })
    .where(eq(schema.winbackOffers.id, id));
}

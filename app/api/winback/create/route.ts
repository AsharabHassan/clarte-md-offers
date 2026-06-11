import { NextRequest, NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db/client';
import { CreateWinbackSchema } from '@/lib/validators/winback';
import { createOrGetOffer } from '@/lib/winback/offers';

/** Constant-time string compare to avoid leaking the secret via timing. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-winback-secret') ?? '';
  const expected = process.env.WINBACK_INGEST_SECRET ?? '';
  if (!expected || !safeEqual(secret, expected)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = CreateWinbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }
  const input = parsed.data;

  // Link the AI session only when a real one is supplied AND exists. A missing
  // or unknown session is allowed — the offer is created without one and the
  // recommended protocol defaults to acne downstream.
  let aiSessionId: string | null = null;
  if (input.ai_session_id) {
    const found = await db
      .select({ id: schema.aiSessions.id })
      .from(schema.aiSessions)
      .where(sql`id = ${input.ai_session_id}`)
      .limit(1);
    if (found.length) aiSessionId = input.ai_session_id;
  }

  const ttlHours = Number(process.env.OFFER_TTL_HOURS ?? '48');
  const offer = await createOrGetOffer({
    aiSessionId,
    name: input.name,
    email: input.email,
    phone: input.phone,
    ghlContactId: input.ghl_contact_id ?? null,
    ttlHours,
  });

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  return NextResponse.json({
    ok: true,
    url: `${base}/o/${offer.token}`,
    expires_at: offer.expiresAt,
  });
}

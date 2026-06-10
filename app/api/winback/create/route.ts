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

  const found = await db
    .select()
    .from(schema.aiSessions)
    .where(sql`id = ${input.ai_session_id}`)
    .limit(1);
  if (!found.length) {
    return NextResponse.json({ ok: false, error: 'Unknown ai_session_id' }, { status: 404 });
  }

  const ttlHours = Number(process.env.OFFER_TTL_HOURS ?? '48');
  const offer = await createOrGetOffer({
    aiSessionId: input.ai_session_id,
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

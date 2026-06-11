import { NextRequest, NextResponse } from 'next/server';
import { inArray, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db/client';
import { WinbackOrderSchema } from '@/lib/validators/winback';
import { computeTotals } from '@/lib/orders/compute-totals';
import { nextOrderNumber } from '@/lib/orders/order-number';
import { extractClientIp, hashIp, RATE_LIMIT_ORDERS_PER_HOUR } from '@/lib/ai/rate-limit';
import { dispatchWebhook } from '@/lib/webhooks/dispatcher';
import { buildOrderEventPayload } from '@/lib/webhooks/payloads';
import { findByToken, markConverted } from '@/lib/winback/offers';
import { isExpired } from '@/lib/winback/hero';
import type { OrderItem } from '@/lib/db/schema';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = WinbackOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }
  const input = parsed.data;

  // Resolve the offer; reject unknown / expired / already-converted.
  const offer = await findByToken(input.token);
  if (!offer) {
    return NextResponse.json({ ok: false, error: 'This offer link is no longer valid.' }, { status: 404 });
  }
  if (offer.status === 'converted') {
    return NextResponse.json({ ok: false, error: 'This offer has already been used.' }, { status: 409 });
  }
  if (isExpired(new Date(offer.expiresAt))) {
    return NextResponse.json({ ok: false, error: 'This offer has expired.' }, { status: 410 });
  }

  const ipHash = hashIp(extractClientIp(req.headers));
  const recent = (await db.execute(sql`
    SELECT count(*)::int AS c FROM orders
    WHERE client_ip_hash = ${ipHash} AND created_at > now() - interval '1 hour'
  `)) as unknown as Array<{ c: number }>;
  if (Number(recent[0]?.c ?? 0) >= RATE_LIMIT_ORDERS_PER_HOUR) {
    return NextResponse.json(
      { ok: false, error: 'Too many orders from your address. WhatsApp us to place this manually.' },
      { status: 429 },
    );
  }

  // ── Server-authoritative pricing (identical rules to the funnel) ──
  const bundleSlugs = input.items.filter((i) => i.sku.endsWith('-protocol')).map((i) => i.sku);
  const productSkus = input.items.filter((i) => !i.sku.endsWith('-protocol')).map((i) => i.sku);
  const dbBundles = bundleSlugs.length
    ? await db.select().from(schema.bundles).where(inArray(schema.bundles.slug, bundleSlugs))
    : [];
  const dbProducts = productSkus.length
    ? await db.select().from(schema.products).where(inArray(schema.products.sku, productSkus))
    : [];

  const items: Array<{ sku: string; name: string; qty: number; unitPricePkr: number; isBundle: boolean }> = [];
  for (const i of input.items) {
    if (i.sku.endsWith('-protocol')) {
      const b = dbBundles.find((x) => x.slug === i.sku);
      if (!b) return NextResponse.json({ ok: false, error: `Unknown bundle: ${i.sku}` }, { status: 400 });
      items.push({ sku: b.slug, name: b.name, qty: 1, unitPricePkr: b.pricePkr, isBundle: true });
    } else {
      const p = dbProducts.find((x) => x.sku === i.sku);
      if (!p) return NextResponse.json({ ok: false, error: `Unknown product: ${i.sku}` }, { status: 400 });
      items.push({ sku: p.sku, name: p.name, qty: i.qty, unitPricePkr: p.pricePkr, isBundle: false });
    }
  }

  // Recommended protocol is derived from the offer's AI session. When that
  // session (or its concern) is unavailable, default to acne.
  const [aiSession] = await db
    .select({ concern: schema.aiSessions.concern })
    .from(schema.aiSessions)
    .where(sql`id = ${offer.aiSessionId}`)
    .limit(1);
  const recommendedConcern = aiSession?.concern ?? 'acne';

  const totals = computeTotals(items);
  const orderNumber = await nextOrderNumber(db);

  try {
    const [order] = await db
      .insert(schema.orders)
      .values({
        orderNumber,
        status: 'pending',
        concern: recommendedConcern,
        sourcePage: 'winback',
        customerName: input.contact.name,
        customerPhone: input.contact.phone,
        customerEmail: input.contact.email,
        shippingAddress: input.shipping.address,
        shippingCity: input.shipping.city,
        shippingPostal: null,
        shippingNotes: input.shipping.notes || null,
        paymentMethod: 'COD',
        paymentStatus: 'pending',
        subtotalPkr: totals.subtotal,
        shippingPkr: totals.shipping,
        totalPkr: totals.total,
        bundleInCart: items.some((i) => i.isBundle),
        usedAiPreview: Boolean(offer.aiSessionId),
        aiSessionId: offer.aiSessionId,
        clientIpHash: ipHash,
      })
      .returning();

    let insertedItems: OrderItem[] = [];
    if (items.length) {
      insertedItems = await db
        .insert(schema.orderItems)
        .values(items.map((i) => ({
          orderId: order.id, sku: i.sku, name: i.name, qty: i.qty,
          unitPricePkr: i.unitPricePkr, isBundle: i.isBundle,
        })))
        .returning();
    }

    await markConverted(offer.id, order.id);

    await dispatchWebhook(
      process.env.WEBHOOK_ORDER_CREATED,
      buildOrderEventPayload({
        event: 'order.created',
        order,
        items: insertedItems,
        metaEventId: input.meta_event_id,
      }) as unknown as Record<string, unknown>,
      'order.created',
    );

    return NextResponse.json({ ok: true, order_number: orderNumber });
  } catch (err) {
    console.error('Winback order insert failed', err);
    return NextResponse.json(
      { ok: false, error: "We couldn't place your order. Please WhatsApp us and we'll take it manually." },
      { status: 500 },
    );
  }
}

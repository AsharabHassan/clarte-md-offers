# Clarté MD — Win-Back Offer App

Standalone Next.js 15 app that re-engages post-scan abandoners with personalized, expiring offer links.

## What it does

GHL (GoHighLevel) POSTs an abandoner's scan data to `/api/winback/create`. The app mints a short-lived, DB-backed token and returns a URL. Opening `/o/<token>` re-shows the customer's own AI before/after projection and offers a one-tap COD checkout that writes to the shared Supabase `orders` table and fires the same GHL webhooks as the main funnel.

## Setup

1. Copy `.env.example` to `.env.local` and fill in all values (mirror the funnel's `.env.local` for shared Supabase keys).
2. Run the DDL in `lib/db/winback.sql` against the shared Supabase project (SQL Editor → run).
3. `npm install && npm run dev` — the app starts on **port 3002** by default (`NEXT_PUBLIC_SITE_URL=http://localhost:3002`).

## GHL inbound contract

**Endpoint:** `POST /api/winback/create`

**Header:** `x-winback-secret: <WINBACK_INGEST_SECRET>`

**Body (JSON):**
```json
{
  "ai_session_id": "<uuid from ai_sessions table>",
  "name": "Customer Name",
  "email": "customer@email.com",
  "phone": "03001234567",
  "ghl_contact_id": "optional"
}
```

**Response (200):**
```json
{
  "ok": true,
  "url": "https://your-domain.com/o/<token>",
  "expires_at": "2026-06-12T10:00:00.000Z"
}
```

The endpoint is idempotent: if a live (non-expired, non-converted) offer already exists for the same `ai_session_id`, it returns that offer's URL without creating a new row.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Shared Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key (for signed image URLs) |
| `DATABASE_URL` | ✅ | Postgres connection string |
| `IP_HASH_PEPPER` | ✅ | Secret pepper for IP hashing |
| `WINBACK_INGEST_SECRET` | ✅ | Shared secret for GHL → `/api/winback/create` |
| `OFFER_TTL_HOURS` | — | Offer expiry in hours (default: 48) |
| `WEBHOOK_ORDER_CREATED` | — | GHL webhook URL for order events |
| `NEXT_PUBLIC_GTM_ID` | — | GTM container ID |
| `NEXT_PUBLIC_SITE_URL` | — | Public URL for building offer links |
| `AI_RATE_LIMIT_PER_HOUR` | — | Max orders per IP per hour (default: 100) |

## Running tests

```bash
npx vitest run
```

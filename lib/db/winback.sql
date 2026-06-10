create table if not exists winback_offers (
  id              uuid primary key default gen_random_uuid(),
  token           text not null unique,
  ai_session_id   uuid not null references ai_sessions(id),
  customer_name   text not null,
  customer_phone  text not null,
  customer_email  text not null,
  ghl_contact_id  text,
  status          text not null default 'created',
  expires_at      timestamptz not null,
  opened_at       timestamptz,
  order_id        uuid references orders(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists winback_offers_token_idx   on winback_offers (token);
create index if not exists winback_offers_status_idx  on winback_offers (status, created_at);
create index if not exists winback_offers_session_idx on winback_offers (ai_session_id);

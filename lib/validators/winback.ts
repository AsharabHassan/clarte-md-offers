import { z } from 'zod';

const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * Optional AI session id. A win-back contact may not have one (e.g. they never
 * ran the scan). Empty strings, whitespace, and unresolved merge tags like
 * "{{contact.ai_session_id}}" are all coerced to undefined so the offer is
 * created without a session (recommendation then defaults to acne).
 */
const optionalAiSessionId = z.preprocess((v) => {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  return UUID_RE.test(t) ? t : undefined;
}, z.string().uuid().optional());

export const CreateWinbackSchema = z.object({
  ai_session_id: optionalAiSessionId,
  name: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(32),
  ghl_contact_id: z.string().max(120).optional(),
});
export type CreateWinbackInput = z.infer<typeof CreateWinbackSchema>;

export const WinbackOrderSchema = z.object({
  token: z.string().min(8).max(128),
  contact: z.object({
    name: z.string().min(1).max(120),
    phone: z.string().min(7).max(32),
    email: z.string().email(),
  }),
  shipping: z.object({
    address: z.string().min(3).max(300),
    city: z.string().min(1).max(80),
    notes: z.string().max(500).optional(),
  }),
  items: z
    .array(z.object({ sku: z.string().min(1).max(64), qty: z.number().int().min(1).max(20) }))
    .min(1),
  meta_event_id: z.string().max(64).optional(),
});
export type WinbackOrderInput = z.infer<typeof WinbackOrderSchema>;

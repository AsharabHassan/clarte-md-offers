import { z } from 'zod';

export const CreateWinbackSchema = z.object({
  ai_session_id: z.string().uuid(),
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

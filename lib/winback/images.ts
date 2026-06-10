import { createSupabaseAdminClient } from '@/lib/supabase/server';

const SIGNED_TTL_SECONDS = 60 * 30; // 30 minutes — long enough for one session

async function sign(bucket: string, path: string): Promise<string | null> {
  const supa = createSupabaseAdminClient();
  const { data, error } = await supa.storage.from(bucket).createSignedUrl(path, SIGNED_TTL_SECONDS);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

/** Returns short-lived signed URLs for the selfie (before) and projection (after). */
export async function getBeforeAfterUrls(session: {
  inputImagePath: string;
  outputImagePath: string | null;
}): Promise<{ before: string | null; after: string | null }> {
  const before = session.inputImagePath ? await sign('ai-inputs', session.inputImagePath) : null;
  const after = session.outputImagePath ? await sign('ai-outputs', session.outputImagePath) : null;
  return { before, after };
}

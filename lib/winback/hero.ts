export type HeroMode = 'before-after' | 'after-only' | 'generic';

/** Decide how to render the result hero based on which images are available. */
export function pickHeroMode(imgs: { before: string | null; after: string | null }): HeroMode {
  if (!imgs.after) return 'generic';
  if (imgs.before) return 'before-after';
  return 'after-only';
}

/** True if the offer's expiry timestamp is at or before `now`. */
export function isExpired(expiresAt: Date, now: Date = new Date()): boolean {
  return expiresAt.getTime() <= now.getTime();
}

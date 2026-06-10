/**
 * Product image URLs for the single-product cards in the funnel.
 * These point at the live storefront's own product images
 * (https://clartemd.com.pk/products/<sku>/hero.webp) so the funnel stays
 * visually identical to the main website. The clartemd.com.pk host is
 * whitelisted in next.config.ts images.remotePatterns.
 */
export const PRODUCT_IMAGE: Record<string, string> = {
  prep: 'https://clartemd.com.pk/products/prep/hero.webp',
  rescue: 'https://clartemd.com.pk/products/rescue/hero.webp',
  vitc: 'https://clartemd.com.pk/products/vitc/hero.webp',
  acne: 'https://clartemd.com.pk/products/acne/hero.webp',
  ha: 'https://clartemd.com.pk/products/ha/hero.webp',
  reti: 'https://clartemd.com.pk/products/reti/hero.webp',
  spf: 'https://clartemd.com.pk/products/spf/hero.webp',
  light: 'https://clartemd.com.pk/products/light/hero.webp',
};

/** Local protocol hero image (copied into public/). */
export const PROTOCOL_HERO = '/protocols/acne-glow-protocol/hero.webp';

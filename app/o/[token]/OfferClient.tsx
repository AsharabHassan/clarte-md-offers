'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Banknote, Loader2, Check } from 'lucide-react';
import {
  ACNE_SOLO,
  SHIPPING_PKR,
  FUNNEL_BUNDLES,
  bundleSavings,
} from '@/lib/funnel/offer';
import { PRODUCT_META } from '@/lib/products/catalog';
import { PROTOCOL_HERO } from '@/lib/funnel/product-images';
import { CountdownTimer } from '@/components/marketing/CountdownTimer';
import { Reviews } from '@/components/funnel/Reviews';
import { CaseStudies } from '@/components/funnel/CaseStudies';
import { StarRating } from '@/components/funnel/StarRating';
import type { ReviewCard, CaseStudy } from '@/lib/reviews/types';
import type { HeroMode } from '@/lib/winback/hero';
import '@/components/funnel/funnel.css';

const PK_CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Quetta', 'Other'];

interface Props {
  token: string;
  firstName: string;
  contact: { name: string; email: string; phone: string };
  expiresAt: string;
  heroMode: HeroMode;
  before: string | null;
  after: string | null;
  analysis: Record<string, unknown> | null;
  recommendedConcern: string;
  reviews: ReviewCard[];
  caseStudies: CaseStudy[];
  aggregate: { avg: number; count: number };
  whatsapp: string;
}

export function OfferClient(props: Props) {
  const [bundleSlug, setBundleSlug] = useState<string>(ACNE_SOLO.slug);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'fbq' in window) {
      (window as unknown as { fbq: (...a: unknown[]) => void }).fbq('track', 'ViewContent');
    }
  }, []);

  async function placeOrder(form: HTMLFormElement) {
    setErr(null);
    setSubmitting(true);
    const fd = new FormData(form);
    const metaEventId = crypto.randomUUID();
    try {
      const res = await fetch('/api/winback/order', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          token: props.token,
          contact: { name: fd.get('name'), phone: fd.get('phone'), email: fd.get('email') },
          shipping: { address: fd.get('address'), city: fd.get('city'), notes: fd.get('notes') || '' },
          items: [{ sku: bundleSlug, qty: 1 }],
          meta_event_id: metaEventId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setErr(data.error || `Couldn't place your order (status ${res.status}). WhatsApp us.`);
        setSubmitting(false);
        return;
      }
      window.location.assign(`/o/${props.token}/confirmed?n=${encodeURIComponent(data.order_number)}`);
    } catch {
      setErr('Network issue. Please WhatsApp us.');
      setSubmitting(false);
    }
  }

  // Concerns come from the client's AI scan when available; when the session
  // data is missing we fall back to the recommended concern (acne).
  const concerns = Array.isArray(props.analysis?.primary_concerns)
    ? (props.analysis!.primary_concerns as string[])
    : [props.recommendedConcern];

  return (
    <section className="funnel-offer">
      <h1 className="funnel-h1">Welcome back, {props.firstName} 👋</h1>
      <p className="funnel-sub">Your Week-12 skin projection is still here. Here&apos;s what your protocol can do:</p>

      {/* Result hero */}
      <div className="funnel-hero-img" style={{ position: 'relative' }}>
        {props.heroMode === 'before-after' && props.before && props.after ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={props.before} alt="Your skin now" style={{ width: '100%', borderRadius: 12 }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={props.after} alt="Projected week 12" style={{ width: '100%', borderRadius: 12 }} />
          </div>
        ) : props.heroMode === 'after-only' && props.after ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={props.after} alt="Projected week 12" style={{ width: '100%', borderRadius: 12 }} />
        ) : (
          <Image src={PROTOCOL_HERO} alt="The Acne Glow Protocol" fill sizes="(max-width:560px) 100vw, 560px" style={{ objectFit: 'cover' }} priority />
        )}
      </div>

      {concerns.length > 0 && (
        <p className="funnel-sub">Your scan flagged: {concerns.join(', ')}.</p>
      )}

      <div className="funnel-offer-head">
        <CountdownTimer label="Offer expires in" variant="pill" deadlineIso={props.expiresAt} />
        <StarRating avg={props.aggregate.avg} count={props.aggregate.count} size="sm" />
      </div>

      {/* Protocol choice — Solo default */}
      <div className="funnel-bundles">
        {FUNNEL_BUNDLES.map((b) => {
          const selected = bundleSlug === b.slug;
          const sv = bundleSavings(b);
          return (
            <article key={b.slug} className={`funnel-bundle-card ${selected ? 'is-selected' : ''}`}>
              <div className="funnel-hero-img">
                <Image src={b.hero} alt={b.name} fill sizes="(max-width:560px) 100vw, 560px" style={{ objectFit: b.heroFit ?? 'cover' }} />
                {selected && <span className="funnel-bundle-badge"><Check className="h-3.5 w-3.5" /> Selected</span>}
              </div>
              <div className="funnel-bundle-top">
                <h3 className="funnel-bundle-name">{b.name}</h3>
                <span className="funnel-bundle-tag">{b.tagline}</span>
              </div>
              <p className="funnel-bundle-desc">{b.description}</p>
              <ul className="funnel-items">
                {b.itemSkus.map((sku) => <li key={sku}>{PRODUCT_META[sku].name}</li>)}
              </ul>
              <div className="funnel-price">
                <span className="funnel-now">PKR {b.offerPkr.toLocaleString()}</span>
                <span className="funnel-was">PKR {sv.listPkr.toLocaleString()}</span>
                <span className="funnel-save">Save {sv.savingsPkr.toLocaleString()} ({sv.savingsPct}%)</span>
              </div>
              <button
                type="button"
                className={`funnel-bundle-select ${selected ? 'is-selected' : ''}`}
                onClick={() => setBundleSlug(b.slug)}
              >
                {selected ? '✓ Selected' : 'Choose this protocol'}
              </button>
            </article>
          );
        })}
      </div>

      <div className="funnel-offer-card">
        <p className="funnel-cod"><Banknote className="h-4 w-4" /> Cash on delivery · + PKR {SHIPPING_PKR} shipping</p>
        <form className="funnel-form" onSubmit={(e) => { e.preventDefault(); placeOrder(e.currentTarget); }}>
          <input name="name" required placeholder="Full name" autoComplete="name" defaultValue={props.contact.name} />
          <input name="phone" required pattern="[0-9+\-\s()]{7,32}" inputMode="tel" placeholder="03XX XXXXXXX" autoComplete="tel" defaultValue={props.contact.phone} />
          <input name="email" type="email" required placeholder="Email" autoComplete="email" defaultValue={props.contact.email} />
          <input name="address" required minLength={3} placeholder="Street address" autoComplete="street-address" />
          <select name="city" required defaultValue="">
            <option value="" disabled>Select your city</option>
            {PK_CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input name="notes" placeholder="Delivery notes (optional)" />
          <button type="submit" className="funnel-cta" disabled={submitting}>
            {submitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Placing order&hellip;</> : 'Confirm my order (COD)'}
          </button>
          {err && <p className="funnel-error">{err}</p>}
        </form>
      </div>

      <CaseStudies cases={props.caseStudies} heading="Real 12-week before &amp; afters" />
      <Reviews reviews={props.reviews} />
    </section>
  );
}

import { CheckCircle2, MessageCircle, Truck, Banknote, ArrowUpRight, PackageCheck } from 'lucide-react';
import { TrustStrip } from '@/components/marketing/TrustStrip';
import '@/components/funnel/funnel.css';

const WHATSAPP = 'https://wa.me/923249986822';

export default async function Confirmed({ searchParams }: { searchParams: Promise<{ n?: string }> }) {
  const { n } = await searchParams;

  return (
    <>
      {/* ── Celebration band ─────────────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(160deg, #08152a 0%, #0e1f3a 55%, #142a4f 100%)',
          position: 'relative',
          overflow: 'hidden',
          padding: '48px 24px 40px',
          textAlign: 'center',
        }}
      >
        {/* Subtle background halo */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
          width: '420px', height: '420px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(46,91,168,0.22) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Check icon */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(29,138,107,0.18)', border: '1.5px solid rgba(29,138,107,0.45)',
          marginBottom: 20, position: 'relative',
        }}>
          <CheckCircle2 style={{ width: 30, height: 30, color: '#4ade80' }} strokeWidth={1.8} />
        </div>

        {/* Eyebrow */}
        <p style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.22em',
          color: '#8ab0e0', marginBottom: 10,
        }}>
          Order confirmed
        </p>

        {/* Headline */}
        <h1 style={{
          fontFamily: 'Fraunces, serif', fontWeight: 300,
          fontSize: 'clamp(32px, 8vw, 44px)', lineHeight: 1.04,
          letterSpacing: '-0.025em', color: '#ffffff', marginBottom: 12,
        }}>
          Thank you!
        </h1>

        {/* Order number pill */}
        {n && (
          <div style={{ marginBottom: 16 }}>
            <span style={{
              display: 'inline-block',
              background: 'rgba(138,176,224,0.12)',
              border: '1px solid rgba(138,176,224,0.3)',
              borderRadius: 999,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 13, fontWeight: 600,
              color: '#8ab0e0',
              padding: '6px 16px',
              letterSpacing: '0.04em',
            }}>
              {n}
            </span>
          </div>
        )}

        {/* Sub copy */}
        <p style={{
          fontFamily: 'Fraunces, serif', fontStyle: 'italic',
          fontSize: 16, lineHeight: 1.55,
          color: 'rgba(255,255,255,0.72)',
          maxWidth: 400, margin: '0 auto 28px',
        }}>
          We&apos;ve received your order and will dispatch within 24 hours.
          A WhatsApp confirmation is on its way.
        </p>

        {/* What happens next — 3 cards */}
        <ol style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          maxWidth: 480, margin: '0 auto 28px',
          listStyle: 'none', padding: 0,
          textAlign: 'left',
        }}>
          {[
            { num: '01', icon: MessageCircle, title: 'We confirm', body: 'WhatsApp message within 2 hours.' },
            { num: '02', icon: PackageCheck, title: 'We dispatch', body: 'Sealed parcel leaves within 24 hrs.' },
            { num: '03', icon: Banknote, title: 'Pay on delivery', body: 'Cash to the courier at your door.' },
          ].map(({ num, icon: Icon, title, body }) => (
            <li key={num} style={{
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(8px)',
              padding: '14px 12px',
            }}>
              <span style={{
                fontFamily: 'Fraunces, serif', fontStyle: 'italic',
                fontSize: 22, color: '#8ab0e0', lineHeight: 1, display: 'block', marginBottom: 8,
              }}>{num}</span>
              <Icon style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }} strokeWidth={1.5} />
              <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{title}</p>
              <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.45, margin: 0 }}>{body}</p>
            </li>
          ))}
        </ol>

        {/* WhatsApp ghost link */}
        <a
          href={WHATSAPP}
          target="_blank"
          rel="noopener"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.25)',
            background: 'rgba(255,255,255,0.08)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10.5, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.85)',
            padding: '10px 20px',
            textDecoration: 'none',
          }}
        >
          <MessageCircle style={{ width: 13, height: 13 }} />
          Need to change something? WhatsApp us
          <ArrowUpRight style={{ width: 11, height: 11 }} />
        </a>
      </section>

      {/* ── Delivery banner ──────────────────────────────────────── */}
      <section style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: '#eef7f1', padding: '14px 20px',
        borderBottom: '1px solid #d4eddc',
      }}>
        <span style={{
          flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 36, height: 36, borderRadius: '50%',
          background: '#1d8a6b', color: '#fff',
        }}>
          <Truck style={{ width: 16, height: 16 }} strokeWidth={1.8} />
        </span>
        <div>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: '#0e1f3a', margin: 0 }}>
            Nationwide cash-on-delivery
          </p>
          <p style={{ fontSize: 12, color: '#5b6678', margin: 0 }}>
            Dispatched within 24 hours · Flat Rs. 250 shipping · Pay the courier on arrival
          </p>
        </div>
      </section>

      {/* ── WhatsApp support card ─────────────────────────────────── */}
      <section style={{ padding: '24px 20px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 14,
          borderRadius: 18,
          border: '1px solid rgba(46,91,168,0.2)',
          background: 'rgba(46,91,168,0.04)',
          padding: '16px 18px',
        }}>
          <span style={{
            flexShrink: 0, display: 'grid', placeItems: 'center',
            width: 44, height: 44, borderRadius: '50%',
            background: '#2e5ba8', color: '#fff',
          }}>
            <MessageCircle style={{ width: 20, height: 20 }} strokeWidth={1.6} />
          </span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#0e1f3a', marginBottom: 4 }}>
              Anything we can help with?
            </p>
            <p style={{ fontSize: 13, color: '#5b6678', lineHeight: 1.5, marginBottom: 14 }}>
              A real person from our team replies on WhatsApp, usually within 2 hours, Mon–Sat.
            </p>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                borderRadius: 10, background: '#16a34a', color: '#fff',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.16em',
                padding: '10px 18px', textDecoration: 'none',
              }}
            >
              WhatsApp our team
              <ArrowUpRight style={{ width: 12, height: 12 }} />
            </a>
          </div>
        </div>
      </section>

      {/* ── Trust strip ───────────────────────────────────────────── */}
      <section style={{ padding: '28px 20px 48px' }}>
        <TrustStrip variant="chips" tone="light" limit={4} />
      </section>
    </>
  );
}

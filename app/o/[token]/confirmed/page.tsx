import Link from 'next/link';

const WHATSAPP = 'https://wa.me/923249986822';

export default async function Confirmed({ searchParams }: { searchParams: Promise<{ n?: string }> }) {
  const { n } = await searchParams;
  return (
    <section className="funnel-scan" style={{ textAlign: 'center' }}>
      <h1 className="funnel-h1">Thank you! 🎉</h1>
      <p className="funnel-sub">
        Your order {n ? <strong>{n}</strong> : null} is confirmed. We&apos;ll dispatch within 24 hours and you
        pay cash on delivery. A WhatsApp confirmation is on its way.
      </p>
      <Link className="funnel-cta" href={WHATSAPP} style={{ marginTop: 16 }}>
        Message us on WhatsApp
      </Link>
    </section>
  );
}

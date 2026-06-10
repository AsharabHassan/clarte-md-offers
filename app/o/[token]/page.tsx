import { notFound } from 'next/navigation';
import { findByToken, markOpened, markExpired } from '@/lib/winback/offers';
import { isExpired, pickHeroMode } from '@/lib/winback/hero';
import { getBeforeAfterUrls } from '@/lib/winback/images';
import { getAcneReviews } from '@/lib/reviews/queries';
import { db, schema } from '@/lib/db/client';
import { sql } from 'drizzle-orm';
import { OfferClient } from './OfferClient';

export const dynamic = 'force-dynamic';

const WHATSAPP = 'https://wa.me/923249986822';

export default async function OfferPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const offer = await findByToken(token);
  if (!offer) notFound();

  if (offer.status === 'converted') {
    return (
      <ExpiredOrDone
        title="You've already ordered 🎉"
        body="This offer was already used. Need anything? Message our team on WhatsApp."
      />
    );
  }
  if (isExpired(new Date(offer.expiresAt))) {
    await markExpired(offer.id);
    return (
      <ExpiredOrDone
        title="This offer has expired"
        body="Your personalized link is no longer active. WhatsApp us and we'll sort you out."
      />
    );
  }

  await markOpened(offer.id);

  // Load the scan this offer is tied to.
  const sessions = await db
    .select()
    .from(schema.aiSessions)
    .where(sql`id = ${offer.aiSessionId}`)
    .limit(1);
  const session = sessions[0];
  const imgs = session
    ? await getBeforeAfterUrls({
        inputImagePath: session.inputImagePath,
        outputImagePath: session.outputImagePath,
      })
    : { before: null, after: null };
  const heroMode = pickHeroMode(imgs);

  const { reviews, caseStudies, aggregate } = await getAcneReviews();
  const analysis = (session?.analysisJson ?? null) as Record<string, unknown> | null;

  return (
    <OfferClient
      token={offer.token}
      firstName={offer.customerName.split(' ')[0] || 'there'}
      contact={{ name: offer.customerName, email: offer.customerEmail, phone: offer.customerPhone }}
      expiresAt={new Date(offer.expiresAt).toISOString()}
      heroMode={heroMode}
      before={imgs.before}
      after={imgs.after}
      analysis={analysis}
      reviews={reviews}
      caseStudies={caseStudies}
      aggregate={aggregate}
      whatsapp={WHATSAPP}
    />
  );
}

function ExpiredOrDone({ title, body }: { title: string; body: string }) {
  return (
    <section className="funnel-scan" style={{ textAlign: 'center' }}>
      <h1 className="funnel-h1">{title}</h1>
      <p className="funnel-sub">{body}</p>
      <a className="funnel-cta" href={WHATSAPP} target="_blank" rel="noopener" style={{ marginTop: 16 }}>
        WhatsApp our team
      </a>
    </section>
  );
}

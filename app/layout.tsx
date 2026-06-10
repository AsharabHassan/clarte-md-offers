import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Clarté MD — Exclusive Win-Back Offer',
  description: 'Your personalised Clarté MD win-back offer.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

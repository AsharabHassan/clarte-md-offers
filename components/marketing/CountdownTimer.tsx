'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useSaleCountdown } from '@/lib/marketing/use-sale-countdown';
import { useReducedMotion } from '@/lib/anim/hooks';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  /** Cadence label shown next to the timer (e.g. 'Offer ends in'). */
  label?: string;
  /** Visual variant. */
  variant?: 'inline' | 'pill' | 'bar';
  /** Hours, defaults to 6. Ignored when windowMinutes is set. */
  windowHours?: number;
  /** When set, overrides windowHours for short (sub-hour) timers. */
  windowMinutes?: number;
  /** localStorage key so multiple timers don't collide. */
  storageKey?: string;
  /**
   * When provided, counts down to this fixed ISO timestamp instead of using
   * the rolling localStorage window. localStorage writes are skipped.
   */
  deadlineIso?: string;
  className?: string;
}

/** Decompose a millisecond duration into h/m/s. */
function msToHms(ms: number) {
  const total = Math.max(0, ms);
  return {
    hours: Math.floor(total / 3_600_000),
    minutes: Math.floor((total % 3_600_000) / 60_000),
    seconds: Math.floor((total % 60_000) / 1000),
  };
}

/**
 * Renders a hours:minutes:seconds countdown driven by useSaleCountdown.
 * "inline" is for promo bars, "pill" for buy boxes, "bar" for full-width
 * urgency strips.
 *
 * When `deadlineIso` is supplied the timer counts down to that fixed point in
 * time; the rolling-window localStorage logic is bypassed entirely.
 */
export function CountdownTimer({
  label = 'Offer ends in',
  variant = 'inline',
  windowHours = 6,
  windowMinutes,
  storageKey,
  deadlineIso,
  className,
}: CountdownTimerProps) {
  // --- fixed-deadline branch (e.g. win-back offer page) ---
  const [deadlineMs, setDeadlineMs] = useState<number>(() =>
    deadlineIso ? new Date(deadlineIso).getTime() - Date.now() : 0,
  );
  useEffect(() => {
    if (!deadlineIso) return;
    // Sync on mount (avoids SSR/CSR mismatch) then tick every second.
    setDeadlineMs(new Date(deadlineIso).getTime() - Date.now());
    const id = window.setInterval(
      () => setDeadlineMs(new Date(deadlineIso).getTime() - Date.now()),
      1000,
    );
    return () => window.clearInterval(id);
  }, [deadlineIso]);

  // --- rolling-window branch (existing behaviour) ---
  const windowMs =
    windowMinutes != null ? windowMinutes * 60 * 1000 : windowHours * 60 * 60 * 1000;
  const rollingState = useSaleCountdown(
    deadlineIso ? windowMs : windowMs,
    deadlineIso ? '__unused__' : storageKey,
  );

  const { hours, minutes, seconds } = deadlineIso
    ? msToHms(deadlineMs)
    : rollingState;
  const reduced = useReducedMotion();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const clock =
    hours > 0
      ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(minutes)}:${pad(seconds)}`;

  if (variant === 'pill') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-full border border-rust/40 bg-rust/5 px-3 py-1.5',
          className,
        )}
      >
        <motion.span
          aria-hidden="true"
          animate={reduced ? undefined : { scale: [1, 1.25, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-block h-1.5 w-1.5 rounded-full bg-rust"
        />
        <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-mute">
          {label}
        </span>
        <span className="font-mono text-[12px] font-semibold tabular-nums text-rust">
          {clock}
        </span>
      </div>
    );
  }

  if (variant === 'bar') {
    return (
      <div
        className={cn(
          'flex items-center justify-center gap-3 border-y border-rust/30 bg-rust/8 px-4 py-2',
          className,
        )}
      >
        <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-rust">
          {label}
        </span>
        <span className="font-mono text-[14px] font-semibold tabular-nums text-rust">
          {clock}
        </span>
      </div>
    );
  }

  // inline (default)
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <motion.span
        aria-hidden="true"
        animate={reduced ? undefined : { opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        className="inline-block h-1.5 w-1.5 rounded-full bg-rust"
      />
      <span className="font-mono text-[10.5px] uppercase tracking-[0.18em]">
        {label}
      </span>
      <span className="font-mono text-[11px] font-semibold tabular-nums text-rust">
        {clock}
      </span>
    </span>
  );
}

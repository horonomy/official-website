import React from 'react';
import {LAYERS} from './layers';
import styles from './EnvironmentProps.module.css';

/** Stable id for the glass clip so the sand can never overflow the bulb. */
const GLASS_CLIP_ID = 'hn-hourglass-glass';

/**
 * Interior hollow of the glass (both chambers). Reused as the `clipPath` so every
 * sand element — draining top, falling stream, growing pile, particles — is masked
 * to the bulb outline and can never spill past the glass.
 */
const GLASS_INTERIOR =
  'M17 13 H43 C43 33 33 47 31.5 50 C33 53 43 67 43 87 H17 C17 67 27 53 28.5 50 C27 47 17 33 17 13 Z';

/**
 * Animated SVG hourglass — a self-contained decorative prop for the hero terrace.
 *
 * All motion is pure CSS (see `EnvironmentProps.module.css`): the top chamber
 * drains, a thin stream falls to a growing pile, a few grains tumble through, and
 * the whole glass flips 180° at each half-cycle so the loop returns to its start
 * state seamlessly. Everything is masked by {@link GLASS_INTERIOR} so sand stays
 * inside the glass. SSR-safe (no `window`/`document`); `aria-hidden` via the slot.
 *
 * `enabled` lets the prop be switched off independently of the rest of the scene.
 * Reduced-motion users get a static, mid-filled hourglass (handled in CSS).
 */
export function AnimatedHourglass({
  enabled = true,
}: {
  enabled?: boolean;
}): React.ReactElement | null {
  if (!enabled) {
    return null;
  }

  return (
    <svg
      className={styles.hourglass}
      viewBox="0 0 60 100"
      fill="none"
      role="presentation">
      <defs>
        <clipPath id={GLASS_CLIP_ID}>
          <path d={GLASS_INTERIOR} />
        </clipPath>
        <linearGradient id="hn-hourglass-sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--hn-gold-bright)" />
          <stop offset="100%" stopColor="var(--hn-gold)" />
        </linearGradient>
        <linearGradient id="hn-hourglass-shine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
          <stop offset="55%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      {/* Everything below the frame flips together at each half-cycle. */}
      <g className={styles.spin}>
        {/* Faint glass body so the empty chambers still read as glass. */}
        <path d={GLASS_INTERIOR} className={styles.glassBody} />

        {/* Sand + stream + grains, masked to the glass interior. */}
        <g clipPath={`url(#${GLASS_CLIP_ID})`}>
          {/* Draining top chamber (shrinks toward the neck). */}
          <rect
            className={styles.sandTop}
            x="15"
            y="13"
            width="30"
            height="37"
            fill="url(#hn-hourglass-sand)"
          />
          {/* Growing pile in the bottom chamber. */}
          <rect
            className={styles.sandPile}
            x="15"
            y="51"
            width="30"
            height="37"
            fill="url(#hn-hourglass-sand)"
          />

          {/* Falling stream — one for each drain direction across the flip. */}
          <rect
            className={styles.streamDown}
            x="29.1"
            y="50"
            width="1.8"
            height="37"
            fill="var(--hn-gold-bright)"
          />
          <rect
            className={styles.streamUp}
            x="29.1"
            y="13"
            width="1.8"
            height="37"
            fill="var(--hn-gold-bright)"
          />

          {/* A few tumbling grains for life. */}
          <g className={styles.grainsDown}>
            <circle cx="28.6" cy="52" r="0.7" fill="var(--hn-gold-bright)" />
            <circle cx="31.4" cy="58" r="0.6" fill="var(--hn-amber)" />
            <circle cx="30" cy="64" r="0.7" fill="var(--hn-gold-bright)" />
          </g>
          <g className={styles.grainsUp}>
            <circle cx="31.4" cy="48" r="0.7" fill="var(--hn-gold-bright)" />
            <circle cx="28.6" cy="42" r="0.6" fill="var(--hn-amber)" />
            <circle cx="30" cy="36" r="0.7" fill="var(--hn-gold-bright)" />
          </g>
        </g>

        {/* Glass outline + caps + posts. */}
        <path
          d={GLASS_INTERIOR}
          className={styles.glassOutline}
          stroke="var(--hn-gold)"
        />
        <path
          d="M13 10 H47 M13 90 H47 M15 10 V13 M45 10 V13 M15 90 V87 M45 90 V87"
          className={styles.frame}
          stroke="var(--hn-gold)"
        />
        <rect
          x="13"
          y="8.4"
          width="34"
          height="2.4"
          rx="1.2"
          fill="var(--hn-gold)"
        />
        <rect
          x="13"
          y="89.2"
          width="34"
          height="2.4"
          rx="1.2"
          fill="var(--hn-gold)"
        />

        {/* Subtle glass shine. */}
        <path
          d="M20 16 C18 30 24 42 28.5 49"
          className={styles.shine}
          stroke="url(#hn-hourglass-shine)"
        />
      </g>
    </svg>
  );
}

/**
 * Foreground props resting on the terrace beside the observer. Decorative
 * (`aria-hidden`); positioned in the lower-right corner of the scene near the
 * annotation card so it never overlaps the copy or CTAs.
 *
 * HORO-6: the animated hourglass now lives here (see {@link AnimatedHourglass}).
 */
export default function EnvironmentProps(): React.ReactElement {
  return (
    <div
      className={styles.root}
      style={{zIndex: LAYERS.props}}
      aria-hidden="true">
      <div className={styles.hourglassSlot}>
        <AnimatedHourglass />
      </div>
    </div>
  );
}

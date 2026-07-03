import React from 'react';
import {LAYERS} from './layers';
import styles from './AmbientEffects.module.css';

/**
 * Minimal static twinkle stars scattered over the sky. Purely decorative
 * (`aria-hidden`); the twinkle animation is gated behind
 * `prefers-reduced-motion: reduce`.
 *
 * STUB SLOT — a light static starfield for now.
 * // HORO-5 adds the full ambient system (starfield density, haze, shooting stars).
 */

// Fixed positions (percent of the scene) so render output is deterministic and
// SSR-stable — no Math.random at module or render top level.
const STARS: Array<{top: string; left: string; size: number; delay: string}> = [
  {top: '12%', left: '18%', size: 2, delay: '0s'},
  {top: '20%', left: '42%', size: 3, delay: '0.6s'},
  {top: '9%', left: '63%', size: 2, delay: '1.2s'},
  {top: '28%', left: '80%', size: 2, delay: '0.3s'},
  {top: '16%', left: '90%', size: 3, delay: '0.9s'},
  {top: '34%', left: '30%', size: 2, delay: '1.5s'},
  {top: '40%', left: '55%', size: 2, delay: '0.4s'},
  {top: '22%', left: '8%', size: 2, delay: '1.1s'},
  {top: '48%', left: '72%', size: 2, delay: '0.7s'},
  {top: '6%', left: '35%', size: 2, delay: '1.8s'},
];

export default function AmbientEffects(): React.ReactElement {
  return (
    <div
      className={styles.root}
      style={{zIndex: LAYERS.ambient}}
      aria-hidden="true">
      {STARS.map((s, i) => (
        <span
          key={i}
          className={styles.star}
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
          }}
        />
      ))}
    </div>
  );
}

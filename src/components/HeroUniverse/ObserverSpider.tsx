import React, {useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {LAYERS} from './layers';
import styles from './ObserverSpider.module.css';

/**
 * The First Horologer — the hero spider observer.
 *
 * Key-pose character animation (HORO-30) composited from the accurate,
 * registration-matched reference sheets (`spider_keeper-animation_10/11`, sliced
 * to `static/img/hero/keeper/*.webp`). The keeper holds its gold astrolabe and,
 * on a slow autonomous loop, studies it, reaches out and adjusts it (the
 * astrolabe glows as it works), then settles — every frame is the full
 * character (all legs, cloak, astrolabe) feet-registered so the crossfade never
 * jumps. Grounded with a soft contact shadow and swaying with the wind gusts
 * (`--obs-wind`). Decorative (`aria-hidden`); all motion off under
 * `prefers-reduced-motion`.
 */

/** All keeper frames (crossfaded). Feet-registered, same character + scale. */
const FRAMES = [
  'examine-a',
  'examine-b',
  'examine-c',
  'examine-d',
  'examine-e',
  'examine-f',
  'rest',
  'reach',
  'touch',
] as const;
type Frame = (typeof FRAMES)[number];

/** The astrolabe reads as "active" (glowing) while the keeper works on it. */
const GLOW_FRAMES: ReadonlySet<Frame> = new Set(['reach', 'touch']);

/**
 * Autonomous "study the astrolabe" performance: [frame, dwell ms]. Idle examine
 * beats interleaved with a reach → touch → adjust → settle interaction.
 */
const SEQUENCE: ReadonlyArray<readonly [Frame, number]> = [
  ['examine-a', 2400],
  ['examine-c', 2100],
  ['examine-e', 2300],
  ['rest', 900],
  ['reach', 700],
  ['touch', 1700], // adjust — astrolabe glows
  ['reach', 600],
  ['examine-b', 2300],
  ['examine-f', 2400],
  ['examine-d', 2200],
];

export default function ObserverSpider(): React.ReactElement {
  const base = useBaseUrl('/img/hero/keeper/');
  const rootRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState<Frame>('examine-a');

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return undefined;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined; // static resting pose, no loop/wind
    }

    // Autonomous study/adjust loop.
    let seqTimer = 0;
    let idx = 0;
    const tick = (): void => {
      const [next, dwell] = SEQUENCE[idx];
      setFrame(next);
      idx = (idx + 1) % SEQUENCE.length;
      seqTimer = window.setTimeout(tick, dwell);
    };
    seqTimer = window.setTimeout(tick, 2400);

    // Wind sway — ease `--obs-wind` (0..1) so the keeper leans on gusts.
    const WIND_CALM = 0.15;
    let wind = WIND_CALM;
    let gustPeak = WIND_CALM;
    let gusting = false;
    let nextEventAt = 0;
    let windRaf = 0;
    const windLoop = (t: number): void => {
      if (nextEventAt === 0) {
        nextEventAt = t + 3000 + Math.random() * 5000;
      }
      if (t >= nextEventAt) {
        if (gusting) {
          gusting = false;
          nextEventAt = t + 4000 + Math.random() * 6000;
        } else {
          gusting = true;
          gustPeak = 0.45 + Math.random() * 0.55;
          nextEventAt = t + 900 + Math.random() * 1600;
        }
      }
      wind += ((gusting ? gustPeak : WIND_CALM) - wind) * 0.045;
      root.style.setProperty('--obs-wind', wind.toFixed(3));
      windRaf = window.requestAnimationFrame(windLoop);
    };
    windRaf = window.requestAnimationFrame(windLoop);

    return () => {
      window.clearTimeout(seqTimer);
      if (windRaf !== 0) window.cancelAnimationFrame(windRaf);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={styles.root}
      style={{zIndex: LAYERS.observer}}
      aria-hidden="true">
      {/* Soft contact shadow so the keeper stands on the dais, not floating. */}
      <div className={styles.contactShadow} />
      {/* Wind sway wrapper — leans with the `--obs-wind` gust value. */}
      <div className={styles.sway}>
        <div className={clsx(styles.poses, GLOW_FRAMES.has(frame) && styles.working)}>
          {FRAMES.map((f) => (
            <img
              key={f}
              className={clsx(styles.pose, frame === f && styles.visible)}
              src={`${base}${f}.webp`}
              alt=""
              loading="eager"
              decoding="async"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

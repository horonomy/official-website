import React, {useEffect, useRef} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {LAYERS} from './layers';
import styles from './ObserverSpider.module.css';

/**
 * The First Horologer — the hero spider observer, rendered on the stone
 * platform. Decorative (`aria-hidden`); the headline carries the semantics.
 *
 * Renders `observer.webp` as a single layer with a calm, pure-CSS idle
 * animation (slow breathing bob/sway + a soft astrolabe glow pulse). On top of
 * that idle life, an interim "gaze" makes the observer subtly lean toward the
 * pointer: a pointer listener writes a normalized cursor offset to two
 * component-scoped CSS variables (`--gaze-x`/`--gaze-y`, -1..1) on the root
 * element, which a wrapper layer turns into a small, clamped rotate + translate.
 * All motion is disabled under `prefers-reduced-motion: reduce`.
 */
export default function ObserverSpider(): React.ReactElement {
  const observer = useBaseUrl('/img/hero/observer.webp');
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return undefined;
    }
    // Reduced-motion users get the static resting pose — no gaze follow at all.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    let rafId = 0;
    let nextX = 0;
    let nextY = 0;

    const clamp = (v: number): number => (v < -1 ? -1 : v > 1 ? 1 : v);

    // Commit the latest normalized offset once per frame; the CSS transition on
    // the gaze wrapper eases the actual follow so it never snaps.
    const apply = (): void => {
      rafId = 0;
      root.style.setProperty('--gaze-x', nextX.toFixed(3));
      root.style.setProperty('--gaze-y', nextY.toFixed(3));
    };

    const onPointerMove = (event: PointerEvent): void => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      // Normalize to -1..1 around the viewport centre so the lean points at the
      // cursor regardless of screen size.
      nextX = clamp((event.clientX / w) * 2 - 1);
      nextY = clamp((event.clientY / h) * 2 - 1);
      if (rafId === 0) {
        rafId = window.requestAnimationFrame(apply);
      }
    };

    window.addEventListener('pointermove', onPointerMove, {passive: true});

    // Wind sway: ease a 0..1 gust value (`--obs-wind`) so the keeper and its
    // cloak silhouette lean when a gust passes. Gusts arrive on a randomized
    // cadence (calm ~0.15, gust up to ~1.0) so the sway never feels mechanical.
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
      const target = gusting ? gustPeak : WIND_CALM;
      // Ease toward the target so gusts rise and fall smoothly.
      wind += (target - wind) * 0.045;
      root.style.setProperty('--obs-wind', wind.toFixed(3));
      windRaf = window.requestAnimationFrame(windLoop);
    };
    windRaf = window.requestAnimationFrame(windLoop);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
      if (windRaf !== 0) {
        window.cancelAnimationFrame(windRaf);
      }
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={styles.root}
      style={{zIndex: LAYERS.observer}}
      aria-hidden="true">
      {/* Soft contact shadow cast on the dais, so the keeper reads as standing
          on the stone rather than floating above it. */}
      <div className={styles.contactShadow} />
      <div className={styles.gaze}>
        {/* Wind sway: leans with the `--obs-wind` gust value written above. */}
        <div className={styles.sway}>
          <img
            className={styles.observer}
            src={observer}
            alt=""
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}

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

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={styles.root}
      style={{zIndex: LAYERS.observer}}
      aria-hidden="true">
      <div className={styles.gaze}>
        <img
          className={styles.observer}
          src={observer}
          alt=""
          loading="eager"
          decoding="async"
        />
      </div>
    </div>
  );
}

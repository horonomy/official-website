import React from 'react';
import {LAYERS} from './layers';
import {createStarField} from './starfield';
import styles from './AmbientEffects.module.css';

/**
 * Ambient decorative layer for the HeroUniverse hero (HORO-5).
 *
 * Enhances — rather than repaints — the already-starred sky backdrop with four
 * subtle, GPU-friendly effects:
 *   - gentle per-star twinkle and occasional low-frequency shooting stars,
 *     drawn on a canvas star field (`./starfield.ts`);
 *   - two slow-drifting haze clouds (navy / gold / soft purple gradients);
 *   - light cursor + scroll parallax, applied through CSS custom properties so
 *     only compositor-friendly `transform`s change.
 *
 * Purely decorative (`aria-hidden`) and sits at `z = ambient`, above the sky
 * backdrop but below the observer and content layers.
 *
 * SSR-safe: all `window`/`canvas` work happens inside `useEffect`, guarded for
 * the browser. Under `prefers-reduced-motion: reduce` the star field renders a
 * single static frame, the haze/parallax animations are disabled in CSS, and no
 * parallax listeners are attached — the layer is fully static.
 */
export default function AmbientEffects(): React.ReactElement {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root || typeof window === 'undefined') return;

    const field = createStarField(canvas);

    const parent = canvas.parentElement;
    const observer =
      parent && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => field.resize())
        : null;
    if (observer && parent) observer.observe(parent);

    const reduceMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

    // Parallax: write pointer/scroll offset into CSS custom properties and let
    // the compositor translate the layers. Skipped entirely for reduced motion.
    let frame = 0;
    let px = 0;
    let py = 0;
    let sy = 0;

    const apply = (): void => {
      frame = 0;
      root.style.setProperty('--hn-amb-px', px.toFixed(3));
      root.style.setProperty('--hn-amb-py', py.toFixed(3));
      root.style.setProperty('--hn-amb-sy', sy.toFixed(2));
    };
    const schedule = (): void => {
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    const onPointerMove = (e: PointerEvent): void => {
      px = e.clientX / window.innerWidth - 0.5; // -0.5..0.5
      py = e.clientY / window.innerHeight - 0.5;
      schedule();
    };
    const onScroll = (): void => {
      sy = window.scrollY || 0;
      schedule();
    };

    if (!reduceMotion) {
      window.addEventListener('pointermove', onPointerMove, {passive: true});
      window.addEventListener('scroll', onScroll, {passive: true});
    }

    return () => {
      field.destroy();
      if (observer) observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      if (!reduceMotion) {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('scroll', onScroll);
      }
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={styles.root}
      style={{zIndex: LAYERS.ambient}}
      aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={`${styles.haze} ${styles.hazeA}`} />
      <div className={`${styles.haze} ${styles.hazeB}`} />
    </div>
  );
}

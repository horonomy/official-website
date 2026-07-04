import React from 'react';
import {LAYERS} from './layers';
import {createStarField} from './starfield';
import styles from './AmbientEffects.module.css';

/**
 * Ambient decorative layer for the HeroUniverse hero (HORO-5).
 *
 * Enhances — rather than repaints — the already-starred sky backdrop with a few
 * subtle, GPU-friendly effects:
 *   - a dense, gently twinkling canvas star field (`./starfield.ts`) — no
 *     shooting stars or meteors, just a living field of stars that breathe;
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

    // Ambient breeze: a slow gust driver that eases the `--wind` custom property
    // up to an occasional gust and lets it decay back to the calm baseline. The
    // dust drift (CSS) scales its travel by this value, so the field breathes
    // with the breeze. Cadence is randomized (~5–12s) so it never feels
    // mechanical. Skipped entirely for reduced motion — `--wind` then holds at
    // the calm baseline declared in CSS and the scene stays static.
    const WIND_CALM = 0.18;
    let windValue = WIND_CALM; // eased, written to CSS each frame
    let windTarget = WIND_CALM; // gust peak, decays back toward calm
    let windFrame = 0;
    let nextGustAt = 0;
    const scheduleGust = (now: number): void => {
      nextGustAt = now + 5000 + Math.random() * 7000; // ~5–12s
    };
    const windTick = (now: number): void => {
      windFrame = window.requestAnimationFrame(windTick);
      if (now >= nextGustAt) {
        windTarget = 0.35 + Math.random() * 0.65; // gust 0.35–1.0
        scheduleGust(now);
      }
      // Gust target decays back to calm; the written value eases toward it, so
      // each gust reads as an organic rise and fall rather than a step.
      windTarget += (WIND_CALM - windTarget) * 0.012;
      windValue += (windTarget - windValue) * 0.05;
      root.style.setProperty('--wind', windValue.toFixed(3));
    };
    if (!reduceMotion) {
      scheduleGust(window.performance?.now?.() ?? 0);
      windFrame = window.requestAnimationFrame(windTick);
    }

    return () => {
      field.destroy();
      if (observer) observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      if (windFrame) window.cancelAnimationFrame(windFrame);
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

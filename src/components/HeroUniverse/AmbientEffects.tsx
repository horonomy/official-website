import React from 'react';
import {LAYERS} from './layers';
import {createStarField} from './starfield';
import {createMeteorShower} from './meteors';
import styles from './AmbientEffects.module.css';

/**
 * Ambient decorative layer for the HeroUniverse hero (HORO-5).
 *
 * Enhances — rather than repaints — the already-starred sky backdrop with a few
 * subtle, GPU-friendly effects:
 *   - a dense, gently twinkling canvas star field (`./starfield.ts`) — a
 *     living field of stars that breathe;
 *   - occasional meteors / shooting stars that streak across the sky
 *     (`./meteors.ts`), on their own canvas layered above the star field;
 *   - two slow-drifting haze clouds (navy / gold / soft purple gradients);
 *   - a wind-driven star-dust field of tiny motes that fade in, drift, and fade
 *     out, their travel scaled by an ambient breeze (`--wind`, HORO-8);
 *   - light cursor + scroll parallax, applied through CSS custom properties so
 *     only compositor-friendly `transform`s change.
 *
 * Purely decorative (`aria-hidden`) and sits at `z = ambient`, above the sky
 * backdrop but below the observer and content layers.
 *
 * SSR-safe: all `window`/`canvas` work happens inside `useEffect`, guarded for
 * the browser. The dust nodes come from a fixed, deterministic config so server
 * and client markup match (no hydration mismatch). Under
 * `prefers-reduced-motion: reduce` the star field renders a single static
 * frame, the haze/parallax/dust animations are disabled in CSS, the gust driver
 * is not attached, and no parallax listeners are added — the layer is fully
 * static.
 */

/**
 * Fixed star-dust motes. Deterministic (no runtime randomness) so SSR and the
 * client render identical markup. `dx`/`dy` are each mote's base drift vector
 * in px — mostly rightward, as if the breeze moves across the scene — scaled at
 * runtime by `--wind`. Negative delays stagger the field so it is already in
 * motion at first paint. Palette: soft starlight, gold, and purple.
 */
interface DustMote {
  top: string;
  left: string;
  size: number;
  color: string;
  dx: number;
  dy: number;
  dur: number;
  delay: number;
  peak: number;
}

const STARLIGHT = 'rgba(226, 232, 240, 0.9)';
const GOLD = 'rgba(201, 164, 92, 0.85)';
const PURPLE = 'rgba(112, 82, 168, 0.8)';

const DUST: readonly DustMote[] = [
  {top: '22%', left: '12%', size: 2.4, color: STARLIGHT, dx: 84, dy: -14, dur: 19, delay: -2, peak: 0.55},
  {top: '68%', left: '18%', size: 1.8, color: GOLD, dx: 70, dy: 10, dur: 23, delay: -11, peak: 0.4},
  {top: '40%', left: '8%', size: 2.0, color: PURPLE, dx: 96, dy: -6, dur: 21, delay: -6, peak: 0.45},
  {top: '80%', left: '30%', size: 1.6, color: STARLIGHT, dx: 62, dy: -12, dur: 26, delay: -18, peak: 0.35},
  {top: '15%', left: '38%', size: 2.6, color: GOLD, dx: 78, dy: 8, dur: 18, delay: -4, peak: 0.6},
  {top: '55%', left: '46%', size: 1.9, color: STARLIGHT, dx: 90, dy: -10, dur: 24, delay: -14, peak: 0.4},
  {top: '30%', left: '58%', size: 2.2, color: PURPLE, dx: 66, dy: 12, dur: 22, delay: -9, peak: 0.5},
  {top: '74%', left: '62%', size: 1.7, color: GOLD, dx: 82, dy: -8, dur: 20, delay: -3, peak: 0.42},
  {top: '48%', left: '70%', size: 2.3, color: STARLIGHT, dx: 74, dy: 6, dur: 25, delay: -16, peak: 0.55},
  {top: '20%', left: '78%', size: 1.8, color: PURPLE, dx: 88, dy: -14, dur: 19, delay: -7, peak: 0.38},
  {top: '62%', left: '84%', size: 2.5, color: GOLD, dx: 60, dy: 10, dur: 27, delay: -21, peak: 0.5},
  {top: '36%', left: '90%', size: 1.6, color: STARLIGHT, dx: 72, dy: -6, dur: 23, delay: -12, peak: 0.36},
  {top: '86%', left: '52%', size: 2.0, color: STARLIGHT, dx: 94, dy: -12, dur: 21, delay: -5, peak: 0.44},
  {top: '10%', left: '66%', size: 1.9, color: GOLD, dx: 68, dy: 8, dur: 24, delay: -15, peak: 0.46},
];

export default function AmbientEffects(): React.ReactElement {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const meteorCanvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root || typeof window === 'undefined') return;

    const field = createStarField(canvas);
    const meteorCanvas = meteorCanvasRef.current;
    const shower = meteorCanvas ? createMeteorShower(meteorCanvas) : null;

    const parent = canvas.parentElement;
    const observer =
      parent && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            field.resize();
            shower?.resize();
          })
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
      shower?.destroy();
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
      <canvas ref={meteorCanvasRef} className={styles.meteorCanvas} />
      <div className={`${styles.haze} ${styles.hazeA}`} />
      <div className={`${styles.haze} ${styles.hazeB}`} />
      {DUST.map((mote, i) => (
        <span
          key={i}
          className={styles.dust}
          style={
            {
              top: mote.top,
              left: mote.left,
              '--hn-dust-size': `${mote.size}px`,
              '--hn-dust-color': mote.color,
              '--hn-dust-dx': `${mote.dx}px`,
              '--hn-dust-dy': `${mote.dy}px`,
              '--hn-dust-dur': `${mote.dur}s`,
              '--hn-dust-delay': `${mote.delay}s`,
              '--hn-dust-peak': mote.peak,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

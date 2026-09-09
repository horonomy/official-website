import React from 'react';
import {createSceneMotion} from '../primitives/sceneMotion.mjs';
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
  const controller = React.useRef<ReturnType<typeof createSceneMotion> | null>(null);
  const [ready, setReady] = React.useState(false);
  const [state, setState] = React.useState({
    mode: 'static', paused: false, reduced: false,
  });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const meteorCanvas = meteorCanvasRef.current;
    const scene = rootRef.current?.closest<HTMLElement>('[data-hn-motion]');
    if (!canvas || !meteorCanvas || !scene) return;
    const motion = createSceneMotion({
      element: scene,
      factories: [
        () => createStarField(canvas),
        () => createMeteorShower(meteorCanvas),
      ],
      onState: setState,
    });
    controller.current = motion;
    setReady(true);
    return () => {
      motion.destroy();
      controller.current = null;
    };
  }, []);

  let controlLabel = state.paused ? 'Resume scene motion' : 'Pause scene motion';
  if (state.reduced) controlLabel = 'Reduced motion enabled';
  if (state.mode === 'failed') controlLabel = 'Scene motion unavailable';

  return (
    <>
      <div
        ref={rootRef}
        className={styles.root}
        style={{zIndex: LAYERS.ambient}}
        aria-hidden="true"
        data-hn-decoration="">
        <canvas ref={canvasRef} className={styles.canvas} />
        <canvas ref={meteorCanvasRef} className={styles.meteorCanvas} />
        <div className={`${styles.haze} ${styles.hazeA}`} />
        <div className={`${styles.haze} ${styles.hazeB}`} />
        {DUST.map(mote => (
          <span
            key={`${mote.top}-${mote.left}`}
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
      <button
        type="button"
        hidden={!ready}
        className={styles.motionControl}
        aria-pressed={state.paused || state.reduced}
        disabled={state.reduced || state.mode === 'failed'}
        onClick={() => controller.current?.setPaused(!state.paused)}>
        {controlLabel}
      </button>
    </>
  );
}

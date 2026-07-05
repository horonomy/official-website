/**
 * Ambient canvas star field for the HeroUniverse hero (HORO-5, HORO-18).
 *
 * A device-pixel-ratio–aware 2D canvas that layers a *dense but subtle*
 * twinkling starfield over the already-painted sky backdrop — a living field of
 * stars that breathe. (Meteors / shooting stars are a separate layer; see
 * `./meteors.ts`.)
 *
 * The field is intentionally dense so the sky reads as alive, with varied size,
 * brightness, and colour temperature (cool white / soft gold / faint blue, plus
 * a touch of scene purple). Only per-star alpha changes each frame, so the work
 * stays cheap and compositor-friendly.
 *
 * Client-only: callers must instantiate inside a `useEffect` (it touches
 * `window`, `canvas`, and `requestAnimationFrame`). Honors
 * `prefers-reduced-motion: reduce` by drawing a single static frame of the same
 * dense field and never starting the animation loop.
 */

type Star = {
  x: number; // 0..1 fraction of width
  y: number; // 0..1 fraction of height
  r: number; // base radius in css px
  color: string; // "r,g,b"
  base: number; // base alpha
  amp: number; // twinkle amplitude
  speed: number; // twinkle angular speed
  phase: number; // twinkle phase offset
};

// Scene palette by colour temperature: cool white dominates, warmed by soft
// gold, cooled by faint blue, with a rare touch of scene purple/deep gold.
const STAR_COLORS = [
  {c: '229,231,235', w: 0.42}, // cool white — most common
  {c: '244,245,247', w: 0.14}, // bright white
  {c: '224,185,120', w: 0.16}, // soft gold (--hn-gold-bright)
  {c: '150,175,214', w: 0.17}, // faint blue
  {c: '168,146,208', w: 0.08}, // soft purple — scene accent
  {c: '201,164,92', w: 0.03}, // deep gold — rare
];

function pickWeighted(
  rand: () => number,
  table: ReadonlyArray<{c: string; w: number}>,
): string {
  const roll = rand();
  let acc = 0;
  for (const {c, w} of table) {
    acc += w;
    if (roll <= acc) return c;
  }
  return table[0].c;
}

// Small LCG PRNG: stable within a session but varied across reloads.
function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export type StarField = {
  resize: () => void;
  destroy: () => void;
};

export function createStarField(canvas: HTMLCanvasElement): StarField {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return {resize: () => {}, destroy: () => {}};
  }

  const rand = makeRng(Math.floor(Date.now() % 2147483647) + 1);
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let stars: Star[] = [];
  let raf = 0;
  let start = 0;

  function buildStars(): void {
    // Dense field: ~2.7× the previous density so the sky clearly reads as
    // alive. Capped so very large screens stay cheap (only alpha animates).
    const count = Math.min(420, Math.round((width * height) / 6000));
    stars = Array.from({length: count}, () => {
      // Bias toward the upper 72% — the ridgeline/terrace sits along the bottom.
      const y = Math.pow(rand(), 1.4) * 0.72;
      // Most stars are tiny pinpricks; a minority are larger and brighter, so
      // the field has depth rather than a uniform speckle.
      const bright = rand() > 0.82;
      const r = bright ? 1.1 + rand() * 1.1 : 0.35 + rand() * 0.9;
      return {
        x: rand(),
        y,
        r,
        color: pickWeighted(rand, STAR_COLORS),
        base: (bright ? 0.32 : 0.14) + rand() * 0.4,
        amp: 0.12 + rand() * 0.35,
        speed: 0.3 + rand() * 1.2,
        phase: rand() * Math.PI * 2,
      };
    });
  }

  function resize(): void {
    const parent = canvas.parentElement;
    if (!parent) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = parent.clientWidth;
    height = parent.clientHeight;
    if (width === 0 || height === 0) return;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStars();
    if (reduceMotion) drawStatic();
  }

  function drawStar(s: Star, alpha: number): void {
    const px = s.x * width;
    const py = s.y * height;
    ctx!.beginPath();
    ctx!.fillStyle = `rgba(${s.color},${alpha.toFixed(3)})`;
    ctx!.arc(px, py, s.r, 0, Math.PI * 2);
    ctx!.fill();
    // Brighter stars get a faint bloom.
    if (s.r > 1.1) {
      ctx!.beginPath();
      ctx!.fillStyle = `rgba(${s.color},${(alpha * 0.1).toFixed(3)})`;
      ctx!.arc(px, py, s.r * 2.6, 0, Math.PI * 2);
      ctx!.fill();
    }
  }

  // Reduced-motion / initial paint: stars at their base brightness, no loop.
  function drawStatic(): void {
    ctx!.clearRect(0, 0, width, height);
    for (const s of stars) {
      drawStar(s, Math.max(0, Math.min(1, s.base)));
    }
  }

  function frame(t: number): void {
    if (!start) start = t;
    const elapsed = (t - start) / 1000;
    ctx!.clearRect(0, 0, width, height);

    for (const s of stars) {
      const a = s.base + s.amp * Math.sin(elapsed * s.speed + s.phase);
      drawStar(s, Math.max(0, Math.min(1, a)));
    }

    raf = window.requestAnimationFrame(frame);
  }

  resize();
  if (!reduceMotion) {
    raf = window.requestAnimationFrame(frame);
  }

  return {
    resize,
    destroy: () => {
      if (raf) window.cancelAnimationFrame(raf);
      stars = [];
    },
  };
}

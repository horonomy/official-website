/**
 * Ambient canvas star field for the HeroUniverse hero (HORO-5, HORO-18).
 *
 * A device-pixel-ratio–aware 2D canvas that layers *subtle* twinkle over the
 * already-painted sky backdrop. There are no shooting stars or meteors — just a
 * field of stars that gently breathe. Deliberately sparse — the SceneLayers
 * backdrop already carries the bulk of the stars, so this engine only adds life,
 * it does not re-paint a whole sky.
 *
 * Palette matches the scene: cool white, gold, and soft purple.
 *
 * Client-only: callers must instantiate inside a `useEffect` (it touches
 * `window`, `canvas`, and `requestAnimationFrame`). Honors
 * `prefers-reduced-motion: reduce` by drawing a single static frame and never
 * starting the animation loop.
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

// Scene palette: navy backdrop, gold accents, soft purple glow.
const STAR_COLORS = [
  {c: '229,231,235', w: 0.5}, // cool white — most common
  {c: '224,185,120', w: 0.24}, // gold (--hn-gold-bright)
  {c: '168,146,208', w: 0.18}, // soft purple
  {c: '201,164,92', w: 0.08}, // deep gold — rare
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
    // Sparse: the backdrop already carries most stars, so density here is a
    // third of a full field, capped so large screens stay cheap.
    const count = Math.min(140, Math.round((width * height) / 16000));
    stars = Array.from({length: count}, () => {
      // Bias toward the upper 72% — the ridgeline/terrace sits along the bottom.
      const y = Math.pow(rand(), 1.4) * 0.72;
      return {
        x: rand(),
        y,
        r: 0.4 + rand() * 1.3,
        color: pickWeighted(rand, STAR_COLORS),
        base: 0.18 + rand() * 0.4,
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

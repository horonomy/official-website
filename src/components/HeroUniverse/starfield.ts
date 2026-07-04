/**
 * Ambient canvas star field for the HeroUniverse hero (HORO-5).
 *
 * A device-pixel-ratio–aware 2D canvas that layers *subtle* motion over the
 * already-painted sky backdrop: gentle per-star twinkle plus occasional,
 * low-frequency shooting stars. Deliberately sparse — the SceneLayers backdrop
 * already carries the bulk of the stars, so this engine only adds life, it does
 * not re-paint a whole sky.
 *
 * Palette matches the scene: cool white, gold, and soft purple.
 *
 * Client-only: callers must instantiate inside a `useEffect` (it touches
 * `window`, `canvas`, and `requestAnimationFrame`). Honors
 * `prefers-reduced-motion: reduce` by drawing a single static frame and never
 * starting the animation loop or spawning meteors.
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

type Meteor = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 0..1 remaining
  len: number;
  color: string; // "r,g,b"
};

// Scene palette: navy backdrop, gold accents, soft purple glow.
const STAR_COLORS = [
  {c: '229,231,235', w: 0.5}, // cool white — most common
  {c: '224,185,120', w: 0.24}, // gold (--hn-gold-bright)
  {c: '168,146,208', w: 0.18}, // soft purple
  {c: '201,164,92', w: 0.08}, // deep gold — rare
];

// Shooting stars pull from the warm end of the palette so they read as gold.
const METEOR_COLORS = ['244,245,247', '224,185,120', '201,164,92'];

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
  let meteors: Meteor[] = [];
  let raf = 0;
  let start = 0;
  let nextMeteor = 0;

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

  function spawnMeteor(): void {
    // Enter from the top edge, drift down-left or down-right.
    const fromLeft = rand() > 0.5;
    const speed = 220 + rand() * 170;
    const angle = (fromLeft ? 0.32 : 0.68) * Math.PI + (rand() - 0.5) * 0.28;
    meteors.push({
      x: rand() * width,
      y: -20,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      len: 64 + rand() * 80,
      color: METEOR_COLORS[Math.floor(rand() * METEOR_COLORS.length)],
    });
  }

  function frame(t: number): void {
    if (!start) start = t;
    const elapsed = (t - start) / 1000;
    ctx!.clearRect(0, 0, width, height);

    for (const s of stars) {
      const a = s.base + s.amp * Math.sin(elapsed * s.speed + s.phase);
      drawStar(s, Math.max(0, Math.min(1, a)));
    }

    // Low-frequency shooting stars: long, randomized gaps.
    if (t > nextMeteor) {
      spawnMeteor();
      nextMeteor = t + 7000 + rand() * 11000;
    }
    const dt = 1 / 60;
    meteors = meteors.filter((m) => m.life > 0 && m.y < height + 40);
    for (const m of meteors) {
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      m.life -= dt * 0.5;
      const tailX = m.x - (m.vx / 360) * m.len;
      const tailY = m.y - (m.vy / 360) * m.len;
      const grad = ctx!.createLinearGradient(m.x, m.y, tailX, tailY);
      const a = Math.max(0, m.life);
      grad.addColorStop(0, `rgba(${m.color},${(a * 0.85).toFixed(3)})`);
      grad.addColorStop(1, `rgba(${m.color},0)`);
      ctx!.strokeStyle = grad;
      ctx!.lineWidth = 1.3;
      ctx!.beginPath();
      ctx!.moveTo(m.x, m.y);
      ctx!.lineTo(tailX, tailY);
      ctx!.stroke();
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
      meteors = [];
    },
  };
}

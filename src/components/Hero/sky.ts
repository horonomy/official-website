/**
 * The observatory sky rendered by the First Horologer.
 *
 * A device-pixel-ratio–aware canvas star field: stars of varied brightness and
 * colour temperature (white / blue / warm / red), each twinkling on its own
 * rhythm, plus the occasional meteor. Pure canvas 2D, no dependencies. Runs
 * client-side only — callers must instantiate inside an effect.
 */

type Star = {
  x: number; // 0..1 fraction of width
  y: number; // 0..1 fraction of height
  r: number; // base radius in css px
  color: string;
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
};

const STAR_COLORS = [
  {c: '229,231,235', w: 0.5}, // white — most common
  {c: '159,193,255', w: 0.22}, // blue
  {c: '255,222,168', w: 0.18}, // warm
  {c: '224,120,120', w: 0.1}, // red — rare
];

function pickColor(rand: () => number): string {
  const roll = rand();
  let acc = 0;
  for (const {c, w} of STAR_COLORS) {
    acc += w;
    if (roll <= acc) return c;
  }
  return STAR_COLORS[0].c;
}

// Small deterministic-ish PRNG so the field is stable within a session but
// varied across reloads. Seeded from the current time.
function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export type Sky = {
  resize: () => void;
  destroy: () => void;
};

export function createSky(canvas: HTMLCanvasElement): Sky {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return {resize: () => {}, destroy: () => {}};
  }

  const rand = makeRng(Math.floor(Date.now() % 2147483647) + 1);
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let stars: Star[] = [];
  let meteors: Meteor[] = [];
  let raf = 0;
  let start = 0;
  let nextMeteor = 0;

  function buildStars() {
    // Density scales with area; capped so large screens stay performant.
    const count = Math.min(340, Math.round((width * height) / 5200));
    stars = Array.from({length: count}, () => {
      // Bias stars toward the upper 78% — the ridgeline sits along the bottom.
      const y = Math.pow(rand(), 1.35) * 0.82;
      return {
        x: rand(),
        y,
        r: 0.4 + rand() * 1.5,
        color: pickColor(rand),
        base: 0.25 + rand() * 0.5,
        amp: 0.15 + rand() * 0.45,
        speed: 0.4 + rand() * 1.6,
        phase: rand() * Math.PI * 2,
      };
    });
  }

  function resize() {
    const parent = canvas.parentElement;
    if (!parent) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = parent.clientWidth;
    height = parent.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStars();
  }

  function spawnMeteor() {
    // Enter from the top edge, drift down-left or down-right.
    const fromLeft = rand() > 0.5;
    const speed = 260 + rand() * 200;
    const angle = (fromLeft ? 0.35 : 0.65) * Math.PI + (rand() - 0.5) * 0.3;
    meteors.push({
      x: rand() * width,
      y: -20,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      len: 70 + rand() * 90,
    });
  }

  function frame(t: number) {
    if (!start) start = t;
    const elapsed = (t - start) / 1000;
    ctx!.clearRect(0, 0, width, height);

    // Stars.
    for (const s of stars) {
      const a = reduceMotion
        ? s.base
        : s.base + s.amp * Math.sin(elapsed * s.speed + s.phase);
      const alpha = Math.max(0, Math.min(1, a));
      const px = s.x * width;
      const py = s.y * height;
      ctx!.beginPath();
      ctx!.fillStyle = `rgba(${s.color},${alpha.toFixed(3)})`;
      ctx!.arc(px, py, s.r, 0, Math.PI * 2);
      ctx!.fill();
      // Brighter stars get a faint bloom.
      if (s.r > 1.2) {
        ctx!.beginPath();
        ctx!.fillStyle = `rgba(${s.color},${(alpha * 0.12).toFixed(3)})`;
        ctx!.arc(px, py, s.r * 2.6, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    // Meteors.
    if (!reduceMotion) {
      if (t > nextMeteor) {
        spawnMeteor();
        nextMeteor = t + 3500 + rand() * 6000;
      }
      const dt = 1 / 60;
      meteors = meteors.filter((m) => m.life > 0 && m.y < height + 40);
      for (const m of meteors) {
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        m.life -= dt * 0.55;
        const tailX = m.x - (m.vx / 360) * m.len;
        const tailY = m.y - (m.vy / 360) * m.len;
        const grad = ctx!.createLinearGradient(m.x, m.y, tailX, tailY);
        const a = Math.max(0, m.life);
        grad.addColorStop(0, `rgba(255,255,255,${(a * 0.9).toFixed(3)})`);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 1.4;
        ctx!.beginPath();
        ctx!.moveTo(m.x, m.y);
        ctx!.lineTo(tailX, tailY);
        ctx!.stroke();
      }
    }

    raf = window.requestAnimationFrame(frame);
  }

  resize();
  raf = window.requestAnimationFrame(frame);

  return {
    resize,
    destroy: () => {
      window.cancelAnimationFrame(raf);
      stars = [];
      meteors = [];
    },
  };
}

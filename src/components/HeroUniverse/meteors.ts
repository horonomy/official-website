/**
 * Ambient meteor (shooting star) layer for the HeroUniverse hero (HORO-35).
 *
 * A device-pixel-ratio–aware 2D canvas that occasionally streaks a shooting
 * star across the sky: a bright head trailing a gradient tail that fades to
 * nothing. Meteors enter from the upper-right and travel down-left along a
 * shallow, slightly varied angle — echoing the baked streaks in the sky
 * backdrop — with randomised length, speed, brightness, and colour temperature
 * (starlight white / soft gold). One appears on load, then every ~6–14s.
 *
 * Cheap and compositor-friendly: at most a few meteors are alive at once, the
 * canvas only paints the active streaks each frame, and nothing runs when the
 * scene is idle beyond a single clear.
 *
 * Client-only: callers must instantiate inside a `useEffect` (it touches
 * `window`, `canvas`, and `requestAnimationFrame`). Honors
 * `prefers-reduced-motion: reduce` by drawing a single static streak and never
 * starting the animation loop.
 */

type Meteor = {
  x: number; // head position, css px
  y: number;
  vx: number; // velocity, css px/s
  vy: number;
  len: number; // tail length, css px
  width: number; // stroke width, css px
  color: string; // "r,g,b"
  age: number; // seconds alive
  ttl: number; // seconds of travel before it despawns
  fade: number; // seconds of fade-out at the end of life
};

// Meteor palette: mostly cool starlight, warmed by the occasional gold streak.
const METEOR_COLORS = [
  {c: '229,231,235', w: 0.5}, // starlight white
  {c: '244,245,247', w: 0.2}, // bright white
  {c: '224,185,120', w: 0.22}, // soft gold (--hn-gold-bright)
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

export type MeteorShower = {
  resize: () => void;
  destroy: () => void;
};

const MAX_METEORS = 3;

export function createMeteorShower(canvas: HTMLCanvasElement): MeteorShower {
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
  let meteors: Meteor[] = [];
  let raf = 0;
  let last = 0;
  let nextSpawnAt = 0; // ms timestamp; 0 → spawn on the first frame

  function spawn(): void {
    if (meteors.length >= MAX_METEORS) return;
    // Down-left travel: ~150°–174° from +x (screen y points down), so the
    // streak reads as a shallow fall from the upper-right.
    const angle = (150 + rand() * 24) * (Math.PI / 180);
    const speed = 520 + rand() * 380; // css px/s
    meteors.push({
      // Enter biased to the right (they travel left) and high in the sky.
      x: width * (0.45 + rand() * 0.7),
      y: height * (rand() * 0.32) - height * 0.05,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      len: 90 + rand() * 150,
      width: 1 + rand() * 1.2,
      color: pickWeighted(rand, METEOR_COLORS),
      age: 0,
      ttl: 1.1 + rand() * 0.9,
      fade: 0.35,
    });
  }

  function drawMeteor(m: Meteor): void {
    const spd = Math.hypot(m.vx, m.vy) || 1;
    const ux = m.vx / spd;
    const uy = m.vy / spd;
    const tx = m.x - ux * m.len; // tail trails behind the head
    const ty = m.y - uy * m.len;

    // Ease in quickly, hold, then fade out over the last `fade` seconds.
    let alpha = 1;
    if (m.age < 0.12) alpha = m.age / 0.12;
    else if (m.age > m.ttl - m.fade)
      alpha = Math.max(0, (m.ttl - m.age) / m.fade);

    const grad = ctx!.createLinearGradient(tx, ty, m.x, m.y);
    grad.addColorStop(0, `rgba(${m.color},0)`);
    grad.addColorStop(1, `rgba(${m.color},${(0.9 * alpha).toFixed(3)})`);
    ctx!.strokeStyle = grad;
    ctx!.lineWidth = m.width;
    ctx!.lineCap = 'round';
    ctx!.beginPath();
    ctx!.moveTo(tx, ty);
    ctx!.lineTo(m.x, m.y);
    ctx!.stroke();

    // Bright head + faint bloom.
    ctx!.beginPath();
    ctx!.fillStyle = `rgba(${m.color},${(0.95 * alpha).toFixed(3)})`;
    ctx!.arc(m.x, m.y, m.width * 0.9, 0, Math.PI * 2);
    ctx!.fill();
    ctx!.beginPath();
    ctx!.fillStyle = `rgba(${m.color},${(0.18 * alpha).toFixed(3)})`;
    ctx!.arc(m.x, m.y, m.width * 3, 0, Math.PI * 2);
    ctx!.fill();
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
    if (reduceMotion) drawStatic();
  }

  // Reduced-motion / no-loop paint: a single subtle static streak so the sky
  // still hints at a shooting star without any motion.
  function drawStatic(): void {
    ctx!.clearRect(0, 0, width, height);
    if (width === 0 || height === 0) return;
    const angle = 160 * (Math.PI / 180);
    meteors = [
      {
        x: width * 0.7,
        y: height * 0.22,
        vx: Math.cos(angle),
        vy: Math.sin(angle),
        len: 150,
        width: 1.6,
        color: '229,231,235',
        age: 0.5,
        ttl: 2,
        fade: 0.35,
      },
    ];
    drawMeteor(meteors[0]);
    meteors = [];
  }

  function frame(t: number): void {
    if (!last) last = t;
    const dt = Math.min(0.05, (t - last) / 1000);
    last = t;

    ctx!.clearRect(0, 0, width, height);

    if (t >= nextSpawnAt) {
      spawn();
      nextSpawnAt = t + 6000 + rand() * 8000; // next in ~6–14s
    }

    for (const m of meteors) {
      m.age += dt;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      drawMeteor(m);
    }
    meteors = meteors.filter(
      (m) => m.age < m.ttl && m.x > -m.len && m.y < height + m.len,
    );

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
      meteors = [];
    },
  };
}

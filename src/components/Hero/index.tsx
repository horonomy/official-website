import React, {useEffect, useRef} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import clsx from 'clsx';
import {createSky, type Sky} from './sky';
import styles from './styles.module.css';

/**
 * Direction 3a — "The First Horologer".
 *
 * The mascot is not a mascot: it is the First Horologer, an ancient nameless
 * observer wearing the H mark. It observes the sky; products are constellations.
 * The head tracks the cursor, the astrolabe dial turns, and hovering a
 * constellation surfaces its name and links to the product.
 */

type Constellation = {
  id: string;
  name: string;
  status: string;
  href?: string;
  // Position as a fraction of the sky, so it scales with the viewport.
  left: number;
  top: number;
  tone: 'active' | 'research' | 'future';
};

const CONSTELLATIONS: Constellation[] = [
  {
    id: 'assembler',
    name: 'AI agent assembly',
    status: 'THE ASSEMBLER · AGENT INFRASTRUCTURE',
    href: 'https://github.com/AI-agent-assembly',
    left: 0.67,
    top: 0.32,
    tone: 'active',
  },
  {
    id: 'track01',
    name: 'Research track 01',
    status: 'UNCHARTED',
    left: 0.8,
    top: 0.18,
    tone: 'research',
  },
  {
    id: 'track02',
    name: 'Research track 02',
    status: 'UNCHARTED',
    left: 0.86,
    top: 0.46,
    tone: 'research',
  },
  {
    id: 'future',
    name: 'Future systems',
    status: 'AWAITING STARS',
    left: 0.67,
    top: 0.6,
    tone: 'future',
  },
];

function HeroInteractive() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const dialRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;

    const sky: Sky = createSky(canvas);

    const reduceMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    // Head-tracking + astrolabe spin loop.
    let raf = 0;
    let dialAngle = 0;
    let headTarget = 0; // desired head rotation (deg)
    let headCurrent = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!reduceMotion) {
        dialAngle = (dialAngle + dt * 26) % 360;
        if (dialRef.current) {
          dialRef.current.style.transform = `rotate(${dialAngle}deg)`;
          dialRef.current.style.transformOrigin = '104px 112px';
        }
      }
      // Ease the head toward the pointer.
      headCurrent += (headTarget - headCurrent) * Math.min(1, dt * 6);
      if (headRef.current) {
        headRef.current.style.transform = `rotate(${headCurrent.toFixed(2)}deg)`;
        headRef.current.style.transformOrigin = '164px 140px';
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);

    const onMove = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const fx = (e.clientX - rect.left) / rect.width; // 0..1
      const fy = (e.clientY - rect.top) / rect.height;
      // The observer stands lower-left and faces the sky to its right; map the
      // cursor's horizontal position to a small head turn, vertical to a nod.
      headTarget = (fx - 0.35) * 26 + (fy - 0.4) * 8;
      headTarget = Math.max(-22, Math.min(22, headTarget));
    };
    const onLeave = () => {
      headTarget = 0;
    };

    const onResize = () => sky.resize();

    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', onResize);

    return () => {
      window.cancelAnimationFrame(raf);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', onResize);
      sky.destroy();
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.hero} id="observatory">
      <canvas ref={canvasRef} className={styles.sky} aria-hidden="true" />

      {/* painted environment: dusk glow, ridgelines, foreground ledge */}
      <svg
        className={styles.ridges}
        viewBox="0 0 1440 280"
        preserveAspectRatio="none"
        aria-hidden="true">
        <defs>
          <radialGradient id="hn-dusk" cx="0.6" cy="1.05" r="0.85">
            <stop offset="0" stopColor="rgba(224,142,72,0.3)" />
            <stop offset="0.4" stopColor="rgba(158,88,122,0.14)" />
            <stop offset="1" stopColor="rgba(15,17,21,0)" />
          </radialGradient>
          <linearGradient id="hn-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#292a44" />
            <stop offset="1" stopColor="#171826" />
          </linearGradient>
          <linearGradient id="hn-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1a1b2a" />
            <stop offset="1" stopColor="#111219" />
          </linearGradient>
          <linearGradient id="hn-nearg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#131420" />
            <stop offset="1" stopColor="#0a0b10" />
          </linearGradient>
        </defs>
        <rect x="0" y="20" width="1440" height="260" fill="url(#hn-dusk)" />
        <path
          d="M0,196 L110,158 L230,182 L360,136 L520,186 L690,148 L850,178 L1000,128 L1150,170 L1310,142 L1440,164 L1440,280 L0,280 Z"
          fill="url(#hn-far)"
          opacity="0.9"
        />
        <path
          d="M0,196 L110,158 L230,182 L360,136 L520,186 L690,148 L850,178 L1000,128 L1150,170 L1310,142 L1440,164"
          fill="none"
          stroke="rgba(238,168,110,0.22)"
          strokeWidth="1.2"
        />
        <path
          d="M0,222 L150,196 L320,216 L560,186 L780,220 L980,192 L1200,214 L1440,196 L1440,280 L0,280 Z"
          fill="url(#hn-mid)"
        />
        <path
          d="M0,252 L200,238 L420,252 L700,240 L960,254 L1220,242 L1440,252 L1440,280 L0,280 Z"
          fill="url(#hn-nearg)"
        />
      </svg>

      {/* constellations */}
      {CONSTELLATIONS.map((c) => {
        const Tag = c.href ? 'a' : 'div';
        return (
          <Tag
            key={c.id}
            className={clsx(styles.constellation, styles[`tone_${c.tone}`])}
            style={{left: `${c.left * 100}%`, top: `${c.top * 100}%`}}
            {...(c.href
              ? {href: c.href, target: '_blank', rel: 'noreferrer'}
              : {})}
            aria-label={c.name}>
            <span className={styles.node} aria-hidden="true" />
            <span className={styles.ray} aria-hidden="true" />
            <span className={styles.constName}>
              {c.name}
              <span className={styles.constStatus}>{c.status}</span>
            </span>
          </Tag>
        );
      })}

      {/* hero copy — upper-left so the sky and observer stay open */}
      <div className={clsx('hn-shell', styles.copyWrap)}>
        <div className={styles.copy}>
          <span className="hn-eyebrow">Charting the intelligence universe</span>
          <h1 className={styles.title}>Defining the boundaries of autonomy.</h1>
          <p className={styles.lede}>
            Every system we build becomes a constellation in this sky —
            observed, measured, and recorded before it is trusted to act.
          </p>
          <div className={styles.actions}>
            <a className="hn-btn hn-btn--solid" href="#products">
              Explore the constellations{' '}
              <span style={{fontFamily: 'var(--hn-font-mono)'}}>→</span>
            </a>
            <a className="hn-btn hn-btn--ghost" href="#manifesto">
              Read the manifesto
            </a>
          </div>
        </div>
      </div>

      {/* the First Horologer — faces the sky to its right */}
      <svg
        className={styles.horologer}
        viewBox="0 0 300 260"
        aria-hidden="true">
        <g transform="translate(300,0) scale(-1,1)">
          <defs>
            <radialGradient id="hn-spb" cx="0.35" cy="0.28" r="1">
              <stop offset="0" stopColor="#262b3a" />
              <stop offset="0.65" stopColor="#161923" />
              <stop offset="1" stopColor="#0f1218" />
            </radialGradient>
            <radialGradient id="hn-sph" cx="0.4" cy="0.3" r="1">
              <stop offset="0" stopColor="#2a2f3e" />
              <stop offset="1" stopColor="#12151d" />
            </radialGradient>
          </defs>
          <line
            x1="20"
            y1="246"
            x2="290"
            y2="246"
            stroke="rgba(229,231,235,0.1)"
            strokeWidth="1"
          />
          {/* hourglass */}
          <g>
            <path
              d="M50,204 h20 M50,242 h20 M52,206 l8,16 l-8,16 M68,206 l-8,16 l8,16"
              fill="none"
              stroke="rgba(229,231,235,0.5)"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <circle cx="60" cy="222" r="1.6" fill="#F5A623" className={styles.sand} />
          </g>
          {/* legs */}
          <g stroke="#9CA3AF" strokeWidth="2" fill="none" strokeLinecap="round">
            <path d="M188,166 L158,196 L146,238" />
            <path d="M198,172 L184,210 L178,240" />
            <path d="M212,173 L216,212 L212,241" />
            <path d="M224,166 L248,198 L258,236" />
          </g>
          {/* arms toward the astrolabe */}
          <g stroke="#9CA3AF" strokeWidth="2" fill="none" strokeLinecap="round">
            <path d="M182,148 L146,132 L122,122" />
            <path d="M186,158 L150,156 L128,142" />
          </g>
          {/* abdomen with the H boundary mark */}
          <circle
            cx="208"
            cy="146"
            r="31"
            fill="url(#hn-spb)"
            stroke="#E5E7EB"
            strokeWidth="2.4"
          />
          <circle
            cx="208"
            cy="146"
            r="31"
            fill="none"
            stroke="#00B2FF"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeDasharray="22 173"
            transform="rotate(-64 208 146)"
          />
          <g transform="translate(194.5,132.5) scale(0.27)">
            <rect x="34.5" y="30" width="7" height="40" fill="#E5E7EB" />
            <rect x="58.5" y="30" width="7" height="40" fill="#E5E7EB" />
            <rect x="34.5" y="46.5" width="31" height="7" fill="#E5E7EB" />
          </g>
          {/* head (tracks the cursor) */}
          <g ref={headRef} className={styles.head}>
            <circle
              cx="164"
              cy="140"
              r="15"
              fill="url(#hn-sph)"
              stroke="#E5E7EB"
              strokeWidth="2.4"
            />
            <circle cx="156" cy="136" r="2" fill="#E5E7EB" />
            <circle cx="163" cy="132" r="2" fill="#E5E7EB" />
            <circle cx="156.6" cy="135.4" r="0.8" fill="#0F1115" />
            <circle cx="163.6" cy="131.4" r="0.8" fill="#0F1115" />
          </g>
          {/* astrolabe */}
          <g>
            <circle
              cx="104"
              cy="112"
              r="21"
              fill="rgba(15,17,21,0.65)"
              stroke="#C9A45C"
              strokeWidth="1.8"
            />
            <circle
              cx="104"
              cy="112"
              r="13.5"
              fill="none"
              stroke="rgba(201,164,92,0.5)"
              strokeWidth="1"
              strokeDasharray="3 5"
            />
            <circle cx="104" cy="112" r="2.2" fill="#C9A45C" />
            <g ref={dialRef}>
              <line
                x1="104"
                y1="112"
                x2="104"
                y2="93"
                stroke="#F5A623"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="104" cy="93" r="2.4" fill="#F5A623" />
              <line
                x1="104"
                y1="112"
                x2="111"
                y2="124"
                stroke="rgba(245,166,35,0.5)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </g>
          </g>
        </g>
      </svg>

      <div className={styles.statusline}>
        OBSERVER: THE FIRST HOROLOGER · CONSTELLATIONS: 4 · SKY: LIVE ·
        CONSTELLATION LINKS: ACTIVE
      </div>
    </div>
  );
}

// Static, SSR-safe fallback: same layout, no canvas / interactivity.
function HeroStatic() {
  return (
    <div className={styles.hero} id="observatory">
      <div className={clsx('hn-shell', styles.copyWrap)}>
        <div className={styles.copy}>
          <span className="hn-eyebrow">Charting the intelligence universe</span>
          <h1 className={styles.title}>Defining the boundaries of autonomy.</h1>
          <p className={styles.lede}>
            Every system we build becomes a constellation in this sky —
            observed, measured, and recorded before it is trusted to act.
          </p>
          <div className={styles.actions}>
            <a className="hn-btn hn-btn--solid" href="#products">
              Explore the constellations →
            </a>
            <a className="hn-btn hn-btn--ghost" href="#manifesto">
              Read the manifesto
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero(): React.ReactElement {
  return <BrowserOnly fallback={<HeroStatic />}>{() => <HeroInteractive />}</BrowserOnly>;
}

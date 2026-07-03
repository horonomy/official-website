import React from 'react';
import styles from './styles.module.css';

const PRINCIPLES = [
  {
    n: '01',
    title: 'Boundary-aware by design',
    body: 'Autonomous systems should know where they can act, when they should pause, and what must remain out of reach.',
  },
  {
    n: '02',
    title: 'Composable, not monolithic',
    body: 'The future of AI systems is assembled — from agents, tools, policies, context, and execution layers.',
  },
  {
    n: '03',
    title: 'Auditable from the start',
    body: 'Every autonomous action should be explainable, reviewable, and accountable.',
  },
];

function Lore(): React.ReactElement {
  return (
    <section className={styles.lore}>
      <div className={`hn-shell ${styles.loreGrid}`}>
        <div className={styles.loreLabel}>
          THE LORE
          <br />
          <span>FIRST HOROLOGER</span>
        </div>
        <p className={styles.loreBody}>
          It does not create the sky. It observes it, understands it, records
          it. When a new system is born, it links new stars — until the whole{' '}
          <span className={styles.cyan}>Intelligence Universe</span> is charted.
        </p>
        <div className={styles.legend}>
          <a
            className={styles.legendRow}
            href="https://github.com/AI-agent-assembly"
            target="_blank"
            rel="noreferrer">
            <span className={`${styles.dot} ${styles.dotActive}`} />
            <span>THE ASSEMBLER — AI AGENT ASSEMBLY ↗</span>
          </a>
          <div className={styles.legendRow}>
            <span className={`${styles.dot} ${styles.dotResearch}`} />
            <span className={styles.faint}>RESEARCH TRACKS — UNCHARTED</span>
          </div>
          <div className={styles.legendRow}>
            <span className={`${styles.dot} ${styles.dotFuture}`} />
            <span className={styles.faint}>FUTURE SYSTEMS — AWAITING STARS</span>
          </div>
          <div className={styles.legendRow}>
            <span className={styles.ray} />
            <span className={styles.faint}>GOLDEN RAY — MEASUREMENT IN PROGRESS</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Philosophy(): React.ReactElement {
  return (
    <section className={styles.band}>
      <div className="hn-shell">
        <div className="hn-section-kicker">Philosophy</div>
        <h2 className={styles.h2}>Autonomy needs structure.</h2>
        <div className={styles.principles}>
          {PRINCIPLES.map((p) => (
            <div key={p.n} className={styles.principle}>
              <div className={styles.principleNum}>{p.n}</div>
              <h3 className={styles.principleTitle}>{p.title}</h3>
              <p className={styles.principleBody}>{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Products(): React.ReactElement {
  return (
    <section className={styles.band} id="products">
      <div className="hn-shell">
        <div className={styles.productsHead}>
          <div>
            <div className="hn-section-kicker">Products</div>
            <h2 className={styles.h2}>Systems we are building</h2>
          </div>
          <a
            className={styles.allProducts}
            href="https://github.com/AI-agent-assembly"
            target="_blank"
            rel="noreferrer">
            ALL PRODUCTS →
          </a>
        </div>
        <div className={styles.productGrid}>
          <a
            className={styles.productCard}
            href="https://github.com/AI-agent-assembly"
            target="_blank"
            rel="noreferrer">
            <div className={styles.productCardTop}>
              <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  fill="none"
                  stroke="#00B2FF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="42 14.5"
                  transform="rotate(-50 12 12)"
                />
              </svg>
              <span className={styles.badgeActive}>IN DEVELOPMENT</span>
            </div>
            <div className={styles.productName}>AI agent assembly</div>
            <p className={styles.productBody}>
              A framework for assembling autonomous agents with explicit roles,
              tools, policies, and operating boundaries.
            </p>
            <div className={styles.productMeta}>
              AGENT INFRASTRUCTURE · GITHUB ↗
            </div>
          </a>

          <div className={styles.productCardResearch}>
            <div className={styles.productCardTop}>
              <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  fill="none"
                  stroke="#6B7280"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="42 14.5"
                  transform="rotate(-50 12 12)"
                />
              </svg>
              <span className={styles.badgeResearch}>RESEARCH</span>
            </div>
            <div className={`${styles.productName} ${styles.muted}`}>
              Research tracks
            </div>
            <p className={`${styles.productBody} ${styles.faint}`}>
              Exploring boundary-aware tools for autonomous software systems —
              governance runtimes, change intelligence, and workflow primitives.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Manifesto(): React.ReactElement {
  return (
    <section className={styles.manifesto} id="manifesto">
      <div className="hn-shell">
        <div className="hn-section-kicker">Manifesto</div>
        <p className={styles.manifestoText}>
          Software is becoming autonomous. But autonomy without boundaries
          becomes drift. Horonomy builds the systems that make autonomy{' '}
          <span className={styles.cyan}>explicit, governable, and safe to scale.</span>
        </p>
        <a
          className={styles.manifestoLink}
          href="https://github.com/AI-agent-assembly"
          target="_blank"
          rel="noreferrer">
          READ THE FULL MANIFESTO →
        </a>
      </div>
    </section>
  );
}

export default function Sections(): React.ReactElement {
  return (
    <>
      <Lore />
      <Philosophy />
      <Products />
      <Manifesto />
    </>
  );
}

import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {
  linkDomainOf,
  trackHoronomyEvent,
} from '@site/src/analytics/trackEvent';
import styles from './styles.module.css';

// Cross-hostname routing per IA plan §2.1 and UTM conventions §4 (HORO-47).
// Every Horonomy → Agent Assembly CTA carries the same source/medium/campaign
// vocabulary; only `utm_content` varies by on-page location.
const AGENT_ASSEMBLY_URL_LORE_LEGEND =
  'https://agent-assembly.com/' +
  '?utm_source=horonomy_site' +
  '&utm_medium=referral' +
  '&utm_campaign=agent_assembly_launch' +
  '&utm_content=home_lore_legend';

const AGENT_ASSEMBLY_URL_PRODUCTS_ALL =
  'https://agent-assembly.com/' +
  '?utm_source=horonomy_site' +
  '&utm_medium=referral' +
  '&utm_campaign=agent_assembly_launch' +
  '&utm_content=home_products_all';

const AGENT_ASSEMBLY_URL_PRODUCTS_CARD =
  'https://agent-assembly.com/' +
  '?utm_source=horonomy_site' +
  '&utm_medium=referral' +
  '&utm_campaign=agent_assembly_launch' +
  '&utm_content=home_products_card';

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

function trackAgentAssemblyClick(url: string): () => void {
  return () => {
    trackHoronomyEvent('horonomy_product_agent_assembly_click', {
      cta_location: 'body',
      link_url: url,
      link_domain: linkDomainOf(url),
      target_product: 'agent_assembly',
    });
  };
}

function Lore(): React.ReactElement {
  return (
    <section className={styles.lore}>
      <div className={`hn-shell ${styles.loreGrid}`}>
        <div className={styles.loreIntro}>
          <img
            className={styles.mascot}
            src={useBaseUrl('/img/horonomy-mascot.png')}
            width={132}
            height={132}
            loading="lazy"
            alt="The First Horologer — Horonomy's mascot, observing the sky with an astrolabe"
          />
          <div className={styles.loreLabel}>
            THE LORE
            <br />
            <span>FIRST HOROLOGER</span>
          </div>
        </div>
        <p className={styles.loreBody}>
          It does not create the sky. It observes it, understands it, records
          it. When a new system is born, it links new stars — until the whole{' '}
          <span className={styles.cyan}>Intelligence Universe</span> is charted.
        </p>
        <div className={styles.legend}>
          <a
            className={styles.legendRow}
            href={AGENT_ASSEMBLY_URL_LORE_LEGEND}
            target="_blank"
            rel="noreferrer"
            data-horo-tracked=""
            onClick={trackAgentAssemblyClick(AGENT_ASSEMBLY_URL_LORE_LEGEND)}>
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
            href={AGENT_ASSEMBLY_URL_PRODUCTS_ALL}
            target="_blank"
            rel="noreferrer"
            data-horo-tracked=""
            onClick={trackAgentAssemblyClick(AGENT_ASSEMBLY_URL_PRODUCTS_ALL)}>
            ALL PRODUCTS →
          </a>
        </div>
        <div className={styles.productGrid}>
          {/*
            AI Agent Assembly product card. Per IA plan §2.1 the primary
            product-conversion path routes visitors to agent-assembly.com;
            the previous target (the GitHub org page) confused product
            discovery with source-code validation — GitHub is available as
            the hero's dedicated "View on GitHub" secondary CTA and in the
            navbar.

            Copy stays at company altitude and describes governance, not
            agent construction (AAASM-5614): Agent Assembly governs agents
            that other frameworks build. Keep the summary here in step with
            the hero card in `HeroUniverse/products.ts` — this is the same
            product promise stated twice on one page. Do not reach past the
            approved promise on agent-assembly.com (no coverage absolutes, no
            unreleased SaaS capability, no eBPF-as-cross-platform).
          */}
          <a
            className={styles.productCard}
            href={AGENT_ASSEMBLY_URL_PRODUCTS_CARD}
            target="_blank"
            rel="noreferrer"
            data-horo-tracked=""
            onClick={trackAgentAssemblyClick(AGENT_ASSEMBLY_URL_PRODUCTS_CARD)}>
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
              A governance layer for AI agents. It decides which tools,
              domains, and budgets an agent may use, holds risky actions for
              human review, and records what happened.
            </p>
            {/*
              Category label. "AGENT INFRASTRUCTURE" read as tooling for
              building agents; the category Agent Assembly competes in is
              governance (AAASM-5614). The destination is the canonical
              product URL per ADR 0007 (agent-assembly.com apex).
            */}
            <div className={styles.productMeta}>
              AGENT GOVERNANCE · AGENT-ASSEMBLY.COM ↗
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
  // Same-hostname link — MUST NOT carry UTM per UTM conventions §5.2.
  const manifestoHref = '/#manifesto';
  const onManifestoClick = (): void => {
    trackHoronomyEvent('horonomy_manifesto_click', {
      cta_location: 'body',
      link_url: manifestoHref,
      link_domain: linkDomainOf(manifestoHref),
      target_product: 'horonomy',
    });
  };

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
          href={manifestoHref}
          data-horo-tracked=""
          onClick={onManifestoClick}>
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

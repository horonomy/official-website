import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {
  linkDomainOf,
  trackHoronomyEvent,
} from '@site/src/analytics/trackEvent';
import {
  PORTFOLIO_STAGE_AXIS,
  maturityLabelFor,
} from '@site/src/data/productLifecycle';
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

const AGENT_ASSEMBLY_MATURITY = maturityLabelFor('ai-agent-assembly');

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
            alt="The First Horologer — Horonom's mascot, observing the sky with an astrolabe"
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
              {/* Maturity from the pinned company registry, so this badge and
                  the hero card's cannot say two different things about the
                  same product (AAASM-5614).

                  The axis rides in a visually-hidden span here, but in the
                  hero card's `aria-label` instead: that card sets an
                  `aria-label` on its <a>, which replaces the accessible name
                  computed from its children, so a hidden span inside it would
                  never be announced. This card sets no `aria-label`, so its
                  children are the accessible name (AAASM-5616). */}
              {AGENT_ASSEMBLY_MATURITY && (
                <span
                  className={styles.badgeActive}
                  title={`${PORTFOLIO_STAGE_AXIS} — where this product sits in the Horonom portfolio`}>
                  <span className="hn-sr-only">{PORTFOLIO_STAGE_AXIS}: </span>
                  {AGENT_ASSEMBLY_MATURITY}
                </span>
              )}
            </div>
            <div className={styles.productName}>AI agent assembly</div>
            {/*
              Every clause here is traceable to a card on agent-assembly.com's
              `/product` page, and the bounds travel with them (AAASM-5616).

              "On the paths you route through it" carries the D2 precondition
              the product declares non-severable from its promise; without it
              ADR 0034 §2.3 reads the scope at its widest.

              "evaluates … against your policy" is the ADR 0033 §6 term
              itself, matching the product's own hero verb rather than a
              paraphrase of it.

              It says "network calls", not "tool and network calls". The
              routing precondition above covers network, but tools carry a
              second, different bound the same clause cannot: MCP tool-call
              refusal is off until an operator turns it on, and tool servers
              over stdio — the most common setup — have no interception
              mechanism at all. Carrying one bound and not the other is the
              failure mode, so the tool claim is dropped rather than
              half-qualified.

              Budgets are gone because the product's spend card carries the
              term "Unmeasured" and says the claim "is about what a policy can
              declare, not about what stops a call" — restating that as a
              decision verb is a D8 value above the row.

              "can hold an action instead of answering it" is the product's own
              sentence verbatim. What stood here — "holds risky actions for
              human review" — asserted the one part it says is not there: "No
              shipped operator surface can answer the queue the hold blocks on
              … Do not plan on human review yet" (AAASM-5657).

              "records what it decided" is the product's phrasing, and narrower
              than "records what happened", which implies a record of the
              action rather than of the decision.
            */}
            <p className={styles.productBody}>
              A governance layer for AI agents. On the paths you route through
              it, it evaluates an agent&apos;s network calls against your
              policy, can hold an action instead of answering it, and records
              what it decided.
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
          becomes drift. Horonom builds the systems that make autonomy{' '}
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

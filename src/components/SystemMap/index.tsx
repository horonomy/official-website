import React from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import {
  linkDomainOf,
  trackHoronomyEvent,
} from '@site/src/analytics/trackEvent';
import {PRODUCT_REGISTRY, type ProductEntry} from '@site/src/data/productRegistry';
import {
  REGISTRY_STAGE_AXIS,
  registryMaturityLabelFor,
} from '@site/src/data/registryMaturityLabels';
import {destinationLabel} from '@site/src/data/productDestinations';
import {CONSTELLATIONS} from '@site/src/components/HeroUniverse/constellations';
import {LAYERS} from '@site/src/components/HeroUniverse/layers';
import styles from './SystemMap.module.css';

/**
 * System Map (HORO-284 PR-2) — the single, real card row for the public
 * product portfolio, derived from the HORO-282 Product Registry.
 *
 * Replaces two prior surfaces that both duplicated product data by hand and
 * disagreed with each other and with the registry:
 *   - `HeroUniverse/ProductCards.tsx`, sourced from the stale, hardcoded
 *     `HeroUniverse/products.ts` (AI Agent Assembly, ArcheWeave, Harbinger —
 *     none of which is the current registry's product set).
 *   - `Sections/index.tsx`'s `Products()` band, a hand-authored card for AI
 *     Agent Assembly plus a generic "Research tracks" placeholder — both
 *     surfaces rendered `id="products"`, a duplicate DOM id this component
 *     also fixes by being the one place that owns it.
 *
 * Cards render every {@link PRODUCT_REGISTRY} entry in `order` — today that's
 * all four public products, each already live at its `canonicalUrl` (the
 * `atlas/destinations.mjs` `LIVE_HOSTS` allowlist independently confirms
 * octans/circinus/ophiuchus.horo.run resolve). There is no "coming soon"
 * state here: a product only belongs in the registry once the company is
 * ready to show it publicly (see `productRegistry.ts`'s own header comment),
 * so every card is a real, clickable link.
 *
 * Click tracking stays exactly as it was: only the AI Agent Assembly card
 * carries a GA4 `horonomy_product_agent_assembly_click` event with UTM
 * parameters — that event name and its `target_product` vocabulary are a
 * closed taxonomy (`trackEvent.ts`, HORO-45) that does not yet have members
 * for octans/circinus/ophiuchus. Adding them is a taxonomy amendment, not a
 * structural card-surface change, so it is deliberately out of this PR's
 * scope; the other three cards link out untracked, matching how
 * `ConstellationMap`'s own product links have always behaved.
 */

// Same cross-hostname UTM vocabulary the old `Sections` band used for this
// exact card (IA plan §2.1, UTM conventions §4, HORO-47) — carried over
// unchanged so the GA4 event stream sees no discontinuity from this move.
const AGENT_ASSEMBLY_URL_SYSTEM_MAP_CARD =
  'https://agent-assembly.com/' +
  '?utm_source=horonomy_site' +
  '&utm_medium=referral' +
  '&utm_campaign=agent_assembly_launch' +
  '&utm_content=home_system_map_card';

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

/** Fit a constellation's real node cloud into a padded icon box, uniform
 *  scale (preserves true relative star positions), centered. Mirrors the
 *  projection `HeroUniverse/ProductCards.tsx` used before this PR. */
const GLYPH_SIZE = 24;
const GLYPH_PAD = 3;

function projectGlyph(
  nodes: Array<[number, number]>,
): Array<[number, number]> {
  const xs = nodes.map(([x]) => x);
  const ys = nodes.map(([, y]) => y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const w = Math.max(...xs) - minX || 1;
  const h = Math.max(...ys) - minY || 1;
  const scale = (GLYPH_SIZE - GLYPH_PAD * 2) / Math.max(w, h);
  const ox = (GLYPH_SIZE - w * scale) / 2;
  const oy = (GLYPH_SIZE - h * scale) / 2;
  return nodes.map(([x, y]) => [
    +(ox + (x - minX) * scale).toFixed(2),
    +(oy + (y - minY) * scale).toFixed(2),
  ]);
}

/**
 * Card glyph. Draws the real constellation shape for a registry id that has
 * one in `constellations.ts` (today: `ai-agent-assembly` only — Octans,
 * Circinus and Ophiuchus have no plotted sky geometry yet, a celestial-design
 * task outside this structural PR). Every other registry entry falls back to
 * a plain ringed star mark, matching the generic product-icon `Sections/
 * index.tsx`'s old band already used for its non-Agent-Assembly card.
 */
function Glyph({id}: {id: string}): React.ReactElement {
  const shape = CONSTELLATIONS[id];
  if (shape) {
    const pts = projectGlyph(shape.nodes);
    const figures = shape.figures ?? [shape.nodes.map((_, i) => i)];
    return (
      <svg className={styles.glyph} viewBox="0 0 24 24" aria-hidden="true">
        {figures.map((idx, i) => (
          <polyline
            key={`f${i}`}
            className={styles.glyphLink}
            points={idx.map((n) => `${pts[n][0]},${pts[n][1]}`).join(' ')}
          />
        ))}
        {shape.chords?.map(([a, b], i) => (
          <line
            key={`c${i}`}
            className={styles.glyphLink}
            x1={pts[a][0]}
            y1={pts[a][1]}
            x2={pts[b][0]}
            y2={pts[b][1]}
          />
        ))}
        {pts.map(([x, y], i) => (
          <circle
            key={i}
            className={styles.glyphNode}
            cx={x}
            cy={y}
            r={i === shape.anchor ? 1.8 : shape.minor?.includes(i) ? 0.9 : 1.3}
          />
        ))}
      </svg>
    );
  }
  return (
    <svg
      className={styles.glyph}
      viewBox="0 0 24 24"
      aria-hidden="true">
      <circle
        className={styles.glyphFallbackRing}
        cx="12"
        cy="12"
        r="9"
        fill="none"
        strokeWidth="1.6"
        strokeDasharray="42 14.5"
        transform="rotate(-50 12 12)"
      />
      <circle className={styles.glyphNode} cx="12" cy="12" r="1.6" />
    </svg>
  );
}

function StagePill({entry}: {entry: ProductEntry}): React.ReactElement {
  const label = registryMaturityLabelFor(entry.id);
  return (
    <span
      className={styles.maturity}
      title={`${REGISTRY_STAGE_AXIS} — where this product sits on its own path to general availability`}>
      <span className="hn-sr-only">{REGISTRY_STAGE_AXIS}: </span>
      {label}
    </span>
  );
}

function SystemMapCard({entry}: {entry: ProductEntry}): React.ReactElement {
  const isAgentAssembly = entry.id === 'ai-agent-assembly';
  const href = isAgentAssembly
    ? AGENT_ASSEMBLY_URL_SYSTEM_MAP_CARD
    : entry.canonicalUrl;
  const destination = destinationLabel(entry.canonicalUrl);

  return (
    <Link
      className={clsx(styles.card, entry.order === 0 && styles.primary)}
      to={href}
      aria-label={`${entry.name}, ${REGISTRY_STAGE_AXIS.toLowerCase()} ${
        registryMaturityLabelFor(entry.id) ?? ''
      } — learn more at ${destination}`}
      onClick={isAgentAssembly ? trackAgentAssemblyClick(href) : undefined}>
      <Glyph id={entry.id} />
      <div className={styles.cardBody}>
        <div className={styles.nameRow}>
          <h3 className={styles.name}>{entry.name}</h3>
          <StagePill entry={entry} />
        </div>
        <div className={styles.category}>{entry.category}</div>
        <p className={styles.problem}>{entry.problem}</p>
        <p className={styles.relationship}>{entry.relationship}</p>
        <span className={styles.more}>
          Learn more <span className={styles.arrow} aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}

export default function SystemMap(): React.ReactElement {
  const products = [...PRODUCT_REGISTRY].sort((a, b) => a.order - b.order);
  return (
    <section
      id="products"
      className={styles.section}
      style={{zIndex: LAYERS.cards}}
      aria-label="Products">
      <div className={clsx('hn-shell', styles.grid)}>
        {products.map((entry) => (
          <SystemMapCard key={entry.id} entry={entry} />
        ))}
      </div>
    </section>
  );
}

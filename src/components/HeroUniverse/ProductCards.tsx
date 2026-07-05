import React from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import {LAYERS} from './layers';
import {PRODUCTS, type Product} from './products';
import styles from './ProductCards.module.css';

/**
 * The row of product cards along the bottom of the hero. Real, accessible
 * cards built from {@link PRODUCTS}; the wrapper carries `id="products"` so
 * the hero's "Explore Products" anchor resolves. Each card shows a small
 * constellation glyph, and gold diamond connectors join the cards into one
 * "constellation path" per the v1 mock. The `primary` product is gold-accented.
 */

// Miniature constellation glyphs (24x24 viewBox) — one per product id, echoing
// the sky map shapes at card scale. Purely decorative.
const GLYPHS: Record<string, Array<[number, number]>> = {
  'ai-agent-assembly': [
    [4, 13],
    [8, 5],
    [15, 4],
    [20, 9],
    [18, 17],
    [10, 20],
  ],
  archeweave: [
    [5, 8],
    [12, 4],
    [19, 8],
    [16, 16],
    [8, 16],
    [5, 8],
  ],
  harbinger: [
    [4, 16],
    [9, 6],
    [15, 12],
    [20, 4],
  ],
  more: [
    [12, 4],
    [20, 12],
    [12, 20],
    [4, 12],
    [12, 4],
  ],
};

function Glyph({id}: {id: string}): React.ReactElement | null {
  const nodes = GLYPHS[id];
  if (!nodes) return null;
  return (
    <svg className={styles.glyph} viewBox="0 0 24 24" aria-hidden="true">
      <polyline
        className={styles.glyphLink}
        points={nodes.map(([x, y]) => `${x},${y}`).join(' ')}
      />
      {nodes.map(([x, y], i) => (
        <circle key={i} className={styles.glyphNode} cx={x} cy={y} r={1.6} />
      ))}
    </svg>
  );
}

function ProductCard({
  product,
  active,
  onActivate,
}: {
  product: Product;
  active?: boolean;
  onActivate?: (id: string) => void;
}): React.ReactElement {
  // Pointer/focus enter emits the product id so a future shared parent can echo
  // the highlight into the sky map. Self-contained today: without `onActivate`
  // wired in `index.tsx`, this is a no-op and the card just styles its own state.
  const emit = onActivate ? () => onActivate(product.id) : undefined;

  // Products still in design/estimation render as a non-interactive roadmap
  // entry: a plain <div> (no link, no pointer, no navigation, no focus stop),
  // with a "Coming soon" label instead of the "Learn more →" affordance.
  if (product.comingSoon) {
    return (
      <div
        className={clsx(styles.card, styles[product.tone], styles.comingSoon)}
        aria-disabled="true"
        tabIndex={-1}>
        <Glyph id={product.id} />
        <div className={styles.cardBody}>
          <h3 className={styles.name}>{product.name}</h3>
          <p className={styles.blurb}>{product.blurb}</p>
          <span className={styles.badge}>Coming soon</span>
        </div>
      </div>
    );
  }

  return (
    <Link
      className={clsx(styles.card, styles[product.tone], active && styles.active)}
      to={product.href}
      aria-label={`${product.name} — learn more`}
      onMouseEnter={emit}
      onFocus={emit}>
      <Glyph id={product.id} />
      <div className={styles.cardBody}>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.blurb}>{product.blurb}</p>
        <span className={styles.more}>
          Learn more <span className={styles.arrow} aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}

/**
 * @property activeId   Currently-highlighted product id (mirrors the sky map).
 * @property onActivate Emitted on card hover/focus with the product id.
 *
 * Both props are optional and exist for a future shared active-state sync with
 * the ConstellationMap (HORO-4). Cross-component wiring lives in `index.tsx` and
 * is intentionally deferred — this component stays fully self-contained until then.
 */
export default function ProductCards({
  activeId,
  onActivate,
}: {
  activeId?: string;
  onActivate?: (id: string) => void;
} = {}): React.ReactElement {
  return (
    <section
      id="products"
      className={styles.section}
      style={{zIndex: LAYERS.cards}}
      aria-label="Products">
      <div className={clsx('hn-shell', styles.grid)}>
        {PRODUCTS.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            active={activeId === p.id}
            onActivate={onActivate}
          />
        ))}
      </div>
    </section>
  );
}

import React from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import {LAYERS} from './layers';
import {PRODUCTS, type Product} from './products';
import {CONSTELLATIONS} from './constellations';
import styles from './ProductCards.module.css';

/**
 * The row of product cards along the bottom of the hero. Real, accessible
 * cards built from {@link PRODUCTS}; the wrapper carries `id="products"` so
 * the hero's "Explore Products" anchor resolves. Each card shows a small
 * constellation glyph, and gold diamond connectors join the cards into one
 * "constellation path" per the v1 mock. The `primary` product is gold-accented.
 */

// Miniature constellation glyphs — projected from the REAL catalogue star
// positions in {@link CONSTELLATIONS} into a 24x24 icon viewBox, so each card's
// icon matches its true sky-map shape at card scale (not an emblematic stand-in).
const GLYPH_SIZE = 24;
const GLYPH_PAD = 3;

/** Fit a constellation's real node cloud into the padded icon box, uniform
 *  scale (preserves true relative star positions), centered. */
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

function Glyph({id}: {id: string}): React.ReactElement | null {
  const shape = CONSTELLATIONS[id];
  if (!shape) return null;
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

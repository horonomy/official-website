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

function ProductCard({product}: {product: Product}): React.ReactElement {
  return (
    <Link
      className={clsx(styles.card, styles[product.tone])}
      to={product.href}
      aria-label={`${product.name} — learn more`}>
      <Glyph id={product.id} />
      <div className={styles.cardBody}>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.blurb}>{product.blurb}</p>
        <span className={styles.more}>
          Learn more <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}

export default function ProductCards(): React.ReactElement {
  return (
    <section
      id="products"
      className={styles.section}
      style={{zIndex: LAYERS.cards}}
      aria-label="Products">
      <div className={clsx('hn-shell', styles.grid)}>
        {PRODUCTS.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

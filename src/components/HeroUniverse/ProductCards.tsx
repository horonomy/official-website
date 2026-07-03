import React from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import {LAYERS} from './layers';
import {PRODUCTS, type Product} from './products';
import styles from './ProductCards.module.css';

/**
 * The row of product cards below the scene. Real, accessible cards built from
 * {@link PRODUCTS}; the wrapper carries `id="products"` so the hero's "Explore
 * Products" anchor resolves. The `primary` product is gold-accented.
 */

function ProductCard({product}: {product: Product}): React.ReactElement {
  return (
    <Link
      className={clsx(styles.card, styles[product.tone])}
      to={product.href}
      aria-label={`${product.name} — learn more`}>
      <h3 className={styles.name}>{product.name}</h3>
      <p className={styles.blurb}>{product.blurb}</p>
      <span className={styles.more}>
        Learn more <span aria-hidden="true">→</span>
      </span>
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

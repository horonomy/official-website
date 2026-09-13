import React from 'react';
import Link from '@docusaurus/Link';
import {PRODUCT_REGISTRY} from '@site/src/data/productRegistry';
import {resolveDestination, resolveDocsDestination} from '../../../atlas/destinations.mjs';

/** The index routes readers to existing publishers; it never invents a product's docs. */
export default function ProductDocumentation(): React.ReactElement {
  const products = [...PRODUCT_REGISTRY]
    .filter(entry => resolveDestination(entry).state === 'live')
    .sort((a, b) => a.order - b.order);
  return (
    <ul>
      {products.map(entry => {
        const docs = resolveDocsDestination(entry);
        return (
          <li key={entry.id}>
            <strong>{entry.name}</strong>{' — '}
            {docs ? <Link to={docs} aria-label={`${entry.name} documentation`}>Documentation</Link>
              : <span>No public documentation yet. <Link to={entry.canonicalUrl}>Product overview</Link></span>}
          </li>
        );
      })}
    </ul>
  );
}

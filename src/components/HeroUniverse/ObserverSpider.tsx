import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {LAYERS} from './layers';
import styles from './ObserverSpider.module.css';

/**
 * The First Horologer — the hero spider observer, rendered on the stone
 * platform. Decorative (`aria-hidden`); the headline carries the semantics.
 *
 * STUB SLOT — renders `observer.webp` as one static layer for now.
 * // HORO-7 fills in layered animation states (idle sway, head/astrolabe motion).
 */
export default function ObserverSpider(): React.ReactElement {
  const observer = useBaseUrl('/img/hero/observer.webp');

  return (
    <div
      className={styles.root}
      style={{zIndex: LAYERS.observer}}
      aria-hidden="true">
      <img
        className={styles.observer}
        src={observer}
        alt=""
        loading="eager"
        decoding="async"
      />
    </div>
  );
}

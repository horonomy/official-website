import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {LAYERS} from './layers';
import styles from './ObserverSpider.module.css';

/**
 * The First Horologer — the hero spider observer.
 *
 * A single fixed pose: the keeper standing on the dais, holding and studying its
 * gold astrolabe (`static/img/hero/keeper/keeper.webp`, sliced from the
 * registration reference art). Decorative (`aria-hidden`); the headline carries
 * the semantics. A soft contact shadow grounds it on the stone. No animation —
 * intentionally a static image.
 */
export default function ObserverSpider(): React.ReactElement {
  const keeper = useBaseUrl('/img/hero/keeper/keeper.webp');

  return (
    <div
      className={styles.root}
      style={{zIndex: LAYERS.observer}}
      aria-hidden="true">
      {/* Soft contact shadow so the keeper stands on the dais, not floating. */}
      <div className={styles.contactShadow} />
      <img
        className={styles.keeper}
        src={keeper}
        alt=""
        loading="eager"
        decoding="async"
      />
    </div>
  );
}

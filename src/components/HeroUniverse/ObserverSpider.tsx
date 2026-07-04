import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {LAYERS} from './layers';
import styles from './ObserverSpider.module.css';

/**
 * The First Horologer — the hero spider observer, rendered on the stone
 * platform. Decorative (`aria-hidden`); the headline carries the semantics.
 *
 * Renders `observer.webp` as a single layer with a calm, pure-CSS idle
 * animation (slow breathing bob/sway + a soft astrolabe glow pulse). The
 * motion is disabled under `prefers-reduced-motion: reduce`.
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

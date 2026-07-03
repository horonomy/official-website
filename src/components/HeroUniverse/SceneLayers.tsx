import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {LAYERS} from './layers';
import styles from './SceneLayers.module.css';

/**
 * The real raster backdrop of the scene: wide background plate, night sky, and
 * the dusk mountains + stone platform. All three are decorative and marked
 * `aria-hidden`; sources load through `useBaseUrl` so the site works under a
 * non-root `baseUrl` and stays SSR-safe.
 */
export default function SceneLayers(): React.ReactElement {
  const background = useBaseUrl('/img/hero/background.webp');
  const sky = useBaseUrl('/img/hero/sky.webp');
  const environment = useBaseUrl('/img/hero/environment.webp');

  return (
    <div className={styles.root} aria-hidden="true">
      <img
        className={styles.background}
        style={{zIndex: LAYERS.background}}
        src={background}
        alt=""
        loading="eager"
        decoding="async"
      />
      <img
        className={styles.sky}
        style={{zIndex: LAYERS.sky}}
        src={sky}
        alt=""
        loading="eager"
        decoding="async"
      />
      <img
        className={styles.environment}
        style={{zIndex: LAYERS.environment}}
        src={environment}
        alt=""
        loading="eager"
        decoding="async"
      />
    </div>
  );
}

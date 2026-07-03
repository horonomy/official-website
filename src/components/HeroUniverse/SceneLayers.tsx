import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {LAYERS} from './layers';
import styles from './SceneLayers.module.css';

/**
 * The real raster backdrop of the scene.
 *
 * `background.webp` is the full-bleed night-sky backdrop (stars, shooting stars,
 * dusk mountains, orange horizon glow) and covers the entire scene at
 * z=background. `environment.webp` is a transparent astrolabe-engraved stone
 * platform prop that sits low at bottom-centre (z=environment) for the observer
 * to stand on — it is NOT a background. Both are decorative (`aria-hidden`) and
 * load through `useBaseUrl` so the site works under a non-root `baseUrl` and
 * stays SSR-safe.
 */
export default function SceneLayers(): React.ReactElement {
  const background = useBaseUrl('/img/hero/background.webp');
  const platform = useBaseUrl('/img/hero/environment.webp');

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
        className={styles.platform}
        style={{zIndex: LAYERS.environment}}
        src={platform}
        alt=""
        loading="eager"
        decoding="async"
      />
    </div>
  );
}

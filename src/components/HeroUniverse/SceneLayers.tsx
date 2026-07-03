import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {LAYERS} from './layers';
import styles from './SceneLayers.module.css';

/**
 * The real raster backdrop of the scene.
 *
 * `background.webp` is the full-bleed night-sky backdrop (stars, shooting stars,
 * dusk mountains, orange horizon glow) and covers the entire scene at
 * z=background. `ground.webp` is a transparent observatory terrace (cracked
 * stone + a central astrolabe dais) anchored across the bottom (z=environment)
 * so the observer stands on real ground instead of floating. Both are
 * decorative (`aria-hidden`) and load through `useBaseUrl` so the site works
 * under a non-root `baseUrl` and stays SSR-safe.
 */
export default function SceneLayers(): React.ReactElement {
  const background = useBaseUrl('/img/hero/background.webp');
  const ground = useBaseUrl('/img/hero/ground.webp');

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
        className={styles.ground}
        style={{zIndex: LAYERS.environment}}
        src={ground}
        alt=""
        loading="eager"
        decoding="async"
      />
    </div>
  );
}

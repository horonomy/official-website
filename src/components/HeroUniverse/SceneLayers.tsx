import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {LAYERS} from './layers';
import styles from './SceneLayers.module.css';

/**
 * The real raster backdrop of the scene.
 *
 * `background.webp` is the night-sky backdrop (stars, shooting stars, dusk
 * mountains, orange horizon glow) at z=background; it stops short of the
 * scene's bottom edge so the mountain range stays fully visible above the
 * terrace. `ground.webp` is a transparent observatory terrace panorama
 * (astrolabe dais, braziers, armillary sphere, altar) anchored in the bottom
 * band (z=environment) so the observer stands on real ground. Both are
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

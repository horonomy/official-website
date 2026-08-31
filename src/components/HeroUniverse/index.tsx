import React from 'react';
import clsx from 'clsx';
import SceneLayers from './SceneLayers';
import AmbientEffects from './AmbientEffects';
import ObserverSpider from './ObserverSpider';
import EnvironmentProps from './EnvironmentProps';
import ConstellationMap from './ConstellationMap';
import HeroCopy from './HeroCopy';
import HeroCtaGroup from './HeroCtaGroup';
import AnnotationCard from './AnnotationCard';
import SystemMap from '@site/src/components/SystemMap';
import {LAYERS} from './layers';
import styles from './HeroUniverse.module.css';

/**
 * HeroUniverse — the immersive homepage hero (HORO-2).
 *
 * A positioned scene composes the layers back-to-front per the z-index model in
 * `./layers.ts`: SceneLayers → AmbientEffects → ObserverSpider → EnvironmentProps
 * → ConstellationMap → the HTML overlay (HeroCopy + HeroCtaGroup + AnnotationCard).
 * The SystemMap row sits below the scene and owns the `#products` anchor
 * (HORO-284 PR-2 — was `ProductCards`, sourced from the stale `products.ts`).
 *
 * SSR-safe: every raster asset loads through `useBaseUrl` inside its layer
 * component; there is no `window`/`document` access at module or render top level.
 */
export default function HeroUniverse(): React.ReactElement {
  return (
    <div className={styles.universe}>
      {/* The observatory star-map scene — target of the `/#observatory` nav/footer link. */}
      <div id="observatory" className={styles.scene}>
        {/* back → front */}
        <SceneLayers />
        <AmbientEffects />
        <ObserverSpider />
        <EnvironmentProps />
        <ConstellationMap />

        {/* HTML overlay (content layer) */}
        <div
          className={styles.overlay}
          style={{zIndex: LAYERS.content}}>
          <div className={clsx('hn-shell', styles.overlayInner)}>
            <div className={styles.copyCol}>
              <HeroCopy />
              <HeroCtaGroup />
            </div>
            <div className={styles.annotationCol}>
              <AnnotationCard />
            </div>
          </div>
        </div>
      </div>

      <SystemMap />
    </div>
  );
}

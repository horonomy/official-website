import React from 'react';
import styles from './AnnotationCard.module.css';

/**
 * The small "Navigating the Intelligence Universe" annotation card anchored to
 * the lower-right of the scene, explaining the constellation metaphor.
 */
export default function AnnotationCard(): React.ReactElement {
  return (
    <aside className={styles.root} aria-label="Navigating the Intelligence Universe">
      <h2 className={styles.title}>Navigating the Intelligence Universe</h2>
      <p className={styles.body}>
        Every product is a star. Every connection, a path. Together, we build
        constellations.
      </p>
    </aside>
  );
}

import React from 'react';
import Link from '@docusaurus/Link';
import styles from './HeroCtaGroup.module.css';

/**
 * The two hero calls-to-action: a gold solid "Explore Products" that jumps to
 * the product cards anchor, and a ghost "Read the Docs" into the docs.
 */
export default function HeroCtaGroup(): React.ReactElement {
  return (
    <div className={styles.root}>
      <Link className={styles.solid} to="#products">
        Explore Products <span aria-hidden="true">→</span>
      </Link>
      <Link className={styles.ghost} to="/docs/intro">
        Read the Docs
      </Link>
    </div>
  );
}

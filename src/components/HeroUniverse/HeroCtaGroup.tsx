import React from 'react';
import Link from '@docusaurus/Link';
import styles from './HeroCtaGroup.module.css';

/**
 * Hero CTAs (HORO-284 PR-4, owner-approved copy direction).
 *
 *   1. Primary — "Explore our systems": same-hostname anchor to `#products`
 *      (the System Map). The homepage's job is to introduce Horonom as a
 *      company/product family, not to route every visitor straight to one
 *      product — that's why this replaces the old "Explore Agent Assembly"
 *      CTA. Same-hostname link, so it carries no UTM (UTM conventions §5.2)
 *      and no click event, matching the navbar's own untracked `#products`
 *      link.
 *   2. Secondary — "Open Product Atlas ↗": cross-hostname to `horo.run`.
 *      Untracked, matching the navbar/footer Atlas links added in HORO-284
 *      PR-6 — `target_product` (trackEvent.ts) has no taxonomy member for
 *      horo.run, and adding one is a separate taxonomy decision, not bundled
 *      here.
 *
 * The GitHub org link and the individual Agent Assembly CTA remain reachable
 * from the navbar and the System Map card respectively — dropping them from
 * the hero is not dropping them from the page.
 */
export default function HeroCtaGroup(): React.ReactElement {
  return (
    <div className={styles.root}>
      <Link className={styles.solid} to="/#products">
        Explore our systems{' '}
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
      </Link>
      <Link className={styles.ghost} to="https://horo.run">
        Open Product Atlas ↗
      </Link>
    </div>
  );
}

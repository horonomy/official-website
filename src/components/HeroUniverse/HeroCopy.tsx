import React from 'react';
import styles from './HeroCopy.module.css';

/**
 * The real semantic hero copy: the page's single `h1` (with "Intelligence" in
 * gold on its own line) and the supporting subhead.
 *
 * Copy aligned with IA plan §2.1 (HORO-40) — Horonomy is an AI-native company
 * building governance-first systems for autonomous software; product-level
 * conversion happens on `agent-assembly.com`, not here. The subhead avoids
 * SaaS-availability language ("operating system for organizations",
 * "planetary scale") that would violate the no-fake-doors principle
 * (§4.6) since Horonomy itself does not ship a SaaS control plane today.
 */
export default function HeroCopy(): React.ReactElement {
  return (
    <div className={styles.root}>
      <h1 className={styles.title}>
        We Build the Infrastructure of{' '}
        <span className={styles.gold}>Intelligence.</span>
      </h1>
      <p className={styles.subhead}>
        Horonomy is an AI-native company building governance-first systems for
        autonomous software. Our first product,{' '}
        <span className={styles.gold}>Agent Assembly</span>, defines the
        runtime boundary where AI agents can act — assembled, governed, and
        auditable.
      </p>
    </div>
  );
}

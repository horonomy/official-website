import React from 'react';
import styles from './HeroCopy.module.css';

/**
 * The real semantic hero copy: the page's single `h1` (with "Intelligence" in
 * gold on its own line) and the supporting subhead.
 */
export default function HeroCopy(): React.ReactElement {
  return (
    <div className={styles.root}>
      <h1 className={styles.title}>
        We Build the Infrastructure of{' '}
        <span className={styles.gold}>Intelligence.</span>
      </h1>
      <p className={styles.subhead}>
        Horonomy is the operating system for AI-native organizations. We provide
        the foundational layers to assemble, connect, observe, and evolve
        intelligent systems at planetary scale.
      </p>
    </div>
  );
}

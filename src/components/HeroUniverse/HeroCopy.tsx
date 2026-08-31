import React from 'react';
import styles from './HeroCopy.module.css';

/**
 * The real semantic hero copy: the page's single `h1` (with "Intelligence" in
 * gold on its own line) and the supporting subhead.
 *
 * HORO-284 PR-4 (owner-approved copy direction, 2026-08-31): the subhead no
 * longer defines Horonom as "an AI-native company" — that framing named a
 * category, not what the company does or why it matters, and the ticket's
 * content constraints forbid it explicitly. It also no longer names Agent
 * Assembly or carries that product's specific promise ("evaluates the agent
 * actions you route through it against your policy") — a company-level
 * page introducing a product family should not let one product define the
 * parent company; that promise now lives where it belongs, on the System
 * Map's Agent Assembly card (`SystemMap/index.tsx`) and on
 * agent-assembly.com itself. Duplicating it here was also literally
 * redundant with the card one scroll below.
 *
 * The subhead still avoids SaaS-availability language ("operating system for
 * organizations", "planetary scale") that would violate the no-fake-doors
 * principle (§4.6), since Horonom itself does not ship a SaaS control plane
 * today — and still makes no product-specific capability claim, since this
 * page is L0 (company-altitude) and does not own product truth (see
 * `product-narrative-hierarchy.md`).
 */
export default function HeroCopy(): React.ReactElement {
  return (
    <div className={styles.root}>
      <h1 className={styles.title}>
        We Build the Infrastructure of{' '}
        <span className={styles.gold}>Intelligence.</span>
      </h1>
      <p className={styles.subhead}>
        Horonom builds focused systems for software that increasingly
        observes, decides, coordinates, and acts on its own. We help teams
        keep that software governable, connected, and safe to change.
      </p>
    </div>
  );
}

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
 *
 * The subhead carries the routing precondition ("the agent actions you route
 * through it") because the product's own promise is declared non-severable
 * from it: agent-assembly.com's hero ends "An action you have not routed
 * through it is not inspected — and the record says so." What stood here —
 * "defines the runtime boundary where AI agents can act" — put a definite
 * article over an unbounded scope and dropped that precondition, which
 * ADR 0034 §2.2 grades a broadening rather than a simplification. A reader of
 * this page would have assumed an unrouted agent was covered (AAASM-5616).
 *
 * The verb is "evaluates" — the ADR 0033 §6 term, and the product's own — not
 * a paraphrase like "applies your policy to". This is the site's most
 * prominent product sentence, so it is the last place to swap a claim term for
 * a synonym whose strength nothing defines.
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
        <span className={styles.gold}>Agent Assembly</span>, evaluates the
        agent actions you route through it against your policy — and records
        what it decided.
      </p>
    </div>
  );
}

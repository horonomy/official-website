// Fail-closed destination resolution for the Product Atlas (HORO-285).
//
// An allowlist, not a denylist: a registry entry only gets a live link once
// its canonical host is proven to actually resolve and is added here by a
// reviewed change. A new/broken registry entry renders "pending" by
// default rather than publishing a dead link.
//
// Verified 2026-08-23, re-verified 2026-08-31, reconciled to the
// horo.run -> horonom.com migration (HORO-566/572) 2026-09-06 (HORO-594) —
// do not re-add/remove a host without re-verifying live:
//   - agent-assembly.com: 200, live (unchanged since 2026-08-23).
//   - octans.horo.run: unchanged since 2026-08-31 — a minimal, honest
//     "in development, no public surface yet" status page (`noindex`),
//     live (200). Not a placeholder for a real product claim; replace with
//     the real product surface once one exists.
//   - circinus.horonom.com / ophiuchus.horonom.com / fornax.horonom.com /
//     horologium.horonom.com: canonical marketing hosts as of the HORO-566
//     domain migration, each confirmed 200/live 2026-09-06 (HORO-572/594).
//     The legacy circinus.horo.run/ophiuchus.horo.run/fornax.horo.run hosts
//     are intentionally NOT on this allowlist any more — they now issue a
//     real 301 redirect to their horonom.com replacement (see each
//     product's own edge Worker: ophiuchus-edge, fornax-edge; Circinus's
//     equivalent) rather than serving a second indexable copy, per
//     ADR-0006 §3's "avoid duplicate indexable copies" rule this file has
//     followed since 2026-08-31.
//   - eridanus.horo.run / eridanus.horonom.com: deliberately NOT added.
//     horonomy/.github's metadata/release-evidence/eridanus.yaml records
//     claimed_lifecycle: not_yet_public — no website, no docs, no hosted
//     service exists. Adding either host here would fabricate a public
//     surface for a release-gated product; the Eridanus registry entry
//     renders "pending" until that changes.
//   - horonomy/{octans,circinus,ophiuchus,horologium} GitHub repos are
//     PRIVATE, so githubUrl is not a usable fallback for any of them.
//   - familyAliasUrl (e.g. agent-assembly.horo.run) must never be linked —
//     it is not in this allowlist and check:claims' canonical-link rule
//     would fail the build if it were rendered as an href. As of 2026-08-31
//     agent-assembly.horo.run resolves (301 to agent-assembly.com, via a
//     Cloudflare Pages `_redirects` project — not a Redirect Rule, which
//     this account's tokens don't have scope for) but the Atlas must keep
//     linking the canonical https://agent-assembly.com directly, never the
//     alias, per HORO-286's "avoid duplicate indexable copies" AC.

/** @type {ReadonlySet<string>} */
export const LIVE_HOSTS = new Set([
  'agent-assembly.com',
  'octans.horo.run',
  'circinus.horonom.com',
  'ophiuchus.horonom.com',
  'fornax.horonom.com',
  'horologium.horonom.com',
]);

/**
 * @param {{canonicalUrl: string}} entry
 * @returns {{state: 'live', href: string} | {state: 'pending', href: null}}
 */
export function resolveDestination(entry) {
  let host;
  try {
    host = new URL(entry.canonicalUrl).host;
  } catch {
    return {state: 'pending', href: null};
  }
  if (LIVE_HOSTS.has(host)) {
    return {state: 'live', href: entry.canonicalUrl};
  }
  return {state: 'pending', href: null};
}

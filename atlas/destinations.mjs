// Fail-closed destination resolution for the Product Atlas (HORO-285).
//
// An allowlist, not a denylist: a registry entry only gets a live link once
// its canonical host is proven to actually resolve and is added here by a
// reviewed change. A new/broken registry entry renders "pending" by
// default rather than publishing a dead link.
//
// Verified 2026-08-23 (do not re-add without re-verifying):
//   - agent-assembly.com: 200, live.
//   - octans.horo.run / circinus.horo.run / ophiuchus.horo.run: NXDOMAIN —
//     lands in HORO-286.
//   - horonomy/{octans,circinus,ophiuchus} GitHub repos are PRIVATE, so
//     githubUrl is not a usable fallback for those three (would trade one
//     dead/inaccessible link for another).
//   - familyAliasUrl (e.g. agent-assembly.horo.run) must never be linked —
//     it is not in this allowlist and check:claims' canonical-link rule
//     would fail the build if it were rendered as an href.

/** @type {ReadonlySet<string>} */
export const LIVE_HOSTS = new Set(['agent-assembly.com']);

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

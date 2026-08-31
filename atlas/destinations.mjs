// Fail-closed destination resolution for the Product Atlas (HORO-285).
//
// An allowlist, not a denylist: a registry entry only gets a live link once
// its canonical host is proven to actually resolve and is added here by a
// reviewed change. A new/broken registry entry renders "pending" by
// default rather than publishing a dead link.
//
// Verified 2026-08-23, re-verified 2026-08-31 against live Cloudflare DNS +
// HTTP (do not re-add without re-verifying):
//   - agent-assembly.com: 200, live (unchanged since 2026-08-23).
//   - circinus.horo.run / ophiuchus.horo.run: now provisioned and live (200)
//     as of 2026-08-31 — HORO-286's DNS/deploy work for these two landed
//     outside this repo (product-team-owned Cloudflare Pages deploys), so
//     the allowlist is catching up to reality rather than causing it.
//   - octans.horo.run: still NXDOMAIN — no Cloudflare Pages/Workers surface
//     exists to bind it to, and provisioning one needs Cloudflare Pages API
//     scope this session's DNS-only token does not carry. Stays pending.
//   - horonomy/{octans,circinus,ophiuchus} GitHub repos are PRIVATE, so
//     githubUrl is not a usable fallback for any of the three — including
//     the two now live, since a private repo link is not a public fallback
//     either.
//   - familyAliasUrl (e.g. agent-assembly.horo.run) must never be linked —
//     it is not in this allowlist and check:claims' canonical-link rule
//     would fail the build if it were rendered as an href. As of 2026-08-31
//     agent-assembly.horo.run still has no DNS record at all (HORO-286's
//     redirect/alias AC needs Cloudflare Redirect Rules, another scope this
//     token doesn't carry).

/** @type {ReadonlySet<string>} */
export const LIVE_HOSTS = new Set(['agent-assembly.com', 'circinus.horo.run', 'ophiuchus.horo.run']);

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

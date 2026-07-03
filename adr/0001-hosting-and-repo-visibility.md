# ADR 0001: Repository visibility and hosting for the Horonomy website

**Status**: Accepted
**Date**: 2026-07-03
**Task**: [AAASM-4049](https://lightning-dust-mite.atlassian.net/browse/AAASM-4049)
**Relates to**: [AAASM-4023](https://lightning-dust-mite.atlassian.net/browse/AAASM-4023) (website Epic), [AAASM-4045](https://lightning-dust-mite.atlassian.net/browse/AAASM-4045) (Cloudflare Pages deploy), [AAASM-3715](https://lightning-dust-mite.atlassian.net/browse/AAASM-3715) (agent-assembly moved GitHub Pages → Cloudflare Pages)

---

## Context

`horonomy/official-website` is the Horonomy parent-company marketing site (Docusaurus
+ TypeScript). Two decisions needed a durable record:

1. **Repository visibility** — public or private.
2. **Hosting / deploy target** — GitHub Pages or Cloudflare Pages.

Relevant facts at the time of the decision:

- The production domain **`horonomy.dev` is already an active zone in Cloudflare**
  (registrar Namecheap → Cloudflare nameservers; verified in AAASM-4043 / AAASM-4044).
- The sibling site `ai-agent-assembly/official-website` is a **public** repo, and the
  org's convention is public marketing repos.
- That sibling site first shipped an interim **GitHub Pages** deploy and then
  **replaced it with Cloudflare Pages** (AAASM-3715), after a Cloudflare-origin
  outage on the GitHub-Pages-era setup (AAASM-3701).
- The site contents are public-facing by nature; the repo holds no secrets (design
  boards, brand assets, and source only).

## Decision

1. **The repository is public.**
2. **The site is deployed with Cloudflare Pages.**

## Consequences

### Repository is public

- Matches the org convention (both `official-website` repos are public).
- Unlimited GitHub Actions minutes and free per-PR previews; no GHAS-gated features
  are required for this repo.
- The public face (rendered site) is unchanged either way; keeping the source public
  also exposes commit history and the `design/` reference material — acceptable, as
  none of it is sensitive.

### Cloudflare Pages hosting

- The custom domain, DNS record, and TLS are wired automatically inside the existing
  Cloudflare zone (one step — add `horonomy.dev` as a custom domain on the Pages
  project; see AAASM-4046). No CNAME-to-external-host juggling, and none of the
  SSL-mode / redirect-loop pitfalls of running GitHub Pages behind Cloudflare's proxy.
- Global edge CDN, per-PR preview deployments, and built-in analytics.
- Deploy is codified in `.github/workflows/deploy.yml` (`cloudflare/wrangler-action`,
  AAASM-4045), dormant until `CLOUDFLARE_DEPLOY_ENABLED=true` plus the
  `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` secrets are set.
- Consistent with the agent-assembly site, so operational knowledge transfers.

## Alternatives considered

- **Private repository** — rejected. It offers no benefit here (no secrets, public
  site) and diverges from org convention. It would also have removed GitHub Pages as
  a free option, since GitHub Pages does not serve private repos on the Free plan.
- **GitHub Pages hosting** — rejected. Now technically available (public repo), but
  the domain already lives in Cloudflare, and the org already migrated its other
  marketing site off GitHub Pages onto Cloudflare Pages after an outage. Choosing it
  would re-introduce the proxy/SSL complexity that migration removed.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository. It layers on top of the Horonomy org-wide baseline at
[`horonomy/.github`](https://github.com/horonomy/.github) (`.github/CLAUDE.md`),
which carries the shared engineering policy for all Horonomy repos.

## What this repository is

The **Horonomy company website** — the public marketing site served at
[horonomy.dev](https://horonomy.dev). It is a [Docusaurus](https://docusaurus.io/)
site (v3, classic preset, TypeScript). The homepage implements design direction
**3a — "The First Horologer"** (observatory hero). This is a content/presentation
repository: no application backend, no runtime services.

Design system, tokens, and homepage composition are documented in `README.md`.
Design tokens live in `src/css/custom.css`; the site is dark-native by design
(light mode is intentionally disabled).

## Stack

- **Framework**: Docusaurus 3.10.x (classic preset) + React 19, TypeScript.
- **Package manager**: **pnpm** (v10). `pnpm-lock.yaml` is committed — always use
  pnpm, never npm or yarn. Install with `pnpm install --frozen-lockfile` in CI.
- **Node**: >= 20.

## Build / serve / check commands

```bash
pnpm install          # install dependencies
pnpm start            # dev server with hot reload, http://localhost:3000
pnpm typecheck        # tsc, no emit — must be clean before pushing
pnpm build            # static production build → build/
pnpm check:claims     # offline product-claim gate over build/ (see below)
pnpm serve            # serve the production build locally
pnpm clear            # clear the Docusaurus build cache
```

`pnpm build` emits a fully static site under `build/`.

## CI and deploy

- **CI** (`.github/workflows/ci.yml`): on every PR to `main` **and on pushes to
  `main`** — installs deps, runs `pnpm typecheck`, `pnpm build`, then
  `pnpm check:claims`. All three must pass. It runs on `main` too because
  `deploy.yml` publishes from `main`: two individually green PRs can merge into
  a red tree, and the gate has to see what actually ships.
- **Deploy** (`.github/workflows/deploy.yml`): on push to `main`, builds and
  publishes to **Cloudflare Pages** (project `horonomy-official-website`,
  production branch `main`). The job is **dormant by default** — it only runs
  once the repo variable `CLOUDFLARE_DEPLOY_ENABLED` is set to `"true"` and the
  `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` secrets exist. It runs
  `pnpm check:claims` itself before publishing — `ci.yml`'s main-push run races
  it rather than gating it, so the check has to live in the job that deploys.

Always run `pnpm typecheck`, `pnpm build` and `pnpm check:claims` locally
before pushing — CI runs exactly these and nothing else, so a local pass is
authoritative. `check:claims` reads the built HTML, so it needs `pnpm build`
first.

## Writing about a product

This site is the **company** site. Agent Assembly is a **product**, and this
repository does not own the truth about it — it sits at T7/L0, the outermost
layer of the product-truth hierarchy and the lowest authority in it. The rule
is directional:

> An upper layer may **simplify** an approved lower-layer fact. It may never
> **broaden** it.

Read [`design/product-narrative-hierarchy.md`](../design/product-narrative-hierarchy.md)
before writing or editing any copy about a portfolio product. It carries the
boundary table, the approved summary format, the three maturity axes, and the
procedure for adding a future product. [`TRUTH-ADOPTION.md`](../TRUTH-ADOPTION.md)
is the machine-readable half.

### Updating a product summary

1. **Find the canonical source first.** Every product statement here must trace
   to `ai-agent-assembly/official-website` (`/product`, `/how-it-works`) or,
   beneath it, the Core manifest. A claim traceable only to another marketing
   page is not traceable. If no source supports the sentence, the sentence does
   not ship.
2. **Keep every bound.** If the source qualifies a statement by a routing,
   launch, configuration or opt-in step, carry the qualifier or drop the
   statement. Carrying half of it is the failure mode — dropping a precondition
   is a broadening even when every word left behind is true.
3. **Prefer nouns to verbs with objects.** "Permissions, approval checkpoints,
   and evidence" asserts that capabilities exist. "Decides which tools an agent
   may use" additionally invites the reader to infer which, when, and how far.
4. **Never state a capability the product calls unfinished.** Check the bound
   under the relevant card on `/product`. This is not hypothetical: the card
   here claimed human review while the product's own page said "Do not plan on
   human review yet".
5. **Never hand-write a maturity label or a product URL.** Both derive from the
   pinned company registry via `src/generated/company-metadata.ts`. The gate
   fails on a hardcoded one.
6. **Run the gate**: `pnpm build && pnpm check:claims`. Exit 1 is a finding;
   exit 2 means the gate itself is broken and no result from it counts.

### What may never be published here

Banned absolutes (ADR 0033 forbidden design 7 — the list lives in
`scripts/claim-gate-config.json`) are **unwaivable**. No approver, expiry or
owner makes one publishable; the only route is an evidence-backed amendment to
ADR 0033 in `ai-agent-assembly/agent-assembly`. Also out of bounds here: a
per-capability status, a platform claim, integration instructions, and any
date, SLA or commercial term.

## Conventions

- **Default branch / PR base**: `main`.
- **Commits**: gitmoji + scope, imperative summary, one logical unit per commit
  (per the org baseline). Example: `🔧 (deploy): Pin wrangler-action to v3`.
- **License**: proprietary — all rights reserved (see `LICENSE`). Do not add
  open-source license headers or `license` fields.

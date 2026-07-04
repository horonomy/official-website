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
pnpm serve            # serve the production build locally
pnpm clear            # clear the Docusaurus build cache
```

`pnpm build` emits a fully static site under `build/`.

## CI and deploy

- **CI** (`.github/workflows/ci.yml`): on every PR to `main` — installs deps,
  runs `pnpm typecheck`, then `pnpm build`. Both must pass.
- **Deploy** (`.github/workflows/deploy.yml`): on push to `main`, builds and
  publishes to **Cloudflare Pages** (project `horonomy-official-website`,
  production branch `main`). The job is **dormant by default** — it only runs
  once the repo variable `CLOUDFLARE_DEPLOY_ENABLED` is set to `"true"` and the
  `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` secrets exist.

Always run `pnpm typecheck` and `pnpm build` locally before pushing — CI runs
exactly these and nothing else, so a local pass is authoritative.

## Conventions

- **Default branch / PR base**: `main`.
- **Commits**: gitmoji + scope, imperative summary, one logical unit per commit
  (per the org baseline). Example: `🔧 (deploy): Pin wrangler-action to v3`.
- **License**: proprietary — all rights reserved (see `LICENSE`). Do not add
  open-source license headers or `license` fields.

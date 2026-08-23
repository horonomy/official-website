# Horonom — official website

> Defining the boundaries of autonomy.

The Horonomy company website, built with [Docusaurus](https://docusaurus.io/)
(classic preset, TypeScript). The homepage implements design direction **3a —
"The First Horologer"** (observatory hero) joined to the full-page content
architecture (Hero → Lore → Philosophy → Products → Manifesto), from the
`Horonomy Homepage Directions` design canvas.

## Design system

- Base graphite `#0F1115`, ink `#F4F5F7`.
- Type: **Space Grotesk** (display / body), **IBM Plex Mono** (labels / meta).
- Signal **cyan** `#00B2FF` is reserved for the "active boundary" only;
  **amber** `#F5A623` for review / checkpoint states.
- Dark-native — light mode is disabled by design.

Tokens live in `src/css/custom.css`. The homepage composition is
`src/pages/index.tsx` → `src/components/Hero` (canvas star field + the First
Horologer figure, in `sky.ts`) and `src/components/Sections`.

## Develop

```bash
pnpm install
pnpm start        # dev server, http://localhost:3000
pnpm typecheck    # tsc, no emit
pnpm build        # static output → build/
pnpm serve        # serve the production build locally
```

## Deploy

`pnpm build` emits a fully static site under `build/`, hostable on any static
host (Cloudflare Pages, GitHub Pages, S3, …). Set `url` / `baseUrl` in
`docusaurus.config.ts` for the target domain.

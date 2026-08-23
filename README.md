# Horonom — official website

> Defining the boundaries of autonomy.

The Horonom company website, built with [Docusaurus](https://docusaurus.io/)
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

### Shared design system (HORO-283)

`src/css/custom.css` is the shared token layer for every Horonom web
surface, not just this site — the corporate IA rework (HORO-284), the Horo
Run Product Atlas (HORO-285), and future `*.horo.run` product sites are
expected to start from these tokens rather than re-deriving values by eye.
Per ADR-0002 ("shared DNA, not shared layout"): a product site copies the
token *values*, not this repo's component markup — each product keeps its
own visual metaphor and page structure.

| Category | Tokens | Notes |
|---|---|---|
| Color | `--hn-graphite`, `--hn-ink`, `--hn-text`, `--hn-muted`, `--hn-cyan`, `--hn-gold`, `--hn-amber` | Cyan = active boundary only; amber = review/checkpoint; gold = HeroUniverse accent |
| Spacing | `--hn-space-1` … `--hn-space-8` (4px–64px) | Matches the increments already used across Hero/Sections/ProductCards |
| Radius | `--hn-radius-sm` (10px, buttons/inputs), `--hn-radius-md` (14px, cards), `--hn-radius-pill` (badges) | |
| Elevation | `--hn-shadow-sm/md/lg` | Resting/hover shadow depth |
| Focus | `--hn-focus-ring-color`, `--hn-focus-ring` | The one `:focus-visible` treatment; every interactive primitive should key off this pair, not invent its own outline |
| Breakpoints | `996px` (tablet), `560px` (mobile) | Documented as comments, not custom properties — `@media` can't read `var()` |
| Motion | `@media (prefers-reduced-motion: reduce)` block | Zeroes animation/transition duration site-wide; product sites should keep an equivalent block rather than opt out |
| Glass surfaces | `--hn-glass-bg`, `--hn-glass-blur`, `--hn-glass-border`, `--hn-glass-highlight` | Navbar/footer/card translucency system |

Adoption is incremental by design — no standalone package or npm-published
design-system repo exists (or is needed) yet. `official-website` and any
future product-site repo are independently deployed Docusaurus sites; a
versioned package is worth the distribution overhead only once at least one
more repo is actually consuming these tokens in production.

## Product Registry (HORO-282)

`src/data/productRegistry.ts` is the canonical, version-controlled Horonom
product portfolio — name, category, one-line problem statement, maturity,
and canonical/family/GitHub URLs for every publicly-shown product. It is
the intended source for the corporate site's System Map (HORO-284) and the
Horo Run Product Atlas (HORO-285); do not hand-duplicate a product's name,
URL, or maturity label anywhere else that could drift.

To add or update a product: edit one entry in `PRODUCT_REGISTRY`, then run
`pnpm check:registry` (schema/invariant validation) and `pnpm typecheck`
before opening a PR — both run in CI. Full procedure and field reference are
documented in the file's own header comment. This is a separate, richer
registry from `src/generated/company-metadata.ts`'s minimal footer catalog
— see that file's registry for why they aren't merged.

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

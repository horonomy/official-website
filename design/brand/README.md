# Brand — Horonom corporate identity

Usage guidance for the Horonom corporate mark as it is consumed by this
site (and, transitively, by anything that copies these assets or their
token values — see "Relationship to Horo Run" below). This is guidance for
consuming the existing assets, not a canonical *source-file* directory —
see "Open items" for what that would still require.

## Where the assets live

The production-consumed corporate brand assets are web-optimized SVG/PNG
exports in [`static/img/`](../../static/img/), not under `design/`:

| File | Used for |
|---|---|
| [`static/img/logo.svg`](../../static/img/logo.svg) | Navbar logo (`docusaurus.config.ts` → `themeConfig.navbar.logo`) |
| [`static/img/favicon.svg`](../../static/img/favicon.svg) | Site favicon |
| [`static/img/horonom-mascot.png`](../../static/img/horonom-mascot.png) | OG/social-preview image (`docusaurus.config.ts` → `themeConfig.image`) — see the open item below, this is a stopgap, not a purpose-made social card |

Both `logo.svg` and `favicon.svg` already carry the real Horonom mark
(`aria-label="Horonom"`) — confirmed by audit (HORO-293, 2026-08-31). There
is currently no separate vector/editable *source* file for the mark beyond
these production SVG exports; see "Open items."

For general (non-brand) design reference material — homepage direction
canvases, content-governance docs, screenshots — see the parent
[`design/README.md`](../README.md) and `design/v1/`.

## Dark-native, by design

This site does not have a light-mode variant, and that is a deliberate
decision, not an oversight. From `docusaurus.config.ts`:

```ts
colorMode: {
  // The brand is dark-native; light mode is not part of the design system.
  defaultMode: 'dark',
  disableSwitch: true,
  respectPrefersColorScheme: false,
},
```

Consequently, there is no light-mode variant of the logo or favicon, and
none should be produced casually — a light-mode mark would only make sense
alongside a deliberate light-mode design pass for the surface consuming it,
not as a standalone asset. `design/README.md`'s brand-system notes (colour
palette, type, icon construction) describe the dark-native palette this
mark is built against.

## Usage guidance

No formal brand-usage spec exists yet for Horonom (see "Open items"). Until
one does, apply these conservative defaults:

- **Do not stretch or distort** the mark. Scale proportionally only.
- **Do not recolor** the mark outside the documented palette (Graphite
  `#0F1115` / Ink `#F4F5F7`, Signal Cyan `#00B2FF`, Control Amber
  `#F5A623` — see `design/README.md`). It is built for the dark-native
  palette; do not place it on backgrounds outside that system.
- **Minimum clear space**: keep at least the mark's own height clear on
  all sides before any other content (text, edge, other graphic) begins.
  This is a sensible default, not a measured/approved spec — nothing more
  rigorous exists yet for Horonom specifically. Treat it as a floor, not a
  substitute for real usage documentation.
- **Minimum size**: don't render the mark so small that the wordmark or
  icon geometry stops being legible. No specific pixel/point floor has
  been measured or documented; use legibility as the practical test until
  one is.

## Relationship to Horo Run

Horonom is the parent corporate identity; **Horo Run** is a product-atlas
surface *by* Horonom, not a second corporate brand. This repository also
hosts the Horo Run Atlas build (`atlas/` — `atlas.css`, `tokens.mjs`,
`build.mts`, `destinations.mjs`, `render.mjs`), which is a separate visual
system from the corporate site under `src/`.

The governing decision is ADR-0002, **"shared DNA, not shared layout"**
(see the top-level [`README.md`](../../README.md#shared-design-system-horo-283)):
a product surface — Horo Run included — copies the *token values* from
`src/css/custom.css` (color, type), not this repo's component markup or its
corporate mark itself. Horo Run keeps its own visual metaphor and page
structure and must not be a recolored copy of the Horonom corporate logo —
that constraint is explicit in HORO-293's own "Brand Architecture
Constraint" (don't make Horo Run look like a second company logo).

## Legacy asset note

`horonom-mascot.png` was previously named `horonomy-mascot.png`. The mark's
own visual content already read "Horonom" before the rename — only the
filename (and the `docusaurus.config.ts` reference to it) still carried the
pre-rebrand spelling. Renamed and merged in
[official-website#78](https://github.com/horonomy/official-website/pull/78)
(HORO-293). No other legacy `horonomy-*` brand asset filenames are known to
remain in `static/img/` as of this audit.

## Open items (not resolved by this document)

These require actual design work and are explicitly **not** attempted
here — this pass is documentation only, not new asset production:

1. **No dedicated OG/social-preview asset.** `themeConfig.image` currently
   reuses `horonom-mascot.png` — a mascot illustration, not a purpose-made
   social card. Most sites use a distinct ~1200×630 card designed for the
   link-preview context (title/wordmark treatment, safe-crop margins for
   how platforms crop previews). Reusing/cropping the existing mascot image
   and relabeling it would not close this gap — it would still be the same
   asset. This needs a human/designer to produce a real social-preview
   image.
2. **No canonical *source-file* location for the mark itself.** This
   document covers where the production exports live and how to use them,
   but there is still no vector/editable master (e.g. Figma/Illustrator
   source, or even a checked-in `.svg` explicitly labeled as source-of-truth
   distinct from the web-optimized export) under `design/brand/`. HORO-293's
   own acceptance criteria call for "canonical Horonom corporate
   wordmark/logo source... in one documented location" — that is still
   open pending real design authoring.

# Brand — Horonom corporate identity

Usage guidance for the Horonom corporate mark as it is consumed by this
site (and, transitively, by anything that copies these assets or their
token values — see "Relationship to Horo Run" below).

## Canonical source

**`static/img/logo.svg` is the canonical, editable vector source for the
Horonom mark** (owner decision, HORO-293, 2026-09-01) — not a separate
Figma/Illustrator master. It is a clean, hand-authored SVG (four stroked
arc paths + three filled rects forming the "H"), directly editable as-is;
inventing a separate master source when this file already serves that
purpose would only create a second thing to keep in sync. `favicon.svg` is
a scaled/composited derivative of the same mark (see its own file for the
`translate`/`scale` transform), not an independent source.

The mark is also the GitHub organization's avatar
(`https://github.com/horonomy`, avatar asset id `296725033`) — visually
confirmed identical (same ring/arc/H construction, same palette) to
`static/img/logo.svg`, reconciling the two as the same canonical asset
rather than two independently-maintained marks.

## Where the assets live

The production-consumed corporate brand assets live in
[`static/img/`](../../static/img/), not under `design/`:

| File | Used for |
|---|---|
| [`static/img/logo.svg`](../../static/img/logo.svg) | **Canonical source.** Navbar logo (`docusaurus.config.ts` → `themeConfig.navbar.logo`) |
| [`static/img/favicon.svg`](../../static/img/favicon.svg) | Site favicon — scaled/composited derivative of `logo.svg` |
| [`static/img/og-image.png`](../../static/img/og-image.png) | OG/social-preview image (`docusaurus.config.ts` → `themeConfig.image`), 1200×630 |
| [`static/img/horonom-mascot.png`](../../static/img/horonom-mascot.png) | Hero illustration only — no longer used for OG (see "OG/social-preview asset" below) |

`logo.svg` and `favicon.svg` carry the real Horonom mark
(`aria-label="Horonom"`) — confirmed by audit (HORO-293, 2026-08-31).

## OG/social-preview asset

`static/img/og-image.png` (1200×630, PNG) is a purpose-made social card:
the H mark at left, "Horonom" wordmark at right, Graphite (`#0F1115`)
background, Ink (`#F4F5F7`) wordmark, Signal Cyan (`#00B2FF`) mark accent —
the same dark-native palette as the rest of the site, not a crop of the
mascot illustration.

**Reproducible generation**: [`og-image-source.html`](./og-image-source.html)
is the exact HTML/CSS/SVG source rendered to produce it — a static
1200×630 `<div>` with the mark inlined as SVG and the wordmark as styled
text, no build step or template engine involved. To regenerate: serve this
directory over local HTTP (`python3 -m http.server`, file:// is blocked by
most headless-browser tooling), open `og-image-source.html` at a
1200×630 viewport, and screenshot the page (exact viewport size, no
scaling/cropping needed — the page is already sized to the target
dimensions). No new build-time dependency was added to this repo for
this — `og-image.png` is a checked-in static asset, generated once, the
same way `horonom-mascot.png` already was.

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

## Status

Both items previously tracked here as open — a canonical source location
and a dedicated OG/social-preview asset — are resolved (HORO-293,
2026-09-01), per "Canonical source" and "OG/social-preview asset" above.
Remaining brand-usage gaps (a formal usage spec beyond the conservative
defaults above, GitHub/Atlassian avatar audit beyond the reconciliation
already noted) are tracked under HORO-294, not this document.

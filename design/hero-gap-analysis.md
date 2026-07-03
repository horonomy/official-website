# Hero design gap analysis & engineering handoff (HORO-12)

Comparison of the **current** homepage against the **target** immersive hero, with
each area mapped to its owning HORO ticket. Not published (lives under `design/`,
outside the Docusaurus `docs/` tree).

- **Current** — `src/pages/index.tsx` → `src/components/Hero/` (`index.tsx`, `sky.ts`,
  `styles.module.css`) + `src/components/Sections/`. A minimalist **vector** scene:
  a `<canvas>` star-field, an inline-**SVG** line-art observer (head tracks cursor,
  astrolabe dial spins), SVG dusk ridgelines, and 4 HTML constellation nodes with
  hover labels. Headline: *"Defining the boundaries of autonomy."*
- **Target** — `static/img/hero/homepage-target.webp` (approved mockup): a **photoreal
  raster** celestial-observatory — armored spider on a stone platform holding a gold
  astrolabe, dusk mountains, 4 named product constellations (AI Agent Assembly /
  ArcheWeave / Harbinger / More to Come), hourglass + book props, an annotation card,
  and a 4-card product row. Headline: *"We Build the Infrastructure of Intelligence."*

The current build is a **complete standalone vector prototype**, not a partial cut of
the target. It re-imagines the scene in SVG/canvas rather than compositing the produced
raster art — so most tickets are net-new implementation against existing assets, not
touch-ups.

## Gap matrix

| Area | Current state | Target | Gap | Status | Owner ticket |
|---|---|---|---|---|---|
| Asset layering | Hero uses **none** of the produced art — pure SVG/canvas. WebP layers (`observer`, `sky`, `environment`, `background`, `mascot-poses`) exist + documented z-order in the HORO-3 README. | Layered raster composite: `background → sky → environment → observer → props → constellations → HTML`. | Base layers exist but are unwired; per-part cutouts don't exist. | Ready (base) / Needs asset (parts) | HORO-3 |
| Hero component architecture | Single `Hero` component; ad-hoc `z-index: 0–4` in CSS; `BrowserOnly` + static SSR fallback. | Layered stack with shared z-index tokens driving all sub-layers. | No token system / layer scaffold; monolithic component. | Needs impl | HORO-2 |
| Product constellation UI | 4 generic nodes (1 "AI agent assembly" + 2 research + 1 future), hardcoded positions, labels on hover, golden measurement ray. | 4 **branded** constellations with drawn connecting-line figures + persistent labels; AI Agent Assembly lit gold with cursor. | Real names/copy, line-figure geometry, always-on labels missing. | Needs impl | HORO-4 |
| Ambient starfield / haze / shooting-stars / parallax | `sky.ts`: DPR-aware twinkling star-field **+ meteors**, reduced-motion aware. No haze, no parallax. | Same ambient sky **plus** atmospheric haze band and depth parallax on scroll/pointer. | Haze + parallax absent (starfield & shooting-stars done). | Scaffold | HORO-5 |
| Hourglass animation | Tiny inline-SVG hourglass with a single animated falling-sand dot (`hn-sand`). | Prominent glass hourglass prop with flowing sand. | Scale/fidelity + sand-stream animation; stays SVG per README. | Scaffold | HORO-6 |
| Observer (spider) fidelity / animation | Flat SVG line-art spider (mirrored group, 8 leg paths, H-mark abdomen, cursor-tracking head, spinning dial). | Photoreal armored observer (`observer.webp`) with a subtle idle. | Large fidelity gap — raster asset exists but unused; no idle motion. | Needs impl | HORO-7 |
| Wind / cloak / dust motion | None. | Wind-driven cloak sway + drifting dust/particles. | Entirely missing; per README uses `--wind` on SVG/CSS decor only (raster cloak stays one layer). | Needs impl | HORO-8 |
| CTA / product cards / annotation UI | 2 CTAs in hero (`Explore the constellations`, `Read the manifesto`); 2 product cards live **below the fold** in `Sections`; no annotation card. | In-hero: 2 CTAs (`Explore Products` / `Read the Docs`), 4-card product row, "Navigating the Intelligence Universe" annotation card. Headline copy differs. | 4 in-hero cards + annotation card + CTA/headline copy alignment missing. | Needs impl | HORO-9 |
| Responsive composition | Breakpoints at 996/640px hide observer, constellations, statusline. | Raster scene recomposed across breakpoints without losing the observer/props. | Current strategy is "hide"; raster layout needs true recomposition. | Scaffold | HORO-10 |
| Accessibility & reduced-motion | `prefers-reduced-motion` respected in `sky.ts` + head/dial loop; decorative art `aria-hidden`; constellations have `aria-label`. | Full reduced-motion coverage for every new animated layer + labelled interactive constellations. | Solid baseline; must extend to haze/parallax/wind/idle once built. | Ready (baseline) / Scaffold | HORO-11 |

## Reusable from the current prototype

- **`Hero/sky.ts`** — the DPR-aware canvas star-field + meteor engine (twinkle, colour
  temperature, seeded RNG, reduced-motion guard). Directly reusable as the HORO-5 sky layer.
- **Reduced-motion pattern** — `matchMedia('(prefers-reduced-motion: reduce)')` guards in
  both `sky.ts` and the head/dial RAF loop; the model to copy for HORO-11.
- **Constellation interaction** — hover-label + golden "measurement ray" CSS
  (`.constellation`, `.ray`, `hn-pulse`) transplants onto HORO-4's real constellations.
- **Hourglass SVG + `hn-sand` keyframe** — starting point for HORO-6.
- **Dusk ridgeline / gradient SVG** — usable as a lightweight environment fallback.
- **`BrowserOnly` + static SSR fallback** — keeps the interactive hero SSR-safe (HORO-2).
- **Copy** — section/principle/manifesto/product copy in `Sections/index.tsx` is written
  and reusable (hero headline + card copy need to be re-aligned to the target wording).

## Missing art / needs new asset

Per the HORO-3 README, the source PNGs are **composed**, so these are not derivable
without new art and block per-part animation:

- Decomposed spider parts (isolated foreleg / astrolabe / cloak cutouts) for HORO-7/HORO-8 rigging.
- Isolated hourglass frame cutout (HORO-6 currently works around this with SVG).
- Per-part cloak layer for HORO-8 wind sway.
- Separate haze plate for HORO-5.
- Book prop cutout (foreground prop).

Until dropped in (matching the README's filenames), HORO-7 animates `observer.webp` as one
layer, HORO-6 stays SVG, and HORO-8 applies `--wind` to decorative SVG/CSS only.

## Recommended build order

1. **HORO-2** — layer scaffold + z-index tokens (unblocks everything).
2. **HORO-3** — wire base raster layers (`background`/`sky`/`environment`/`observer`).
3. **HORO-7** — swap the SVG observer for `observer.webp` + idle.
4. **HORO-5** — port `sky.ts` as the ambient layer; add haze + parallax.
5. **HORO-4** — real branded constellations (line figures + labels).
6. **HORO-6 / HORO-9** — hourglass prop + in-hero cards/annotation/CTA copy.
7. **HORO-8** — wind/cloak/dust motion (needs per-part art or SVG-decor fallback).
8. **HORO-10 / HORO-11** — responsive recomposition + reduced-motion sweep across all new layers.

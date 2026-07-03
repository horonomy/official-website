# Hero scene — UI/UX elements (HORO-3)

Source art and web-optimized layers for the immersive homepage hero (Epic HORO-1).
High-resolution PNG **sources** live here; **web-delivery** WebP layers are exported
to `static/img/hero/` and are what the React components load.

## Layer inventory

| Web asset (`static/img/hero/`) | Source PNG | Role / layer | Transparent |
|---|---|---|---|
| `observer.webp` | `keeper_in_horo_world.png` | The First Horologer — hero spider observer (gold H-cloak, astrolabe) | ✅ |
| `mascot-poses.webp` | `Horonomy_mascot_design_v2.png` | 8 chibi observer states (compass, telescope, star-chart, book, wave, think, staff, sleep) — for lore / small-mascot / state cycling | ✅ |
| `sky.webp` / `sky-alt.webp` | `sky_1.png` / `sky_2.png` | Night-sky backdrop (stars, dusk gradient) | — |
| `environment.webp` / `environment-alt.webp` | `environment_1.png` / `environment_2.png` | Dusk mountains + stone platform environment | — |
| `background.webp` | `background_1.png` | Wide background plate | — |
| `homepage-target.webp` | `Horonomy_company_homepage_design_v1.png` | The approved composed mockup — reference only, not shipped in a layer | — |
| `animation-ref-1.webp` / `-2.webp` | `animation_1.png` / `animation_2.png` | Motion reference frames — reference only | — |

Brand logo sources (`Horonomy_logo_design_v1*.png`) and the v1 mascot sheet
(`Horonomy_mascot_design_v1.png`) are retained here for reference; the shipped brand
mark is the SVG in `static/img/logo.svg`.

## Optimization

PNG → WebP, quality 82, method 6, capped at 1600px wide. Total web payload for the
hero layers is ~1.5 MB (from ~17 MB of source), and only the layers a given view uses
are loaded. Re-export from the PNG sources here if the art changes.

## Layering model (z-order, back → front)

`background` → `sky` (+ ambient starfield/haze/shooting-stars, HORO-5) → `environment`
(mountains + platform) → `observer` (spider, HORO-7) → foreground props (hourglass
HORO-6, book) → constellation map (HORO-4, SVG overlay) → hero copy / CTAs / product
cards (HORO-9, HTML). Consumed by HORO-4–9; z-index tokens are owned by the hero
architecture (HORO-2).

## Not decomposed (handoff note)

The source art is **composed** (the whole spider in `observer.webp`; mountains +
platform together in `environment.webp`). Per-part cutouts the animation tickets could
use — separate cloak / astrolabe / foreleg, an isolated hourglass frame, a separate
haze plate — are **not** derivable from these PNGs without new art. Until then:

- **HORO-7** animates `observer.webp` as one layer (subtle transform/idle) and/or
  cycles `mascot-poses.webp` states, rather than per-part rigging.
- **HORO-6** draws the hourglass as **SVG** (frame + sand mask), not a raster cutout.
- **HORO-8** applies `--wind` to SVG/CSS decorative elements; the raster cloak stays a
  single layer.

New per-part art dropped here (matching these names) swaps in without React changes.

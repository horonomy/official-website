# Design

Versioned design contracts and reference material for the Horonom website.
Production lives under `src/` and the separate static `atlas/` build.

## Current contract

Start with the [Visual Design Constitution v1](VISUAL_DESIGN_CONSTITUTION.md)
(HORO-872). It governs the MVP reference slices and records the boundary between
marketing, operational work and Pets Lives Here. Existing screenshots, canvases
and gap analyses are historical evidence, not competing current specifications.

- [Motion Constitution v1](MOTION_CONSTITUTION.md) — causes, timings, interruption,
  semantic attention and per-class fallbacks.
- [Reduced Motion and Accessibility Contract v1](ACCESSIBILITY_CONTRACT.md) —
  contrast, operability and rendered evidence requirements.
- [Token source contract](design-token-contract.json) and [JSON Schema](design-token-contract.schema.json)
  — machine-readable roles pointing to existing CSS values, without duplicating them.
- [AI frontend checklist](AI_FRONTEND_CHECKLIST.md) — required implementation and
  verification handoff for agents and humans.

```
design/
└── v1/
    ├── brand/
    │   ├── horonomy-logo-system.png        ← logo lockups, dark/mono, palette, type
    │   ├── horonomy-logo-construction.png  ← icon geometry + wordmark construction spec
    │   └── horonomy-mascot-sheet.png       ← the First Horologer mascot (12 poses)
    ├── homepage-directions/
    │   ├── Horonomy-Homepage-Directions.dc.html  ← Claude Design canvas (7 directions)
    │   └── support.js                             ← canvas runtime (open the .dc.html in a browser)
    └── screenshots/
        └── aaasm-4024/                      ← implementation verification screenshots
```

## Brand system

- **Colours**: role and use rules are in the constitution; values are owned by
  [`src/css/custom.css`](../src/css/custom.css). Historical palette swatches are
  not a contrast approval.
- **Type**: Space Grotesk + IBM Plex Mono (geometric / engineered clarity).
- **Icon** (threshold logic): a 360° boundary ring with a 32° permitted
  aperture, a 96° active boundary arc (cyan), and a 12° review checkpoint; the
  `H` carries a raised crossbar. See [the canonical brand source](brand/README.md).
- **Mascot**: the First Horologer — an ancient observer that measures and
  records the sky before a system is trusted to act.

## Content governance

- [`product-narrative-hierarchy.md`](product-narrative-hierarchy.md) — what the
  company site owns versus what a product owns, the approved company-level
  product summary format, the cross-site handoff, and the three maturity axes
  (AAASM-5615). Read it before writing or editing any copy about a portfolio
  product.

## Homepage

The homepage implements direction **3a — "The First Horologer"** from
`v1/homepage-directions/`, joined to the **1a** content architecture (Hero → Lore →
Philosophy → Products → Manifesto). The canvas runtime format was translated into
production React/TypeScript under `src/components/HeroUniverse/`. The older
`src/components/Hero/` prototype is not the active homepage.

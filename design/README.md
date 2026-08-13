# Design

Versioned design source of truth for the Horonomy website. Reference material —
not production code. Production lives under `src/`.

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

- **Colours**: Graphite `#0F1115`, Mist Gray `#6B7280`, Air Gray `#E5E7EB`,
  Signal Cyan `#00B2FF` (active threshold only), Control Amber `#F5A623`
  (review / checkpoint).
- **Type**: Space Grotesk + IBM Plex Mono (geometric / engineered clarity).
- **Icon** (threshold logic): a 360° boundary ring with a 32° permitted
  aperture, a 96° active boundary arc (cyan), and a 12° review checkpoint; the
  `H` carries a raised crossbar. See `brand/horonomy-logo-construction.png`.
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
`homepage-directions/`, joined to the **1a** content architecture (Hero → Lore →
Philosophy → Products → Manifesto). The canvas runtime format was translated into
production React/TypeScript under `src/`.

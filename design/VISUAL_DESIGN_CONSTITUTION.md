# Visual Design Constitution v1

**Owner:** `horonomy/official-website/design/` · **Delivery:** HORO-872 / HORO-870.
This is the implementation contract for the Visual Experience MVP 1.0 reference
slices, not evidence that today's rendered surfaces already conform. Its direction
is **Celestial Instrument × Quiet Magic × Precision Engineering**: a readable
instrument in a celestial setting, with meaningful, restrained signs of life.

Read with the [Motion Constitution](MOTION_CONSTITUTION.md) and
[Reduced Motion and Accessibility Contract](ACCESSIBILITY_CONTRACT.md).

## Authority and scope

Company governance and product-owned truth remain authoritative. This contract
owns presentation; it grants no new capability, maturity, security, analytics,
framework, engine, paid-service or rollout decision. Read the
[product narrative hierarchy](product-narrative-hierarchy.md) and
[truth adoption record](../TRUTH-ADOPTION.md) before changing product copy.
Registry-derived destinations, availability and each surface's existing maturity
vocabulary survive any visual treatment. A constellation is never evidence of a
capability or a functioning destination.

| Surface | Apply | Preserve its owner |
| --- | --- | --- |
| Living Observatory / company site | Celestial composition, typography, restrained materials and semantic attention | [Brand source](brand/README.md), active [HeroUniverse](../src/components/HeroUniverse/index.tsx) and company narrative |
| Celestial Atlas | Same token language; fast product scanning and accessible navigation | [Atlas renderer](../atlas/render.mjs), [destination resolver](../atlas/destinations.mjs) and [product registry](../src/data/productRegistry.ts); its own layout and maturity vocabulary |
| Observatory Console / selected operational workflow | Dense, opaque, efficient presentation; task hierarchy below | Product-owned [North Star](https://github.com/horonomy/eridanus/blob/main/docs/product/NORTH_STAR.md) and [UX specification](https://github.com/horonomy/eridanus/blob/main/docs/design/investigator_ux_spec.md) |
| Pets Lives Here | Generic accessibility, causal feedback and interruption quality only | Separate **Warm Life × Tactile World × Expressive Personality** identity; product-owned [North Star](https://github.com/horonomy/pet-life-simulator/blob/main/docs/product/NORTH_STAR.md), [Art Direction](https://github.com/horonomy/pet-life-simulator/blob/main/docs/art/ART_DIRECTION.md) and [Animation Bible](https://github.com/horonomy/pet-life-simulator/blob/main/docs/art/ANIMATION_BIBLE.md) |

Product references may require authorized repository access. Do not copy their
private implementation details, examples, screenshots or evidence into this public
repository. Their semantic rules are consumed in their owning repositories.
Pets does not inherit dark graphite, celestial glyphs, astral glass, web fonts,
the Horologer, web motion timings or a browser rendering technology.

## Repeatable visual grammar

The values below are v1 implementation defaults, subject to measured QA. Existing
CSS values live in [custom.css](../src/css/custom.css); use its named tokens before
adding one. The brand mark remains [the canonical SVG](../static/img/logo.svg).

| Concern | Marketing / Atlas | Operational |
| --- | --- | --- |
| Typography | Space Grotesk display/body; IBM Plex Mono for identifiers and short metadata. Hero 48–64px desktop, 32–40px phone, line-height 1.1–1.2; section heading 28–36px; body 16–18px / 1.5 | Body 14–16px / 1.5; page title 24–32px / 1.2; section 18–20px; data 13–14px / 1.5, tabular numerals. Mono for code/IDs, never entire prose panels |
| Reading hierarchy | One headline, one short explanation, one primary action; artwork frames that group | Task/title → current result and its qualifications → relevant comparison/evidence → contextual actions → secondary metadata. Preserve domain-required prominence |
| Grid | `--hn-shell-max` 1280px; 12-column desktop alignment, 24px gaps; content groups align to shared edges. Atlas retains a scannable list/grid beside any celestial map | Fluid workspace; 24px outer inset desktop, 16px phone; main comparison area plus 320–400px inspector when space permits. No 1280px cap forcing wide tables into narrow cards |
| Spacing | Existing 4/8/12/16/24/32/48/64px scale. 48–64px between sections; 24px panel padding, 16px phone | Same scale, 16–24px between sections, 12–16px panels, 8–12px cell padding. Density comes from alignment and less repetition, not unreadably small text |
| Geometry | 10px controls, 14px cards, pills only for short status/category labels. Thin instrument lines and purposeful arcs | 10px outer controls, 14px containing panels; table rows stay flat. No card inside every cell; no pill around every value |
| Color | Graphite/deep backgrounds; ink headings, text body, muted metadata. Gold guides celestial orientation. Cyan marks focus/active interaction; amber marks review/checkpoint | Same neutral scaffolding where adopted. Product-owned status/meaning encodings take precedence over decorative accent roles; retain text and shape cues |
| Material | Solid base, selective astral glass around scene chrome, one subtle edge highlight | Opaque panel backgrounds for data, code, forms, navigation work areas and inspectors; zero backdrop blur behind task content |
| Lighting / depth | One coherent scene light direction; grounded contact shadows; at most one highlighted focal group. Shadows use existing sm/md/lg levels | Borders and spacing establish grouping. Shadow only for an overlapping menu/inspector; no moving light, glow or perspective under data |

Use no more than three text sizes within a compact card. Labels conveying meaning
must be at least 12px; keep inputs at least 16px on touch screens. Body text is
sentence case. Uppercase mono is for short labels only, with tracking ≤0.1em.
Line length for prose is 45–75 characters; identifiers remain selectable and fully
inspectable through wrapping or an explicit detail view. Truncation alone fails.

## Astral glass and contrast

Glass is a framing material, not a readability strategy. Text sits on a protected
backing layer whose worst-case rendered contrast passes the accessibility contract.
Blur, shadow, glow and a favorable screenshot do not establish contrast. If any
background state fails, strengthen the backing or use opaque `--hn-panel`.
Do not lower text opacity to make a panel feel atmospheric. `--hn-faint`, decorative
line tokens and existing glass tokens are not pre-certified for meaningful text or
control boundaries. Nested glass, text refracted/distorted by effects, and animated
blur are prohibited. The no-blur fallback must remain visually complete.

## Interaction grammar

- Use links for real navigation and buttons for actions. Keep product names,
  meaningful labels and availability legible without hover. Unavailable entries
  have no fake anchor, pointer cursor, press response or destination animation.
- A constellation highlights one semantic target on hover **or keyboard focus**;
  selection, focus and product availability remain distinguishable. A starfield is
  decorative, has no tab stops and does not manufacture clickable stars.
- A map may supplement the registry list. It may not replace the list's scan order,
  direct links, skip link, or ability to work without animation/JavaScript.
- Operational navigation preserves location and active section. Tables keep real
  headers, aligned numeric columns, explicit sort state and inspectable values.
  Filters show active criteria and a clear reset; updates preserve focus and explain
  changed results. An inspector retains list context and restores the invoking
  control on close. Loading, empty, unavailable, error and completed states remain
  distinct and reuse the product's exact semantic rules; decoration never infers
  success, certainty or progress from an unfinished request.

## Mobile is a new composition

Recompose at the existing 996px / 560px breakpoints; Atlas's existing 720px grid
collapse remains a documented content-fit exception. Do not scale a desktop canvas
down until its text fits. Use a single-column headline/action group before extended
scenery; on 390×844 the headline and primary action must be visible without scrolling
after transient overlays are dismissed. Retain a legible, deliberately placed
Horologer rather than a tiny desktop crop. Simplify stars/props and remove parallax.
Use inline product labels and direct tap links; do not make the first tap merely
simulate hover. Touch navigation is never delayed for a character reaction.

For the selected operational narrow-screen slice, stack title and actions, prioritize
the summary and essential comparison fields, and open the inspector as a full-width
sheet. Keep wide tables/graphs in labeled local scroll regions with visible affordance
and access to all values; never hide columns without an equivalent detail path.
This does not extend the product's compatibility promise to every route. Product
owners reconcile their existing responsive scope in the implementation ticket.

## Complexity budgets and decisions

These are acceptance ceilings, not measured claims about the baseline. Count only
resources loaded by the tested route, and report total route cost as well as added
design cost. Shared ambient layers count even when implemented with CSS.

| Budget | Marketing / Atlas | Operational |
| --- | --- | --- |
| Concurrent decorative motion | At most 2 ambient groups plus 1 attention transition desktop; 1 ambient group plus 1 attention transition phone; Atlas at most 1 ambient group | 0 ambient groups; at most 1 transient feedback group per active task |
| Backdrop-filter surfaces visible together | At most 2, ≤16px blur, no nesting; phone at most 1 | 0 behind task content |
| Added animation JavaScript, compressed transfer | ≤30KiB per route; Atlas ≤10KiB; defer optional code | ≤10KiB per route; no new animation runtime by default |
| Decorative image transfer | ≤1.5MiB desktop / ≤750KiB phone; select responsive assets before download | 0 for work areas; product-required diagrams measured separately |
| Animation frame work (scripting + render work attributable to effects), p95 over 30s | ≤4ms desktop / ≤6ms representative phone | ≤2ms during interaction; 0 scheduled decorative work at rest |
| Hidden/offscreen | Stop timers, RAF and continuous CSS animation; retain static state | Same; no unnecessary task feedback loops |

Collect three repeatable cold-load and 30-second interaction traces with browser,
viewport, device, connection/throttle and source commit recorded. New effects must
cause no >50ms long task, no layout shift, and no increase in median LCP or measured
interaction latency above 10% against the same-device baseline. Report absolute
values too; a slow baseline does not certify a fast result. If a ceiling fails,
remove ambient work, then blur, then optional imagery before adding technology.
HORO-874 owns the reusable harness; this document does not claim it already exists.

Founders review changes to the identity/metaphor, product North Star, semantic
hierarchy or material policy. Implementers may tune routine token values, sizes and
timings within these rules using before/after visual and accessibility evidence;
they do not need founder approval for each number. Record a contract-version change
when a rule changes, and never silently waive a gate in a page-specific component.

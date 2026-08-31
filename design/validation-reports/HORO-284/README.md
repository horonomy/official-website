# HORO-284 validation — PRs 2, 3, 6

Real-browser verification against production `https://horonom.com`, captured
2026-08-31 after PR 2/6 (#72), PR 3/6 (#74) and PR 6/6 nav/footer (#75) were
merged and deployed.

## What was checked

- **System Map renders the Product Registry, not the old hardcoded list.**
  Accessibility-tree snapshot confirms 4 cards: AI Agent Assembly (Beta),
  Octans, Circinus, Ophiuchus (all Experimental), each with the correct
  `learn more at <host>` accessible name and the correct live href
  (`agent-assembly.com`, `octans.horo.run`, `circinus.horo.run`,
  `ophiuchus.horo.run`).
- **Sky map filtered correctly** — the "Product constellations" group
  contains only `ai-agent-assembly` (the one registry entry with plotted
  geometry), not the old ArcheWeave/Harbinger/Pleiades placeholders.
- **"How the systems relate" band renders**, with each row's body text
  matching `productRegistry.ts`'s `relationship` field verbatim.
- **`horo.run` is now linked from both navbar and footer** ("Atlas ↗"),
  confirmed present in the live accessibility tree with the correct href and
  an "(opens in new tab)" accessible affordance.
- **Keyboard navigation**: after dismissing the cookie-consent banner
  (itself keyboard-reachable — the first Tab lands on its Reject button, a
  reasonable focus-trap-until-dismissed pattern), Tab order is Skip-link →
  Home → Products → **Atlas** → Observatory → Manifesto → Blog → GitHub,
  matching visual/DOM order. Verified via `document.activeElement`, not
  inference. See `03-nav-atlas-keyboard-focus-desktop-1440.png` for the
  visible focus ring on "Atlas ↗".
- **GA4 runtime collection** (HORO-281 AC, verified here since it required
  the same live-browser tooling): a real `page_view` hit fired to
  `https://www.google-analytics.com/g/collect` with `tid=G-2TEHW99C9B` (the
  new `official-website` stream) and returned `204`. Confirms production
  actually emits collection traffic for the correct measurement ID, not just
  that the ID string is present in source.
- **Responsive**: full-page screenshots at 1440 (desktop) and 375 (mobile)
  widths — no overflow, System Map grid collapses to the existing
  2-column/1-column breakpoints (unchanged CSS, reused from the prior
  ProductCards implementation).

## Screenshots

- `01-homepage-desktop-1440-full.png`
- `02-homepage-mobile-375-full.png`
- `03-nav-atlas-keyboard-focus-desktop-1440.png`

## Known gaps (not covered by this pass)

- **Reduced-motion** was verified statically (the `@media
  (prefers-reduced-motion: reduce)` blocks carried over unchanged from the
  pre-HORO-284 CSS this reuses) rather than with an emulated
  `prefers-reduced-motion` browser session — the tool available this session
  (Playwright MCP) does not expose that emulation flag; a fuller pass with a
  tool that does would strengthen this evidence.
- **Full axe-core / automated a11y audit** was not run — this is a manual
  accessibility-tree + keyboard-order spot check, not an automated WCAG
  scan. No automated a11y tooling is wired into this repo's CI today; adding
  one is a separate improvement, not bundled into HORO-284.
- One unrelated console error was observed
  (`https://horonom.com/cdn-cgi/scripts/.../email-decode.min.js`) — a
  Cloudflare-injected script (email obfuscation), not something this
  repository ships or can fix directly.

// Pure HTML renderer for the Product Atlas (HORO-285). Zero client-side
// JavaScript by design for the page's core content — a card list does not
// need a framework, and zero JS makes the keyboard/reduced-motion/mobile
// AC nearly free. HORO-595 adds one small, deliberate exception: the
// analytics/consent scripts from analytics.mjs, which need real DOM event
// listeners for consent choice and card-click measurement — see that
// module's own header for why a tiny vanilla script here doesn't reopen
// the "no framework" decision.
//
// Every href in the output goes through resolveDestination — nothing is
// hand-added — so a pending product renders with NO anchor at all (not a
// disabled link, not a bare <a> without href): there is nothing focusable
// that does nothing, and consequently nothing a click handler could ever
// fire `product_card_click` for.
//
// Copy is deliberately plain and matches scripts/claim-gate-config.json's
// banned-absolutes list (no "complete", "comprehensive", "universal",
// "every action", etc.) and the maturity vocabulary the claim gate expects
// elsewhere on the corporate site — see the maturity-pill note below for
// why this page does NOT reuse that corporate pill markup.

import {destinationTypeFor, renderAnalyticsHead, renderConsentBanner, renderInteractionScript} from './analytics.mjs';

/** @param {string} s */
export function esc(s) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * @param {import('../src/data/productRegistry.js').ProductEntry[]} entries
 * @param {(entry: {canonicalUrl: string}) => {state: 'live'|'pending', href: string|null}} resolve
 * @returns {string}
 */
export function renderPage(entries, resolve) {
  const sorted = [...entries].sort((a, b) => a.order - b.order);

  const cards = sorted
    .map((entry) => {
      const dest = resolve(entry);
      const name = esc(entry.name);
      const category = esc(entry.category);
      const problem = esc(entry.problem);
      const celestial = esc(entry.celestialIdentity);

      // The Atlas's own maturity pill, NOT the corporate site's
      // `title="Portfolio stage…"` pill markup: the two maturity axes are
      // genuinely different vocabularies (HORO-282's ProductMaturity —
      // experimental/beta/release_candidate/available — vs. the corporate
      // company-metadata lifecycle — available/beta/release_candidate/
      // coming_soon), and the same product can legitimately carry a
      // different label in each (Agent Assembly is `beta` here). Reusing
      // the corporate pill's `title` attribute would make
      // scripts/check-product-claims.mjs validate this page's labels
      // against the WRONG vocabulary and redden CI on a later edit.
      const maturityLabel = esc(entry.maturity.replace('_', ' '));

      // HORO-595: only a live card has a real destination to measure — a
      // pending card (Eridanus) has no anchor at all (above), so it can
      // never emit product_card_click; there is nothing to click.
      const entryPoint =
        dest.state === 'live'
          ? (() => {
              const href = /** @type {string} */ (dest.href);
              const slug = esc(entry.slug ?? entry.id);
              const status = esc(entry.maturity);
              const destinationType = esc(destinationTypeFor(href));
              return `<a class="hn-atlas-card__link" href="${esc(href)}" data-ga-event="product_card_click" data-product-slug="${slug}" data-product-status="${status}" data-destination-type="${destinationType}">Visit ${name}<span aria-hidden="true"> →</span></a>`;
            })()
          : `<span class="hn-atlas-card__pending">Not yet available.</span>`;

      return `      <li class="hn-atlas-card">
        <p class="hn-atlas-card__eyebrow">${category} · <span class="hn-atlas-card__celestial">${celestial}</span></p>
        <h2 class="hn-atlas-card__name">${name}</h2>
        <p class="hn-atlas-card__problem">${problem}</p>
        <p class="hn-atlas-card__maturity">Status: ${maturityLabel}</p>
        ${entryPoint}
      </li>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Product Atlas — Horonom</title>
  <meta name="description" content="The Horonom product family: what each product does and where to find it." />
  <link rel="stylesheet" href="./atlas.css" />
${renderAnalyticsHead()}
</head>
<body>
  <a class="hn-atlas-skip" href="#hn-atlas-main">Skip to product list</a>
  <header class="hn-atlas-header">
    <p class="hn-atlas-header__kicker">Systems by Horonom</p>
    <h1 class="hn-atlas-header__title">Horonom Product Atlas</h1>
    <p class="hn-atlas-header__framing">The Horonom product family — what each product does, and where it lives.</p>
    <a class="hn-atlas-header__back" href="https://horonom.com" data-ga-event="company_home_click" data-destination-type="marketing">← Horonom</a>
  </header>
  <main id="hn-atlas-main">
    <ul class="hn-atlas-grid">
${cards}
    </ul>
  </main>
${renderConsentBanner()}
${renderInteractionScript()}
</body>
</html>
`;
}

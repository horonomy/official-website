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
import {resolveDocsDestination} from './destinations.mjs';

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
 * Render a quiet, non-interactive figure for the card's registry position.
 * The list and its links remain the information architecture; this SVG only
 * gives each registry entry a repeatable celestial mark behind that content.
 * @param {number} order
 */
export function renderConstellation(order) {
  const patterns = [
    'M10 38 L29 16 L51 31 L76 10',
    'M9 17 L31 38 L55 12 L78 34',
    'M10 31 L27 11 L49 39 L72 20',
  ];
  const points = [
    [[10, 38], [29, 16], [51, 31], [76, 10]],
    [[9, 17], [31, 38], [55, 12], [78, 34]],
    [[10, 31], [27, 11], [49, 39], [72, 20]],
  ][Math.abs(order) % 3];
  const line = patterns[Math.abs(order) % 3];
  const stars = points.map(([cx, cy], index) =>
    `<circle cx="${cx}" cy="${cy}" r="${index === 0 ? 2.5 : 2}" />`,
  ).join('');
  return `<svg class="hn-atlas-card__constellation" viewBox="0 0 88 48" aria-hidden="true" focusable="false"><path d="${line}" />${stars}</svg>`;
}

/**
 * @param {import('../src/data/productRegistry.js').ProductEntry[]} entries
 * @param {(entry: {canonicalUrl: string}) => {state: 'live'|'pending', href: string|null}} resolve
 * @returns {string}
 */
export function renderPage(entries, resolve) {
  const sorted = [...entries].sort((a, b) => a.order - b.order);
  // Editorial entry paths, never a dependency graph or a filter. Names and
  // destinations remain owned by the same records that render the full list.
  const taskGroups = [
    {label: 'Operate with boundaries', ids: ['ai-agent-assembly', 'circinus']},
    {label: 'Carry context', ids: ['ophiuchus']},
    {label: 'Check change and evidence', ids: ['octans', 'fornax', 'horologium', 'eridanus']},
  ].map(({label, ids}) => {
    const products = ids.flatMap(id => {
      const entry = sorted.find(product => product.id === id);
      return entry ? [entry] : [];
    });
    if (!products.length) return '';
    const links = products.map(entry => `<a href="#product-${esc(entry.id)}">${esc(entry.name)}</a>`).join('');
    return `<div class="hn-atlas-tasks__group"><h2>${label}</h2><div class="hn-atlas-tasks__links">${links}</div></div>`;
  }).join('');

  const cards = sorted
    .map((entry) => {
      const dest = resolve(entry);
      const name = esc(entry.name);
      const category = esc(entry.category);
      const problem = esc(entry.problem);
      const celestial = esc(entry.celestialIdentity);
      const docsHref = dest.state === 'live' ? resolveDocsDestination(entry) : null;

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
              const label = entry.id === 'octans' ? 'Visit in-development overview' : `Visit ${name}`;
              return `<a class="hn-atlas-card__link" href="${esc(href)}" data-ga-event="product_card_click" data-product-slug="${slug}" data-product-status="${status}" data-destination-type="${destinationType}">${label}<span aria-hidden="true"> →</span></a>`;
            })()
          : `<span class="hn-atlas-card__pending">Not yet available.</span>`;

      const constellation = renderConstellation(entry.order);
      const access = entry.publicAccess ? `<p class="hn-atlas-card__access">Public access: ${esc(entry.publicAccess)}</p>` : '';
      const docs = docsHref ? `<a class="hn-atlas-card__docs" href="${esc(docsHref)}" aria-label="${name} documentation">Docs<span aria-hidden="true"> ↗</span></a>` : '';

      return `      <li id="product-${esc(entry.id)}" class="hn-atlas-card" tabindex="-1" data-celestial-identity="${celestial}" data-atlas-state="idle">
        ${constellation}
        <p class="hn-atlas-card__eyebrow">${category} · <span class="hn-atlas-card__celestial">${celestial}</span></p>
        <h2 class="hn-atlas-card__name">${name}</h2>
        <p class="hn-atlas-card__problem">${problem}</p>
        <p class="hn-atlas-card__maturity">Atlas maturity: ${maturityLabel}</p>
        ${access}
        <div class="hn-atlas-card__actions">${entryPoint}${docs}</div>
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
    <section class="hn-atlas-discovery" aria-label="Find a product by task">
      <p class="hn-atlas-discovery__intro">Start with your task, or browse the full product family below.</p>
      <div class="hn-atlas-tasks">${taskGroups}</div>
      <p class="hn-atlas-legend">These are discovery groups, not a required product stack. Atlas maturity describes development stage, not public access or an SDK version. Visit opens the current public entry; Docs opens published documentation where available.</p>
    </section>
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

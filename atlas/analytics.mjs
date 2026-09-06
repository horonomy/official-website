// Product Atlas analytics (HORO-595) — the Horonom COMPANY GA4 property,
// never a product-specific one. This page (horo.run root) is a company-
// owned cross-product discovery surface per ADR-0008 (horonomy/internal-docs),
// not any one product's marketing site, so it gets its own Measurement ID
// distinct from every incubating product's marketing/docs stream.
//
// Consent posture: Consent Mode v2, default-denied — the same posture
// ADR-0006 §6 requires of every Horonom public surface. `gtag('consent',
// 'default', ...)` runs before gtag.js loads, so no storage/measurement
// happens until a visitor explicitly accepts via the banner below (or has
// already accepted in a prior visit, read back from localStorage).
//
// Zero-framework, matching the rest of this page (see render.mjs's header
// comment) — one small vanilla <script>, not a bundler-built analytics SDK.

/** The Horonom company property's Measurement ID for the Product Atlas
 * (founder-provided ground truth, HORO-595). NEVER a product-specific ID —
 * see metadata/company-analytics-registry.yaml in horonomy/.github for the
 * full property/stream record and the explicit forbidden-ID list. */
export const ATLAS_MEASUREMENT_ID = 'G-J14S6YWLNL';

const CONSENT_STORAGE_KEY = 'horonom_atlas_consent';

/**
 * Classify a destination URL for the low-cardinality `destination_type`
 * event parameter. Structural only — never sends the URL itself as an
 * event parameter, only this closed-vocabulary classification.
 *
 * @param {string} url
 * @returns {'marketing' | 'docs' | 'runtime'}
 */
export function destinationTypeFor(url) {
  let host;
  try {
    host = new URL(url).host;
  } catch {
    return 'marketing';
  }
  // Real executable/runtime boundary prefixes per ADR-0006 §2 — app./api./
  // ingest.<product>.horo.run. None of the Atlas's current live
  // destinations use one, but a future product might.
  if (/^(app|api|ingest)\./.test(host)) {
    return 'runtime';
  }
  if (host.startsWith('docs.')) {
    return 'docs';
  }
  // Every other live destination today (agent-assembly.com,
  // octans.horo.run, and every <product>.horonom.com marketing host) is a
  // marketing/landing surface.
  return 'marketing';
}

/**
 * The `<head>` analytics bootstrap: Consent Mode v2 default-denied init,
 * followed by the gtag.js loader and config call. GA4's own automatic
 * `page_view` on `config` is sufficient here — this is a single static
 * page with no client-side routing, so there is no SPA history-tracking
 * leak class to guard against (unlike the per-product docs/marketing
 * split in ADR-0007 §5) and no reason to suppress it and dispatch
 * manually.
 *
 * @returns {string}
 */
export function renderAnalyticsHead() {
  return `  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    // Consent Mode v2 — default denied until the visitor explicitly
    // accepts (see the banner below). Set before gtag.js loads so no
    // measurement/storage happens ahead of consent.
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    });
    try {
      if (localStorage.getItem('${CONSENT_STORAGE_KEY}') === 'granted') {
        gtag('consent', 'update', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          analytics_storage: 'granted',
        });
      }
    } catch (e) { /* localStorage unavailable — stay default-denied */ }
    gtag('js', new Date());
    gtag('config', '${ATLAS_MEASUREMENT_ID}', {anonymize_ip: true});
  </script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=${ATLAS_MEASUREMENT_ID}"></script>`;
}

/**
 * The consent banner markup, shown only when no prior choice is recorded.
 * Accept grants `analytics_storage` (ad storage/personalization stay
 * denied — this page runs no advertising); decline records the choice and
 * hides the banner without granting anything. Both choices persist via
 * localStorage so the banner does not reappear every visit.
 *
 * @returns {string}
 */
export function renderConsentBanner() {
  return `  <div id="hn-atlas-consent" class="hn-atlas-consent" role="region" aria-label="Cookie consent" hidden>
    <p class="hn-atlas-consent__text">This page uses privacy-safe analytics to understand product discovery. No personal data is collected.</p>
    <div class="hn-atlas-consent__actions">
      <button type="button" class="hn-atlas-consent__accept" data-consent-action="accept">Accept</button>
      <button type="button" class="hn-atlas-consent__decline" data-consent-action="decline">Decline</button>
    </div>
  </div>`;
}

/**
 * The interaction script: shows the consent banner on first visit, wires
 * accept/decline, and delegates `click` on any `[data-ga-event]` element
 * to a `gtag('event', ...)` call carrying only the closed-vocabulary
 * `data-*` attributes already rendered by render.mjs — never the link
 * text, URL, or any other page content.
 *
 * @returns {string}
 */
export function renderInteractionScript() {
  return `  <script>
    (function () {
      var KEY = '${CONSENT_STORAGE_KEY}';
      var banner = document.getElementById('hn-atlas-consent');
      var choice;
      try { choice = localStorage.getItem(KEY); } catch (e) { choice = null; }
      if (!choice && banner) {
        banner.hidden = false;
      }
      if (banner) {
        banner.addEventListener('click', function (e) {
          var btn = e.target.closest('[data-consent-action]');
          if (!btn) return;
          var action = btn.getAttribute('data-consent-action');
          try { localStorage.setItem(KEY, action === 'accept' ? 'granted' : 'denied'); } catch (e2) {}
          if (action === 'accept' && typeof gtag === 'function') {
            gtag('consent', 'update', {
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              analytics_storage: 'granted',
            });
          }
          banner.hidden = true;
        });
      }

      document.addEventListener('click', function (e) {
        var el = e.target.closest('[data-ga-event]');
        if (!el || typeof gtag !== 'function') return;
        var params = {surface: 'product_atlas'};
        if (el.dataset.productSlug) params.product_slug = el.dataset.productSlug;
        if (el.dataset.productStatus) params.product_status = el.dataset.productStatus;
        if (el.dataset.destinationType) params.destination_type = el.dataset.destinationType;
        gtag('event', el.dataset.gaEvent, params);
      });
    })();
  </script>`;
}

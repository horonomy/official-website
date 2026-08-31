/**
 * Consent-Mode v2 default-denied bootstrap for Google Analytics (HORO-37).
 *
 * This string is injected verbatim as the `innerHTML` of the FIRST analytics
 * <script> in `docusaurus.config.ts`'s `headTags`, ahead of the gtag.js loader
 * and the `gtag('config', ...)` hit. Running it first is what makes the site
 * GDPR-compliant: analytics/ads storage is denied by default, so gtag writes
 * no cookie until the visitor opts in via the banner.
 *
 * Order of operations in the snippet (all before the first GA hit):
 *   1. init `window.dataLayer` and the `gtag` shim
 *   2. `gtag('consent','default', {... 'denied'})` for analytics + ads storage
 *   3. re-apply a previously stored opt-in (`localStorage['horonomy-analytics-consent']
 *      === 'granted'`) via `gtag('consent','update', ...)`
 *
 * We deliberately do NOT use preset-classic's `gtag` option here: Docusaurus
 * appends `config.headTags` AFTER plugin-injected head tags, so a separate
 * head entry could not be guaranteed to precede the preset's `gtag('config')`
 * hit. By owning the whole init we get a deterministic deny-before-hit order.
 * The gtag.js loader and `gtag('config')` call live in the SECOND head script.
 *
 * This mirrors the pattern already shipped on node-sdk/python-sdk/go-sdk/core
 * docs (AAASM-3552/3554) — see node-sdk/website/src/analytics/consentInit.ts.
 */

/**
 * GA4 Measurement ID (public, not a secret).
 *
 * HORO-281: cut over to the dedicated `official-website` stream for
 * horonom.com (owner-confirmed 2026-08-31). The prior stream,
 * G-10ZX4FT2T4 (horonomy.dev), is NOT deleted — it remains as historical
 * analytics data for the legacy domain, per the owner's explicit retention
 * instruction. Event taxonomy/names/semantics (see trackEvent.ts) are
 * unchanged — only the destination stream moves.
 */
export const GA_MEASUREMENT_ID = 'G-2TEHW99C9B';

/** localStorage key shared with the consent banner client module. */
export const CONSENT_STORAGE_KEY = 'horonomy-analytics-consent';

/**
 * Consent-Mode default: deny analytics + advertising storage before any hit,
 * then restore a stored opt-in. Runs synchronously in <head>.
 */
export const consentDefaultScript = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  'analytics_storage': 'denied',
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied'
});
try {
  if (window.localStorage.getItem('${CONSENT_STORAGE_KEY}') === 'granted') {
    gtag('consent', 'update', { 'analytics_storage': 'granted' });
  }
} catch (e) {}
`;

/**
 * gtag.js loader bootstrap. Runs AFTER {@link consentDefaultScript}, so the
 * default-denied consent state is already in `dataLayer` before `config`
 * fires the first hit.
 */
export const gtagConfigScript = `
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}', { 'anonymize_ip': true });
`;

/**
 * Horonomy site event tracker (HORO-41).
 *
 * Small helper that pushes structured events onto `window.dataLayer` following
 * the canonical GA4 event taxonomy (HORO-45). All events emitted from
 * `horonomy.dev` carry the required parameters from taxonomy §3.1
 * (`hostname`, `page_path`, `page_title`, `surface=horonomy_site`) plus,
 * for CTA-bound events, §3.2 (`cta_location`, `link_url`, `link_domain`,
 * `target_product`).
 *
 * Consent posture: this helper does NOT gate events itself. The site's
 * Consent-Mode v2 setup in `./consentInit.ts` and `./consentBanner.ts`
 * defaults every storage type to `denied` before the first hit, and GTM /
 * GA4 respect the consent state when forwarding dataLayer pushes. Events
 * pushed here before opt-in are recorded to dataLayer but are not persisted
 * or forwarded to GA4 storage until consent is granted — matching the
 * pattern used by `gtagRouteTracker.ts`.
 *
 * No PII in any parameter. Only closed-vocabulary values are accepted for
 * `surface`, `cta_location`, and `target_product` (taxonomy §3.1 / §3.2).
 */

/** Surface classification for the `surface` parameter (taxonomy §3.1). */
export type Surface = 'horonomy_site' | 'product_site' | 'docs' | 'github_readme';

/** Where on the page the CTA sits (taxonomy §3.2). */
export type CtaLocation =
  | 'hero'
  | 'nav'
  | 'body'
  | 'install_block'
  | 'footer'
  | 'thank_you'
  | 'side_rail';

/** Which product surface a CTA points at (taxonomy §3.2). */
export type TargetProduct =
  | 'agent_assembly'
  | 'horonomy'
  | 'docs'
  | 'github'
  | 'early_access';

/**
 * Canonical Horonomy-site event names (taxonomy §2.4). Restricting the
 * `event` argument to this union keeps typos from creating new GA4 rows.
 */
export type HoronomyEvent =
  | 'horonomy_product_agent_assembly_click'
  | 'horonomy_github_click'
  | 'horonomy_manifesto_click'
  | 'horonomy_contact_click'
  | 'horonomy_blog_click';

/** Additional CTA-bound parameters emitted alongside a click event. */
export interface CtaParams {
  cta_location: CtaLocation;
  link_url: string;
  link_domain: string;
  target_product: TargetProduct;
}

type DataLayerEntry = Record<string, unknown>;

interface DataLayerWindow extends Window {
  dataLayer?: DataLayerEntry[];
}

/**
 * Push a Horonomy-site event onto the dataLayer with the taxonomy's required
 * parameters. Safe to call during SSR (no-op) and safe to call before the
 * dataLayer is initialised — the consent-default script guarantees
 * `window.dataLayer` exists as soon as the head runs, but we still guard.
 */
export function trackHoronomyEvent(
  event: HoronomyEvent,
  cta?: CtaParams,
): void {
  if (typeof window === 'undefined') {
    return;
  }
  const w = window as DataLayerWindow;
  const dataLayer = (w.dataLayer = w.dataLayer ?? []);

  // Taxonomy §3.1: required on every event. Read directly from `location` /
  // `document` at emit time so SPA navigations report the current page, not
  // the page the handler was bound on.
  const base: DataLayerEntry = {
    event,
    hostname: window.location.hostname,
    page_path:
      window.location.pathname + window.location.search + window.location.hash,
    page_title: document.title,
    surface: 'horonomy_site' satisfies Surface,
  };

  dataLayer.push(cta ? {...base, ...cta} : base);
}

/**
 * Derive `link_domain` from an absolute or protocol-relative URL. Falls back
 * to an empty string on parse failure so a malformed CTA URL never throws
 * inside a click handler.
 */
export function linkDomainOf(url: string): string {
  try {
    return new URL(url, 'https://horonom.com').hostname;
  } catch {
    return '';
  }
}

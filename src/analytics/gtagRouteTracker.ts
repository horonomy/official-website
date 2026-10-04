import {publicPageUrl} from './publicPage';

/** Explicit public page views replace automatic request-URL collection. */
type Gtag = (...args: unknown[]) => void;

// Minimal shape of the history `Location` Docusaurus passes to client-module
// route hooks. Declared locally to avoid a direct `history` type dependency.
interface RouteLocation {
  pathname: string;
  search: string;
  hash: string;
}

export function onRouteDidUpdate({
  location,
  previousLocation,
}: {
  location: RouteLocation;
  previousLocation: RouteLocation | null;
}): void {
  if (
    previousLocation &&
    (location.pathname === previousLocation.pathname &&
      location.search === previousLocation.search &&
      location.hash === previousLocation.hash)
  ) {
    return;
  }

  // Defer to the next tick so react-helmet-async has updated the document
  // title before we report the page view (mirrors the upstream gtag plugin).
  setTimeout(() => {
    const gtag = (window as unknown as {gtag?: Gtag}).gtag;
    if (typeof gtag === 'function') {
      const page_location = publicPageUrl();
      const params = {page_location, page_path: new URL(page_location).pathname, page_referrer: ''};
      gtag('set', params);
      gtag('event', 'page_view', params);
    }
  });
}

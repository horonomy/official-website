/**
 * Delegated click tracking for Horonomy top-nav and footer links (HORO-41).
 *
 * The Docusaurus navbar / footer are defined declaratively in
 * `docusaurus.config.ts` and do not expose per-item `onClick` hooks without
 * swizzling. To keep the config source-of-truth for nav shape and still fire
 * the taxonomy §2.4 events on nav / footer clicks, this client module
 * attaches a single delegated `click` listener to `document` and matches
 * links by `href` pattern:
 *
 *   - `agent-assembly.com*`            → `horonomy_product_agent_assembly_click`
 *   - `github.com/ai-agent-assembly*`  → `horonomy_github_click`
 *   - `/blog` or `/blog/*`             → `horonomy_blog_click`
 *   - `/#manifesto` or `#manifesto`    → `horonomy_manifesto_click`
 *   - `mailto:` links                  → `horonomy_contact_click`
 *
 * Duplicate-fire safety: React components with their own `onClick`
 * (HeroCtaGroup, the Lore/Products cross-hostname anchors) still call
 * `trackHoronomyEvent` inline. This document-level listener uses the same
 * click but the URL patterns intentionally overlap — to avoid double-count,
 * the inline handlers set a `data-tracked` attribute on the anchor
 * synchronously; the delegated listener skips any anchor that has it.
 *
 * Each match is classified as `nav` when the link is inside the navbar and
 * `footer` when it is inside the footer, so `cta_location` matches taxonomy
 * §3.2 without a second listener.
 *
 * This module is delegate-once: attaching a single listener at `document`
 * means new SPA-rendered links are covered without re-binding. Same-hostname
 * links are matched by pathname, so a full URL rewrite in `docusaurus.config`
 * would not silently break tracking.
 *
 * Consent-mode: events are pushed to `dataLayer` regardless of consent
 * state; GA4's Consent-Mode v2 setup (see `consentInit.ts`) is responsible
 * for gating whether the event reaches the property storage.
 */
import {
  linkDomainOf,
  trackHoronomyEvent,
  type CtaLocation,
  type HoronomyEvent,
  type TargetProduct,
} from './trackEvent';

const GITHUB_ORG_HOST_MATCH = /(^|\.)github\.com$/;
const GITHUB_ORG_PATH_PREFIX = '/ai-agent-assembly';
const AGENT_ASSEMBLY_HOST = 'agent-assembly.com';

/**
 * Anchors that already fire an event from their own React `onClick` handler
 * (see HeroCtaGroup, Sections/index) mark themselves with this attribute so
 * this delegated listener does not double-count.
 */
const TRACKED_ATTR = 'data-horo-tracked';

interface MatchResult {
  event: HoronomyEvent;
  target_product: TargetProduct;
}

function classifyLink(anchor: HTMLAnchorElement): MatchResult | null {
  const rawHref = anchor.getAttribute('href') ?? '';

  // mailto: contact link.
  if (rawHref.startsWith('mailto:')) {
    return {event: 'horonomy_contact_click', target_product: 'horonomy'};
  }

  // Anchors without an href (or javascript: pseudo-links) are not clicks.
  if (!rawHref || rawHref.startsWith('javascript:')) {
    return null;
  }

  const url = (() => {
    try {
      return new URL(rawHref, window.location.href);
    } catch {
      return null;
    }
  })();
  if (!url) return null;

  // Any click leaving to agent-assembly.com — covers the config-defined
  // footer link and any future navbar/footer entry without needing a
  // per-item onClick.
  if (
    url.hostname === AGENT_ASSEMBLY_HOST ||
    url.hostname.endsWith(`.${AGENT_ASSEMBLY_HOST}`)
  ) {
    return {
      event: 'horonomy_product_agent_assembly_click',
      target_product: 'agent_assembly',
    };
  }

  // GitHub org links (any depth under github.com/ai-agent-assembly).
  if (
    GITHUB_ORG_HOST_MATCH.test(url.hostname) &&
    (url.pathname === GITHUB_ORG_PATH_PREFIX ||
      url.pathname.startsWith(`${GITHUB_ORG_PATH_PREFIX}/`))
  ) {
    return {event: 'horonomy_github_click', target_product: 'github'};
  }

  // Same-hostname blog links.
  if (
    url.hostname === window.location.hostname &&
    (url.pathname === '/blog' || url.pathname.startsWith('/blog/'))
  ) {
    return {event: 'horonomy_blog_click', target_product: 'horonomy'};
  }

  // Manifesto anchor on the home page. Match both `/#manifesto` and
  // in-page `#manifesto` fragments; both refer to the same section.
  if (
    url.hostname === window.location.hostname &&
    url.hash === '#manifesto' &&
    (url.pathname === '/' || url.pathname === '')
  ) {
    return {event: 'horonomy_manifesto_click', target_product: 'horonomy'};
  }

  return null;
}

function ctaLocationFor(anchor: HTMLAnchorElement): CtaLocation {
  if (anchor.closest('footer')) return 'footer';
  if (anchor.closest('nav')) return 'nav';
  return 'body';
}

function onDocumentClick(evt: MouseEvent): void {
  // Match only left-clicks with no modifier keys — mirrors the click that
  // Docusaurus' <Link> intercepts for SPA navigation.
  if (evt.button !== 0 || evt.metaKey || evt.ctrlKey || evt.shiftKey || evt.altKey) {
    return;
  }
  const target = evt.target;
  if (!(target instanceof Element)) return;

  const anchor = target.closest('a');
  if (!anchor) return;

  // Skip anchors that have already emitted via a component-level onClick —
  // guards against the double-fire hazard called out in taxonomy §5.4.
  if (anchor.hasAttribute(TRACKED_ATTR)) return;

  // The Sections component's manifesto link and the Lore/Products cross-
  // hostname anchors also carry `#manifesto` / `agent-assembly.com` — they
  // are already tracked inline. Same-hostname manifesto matches inside body
  // regions therefore double-fire unless we short-circuit here too. Rather
  // than tag every inline anchor, mark them by pattern: any anchor with a
  // React-installed onClick handler (rare in Docusaurus config-driven
  // navbar/footer) sets `data-horo-tracked`. See HeroCtaGroup /
  // Sections/index for the tag call sites.
  const match = classifyLink(anchor);
  if (!match) return;

  const href = anchor.getAttribute('href') ?? '';
  const resolved = (() => {
    try {
      return new URL(href, window.location.href).toString();
    } catch {
      return href;
    }
  })();

  trackHoronomyEvent(match.event, {
    cta_location: ctaLocationFor(anchor),
    link_url: resolved,
    link_domain: linkDomainOf(resolved),
    target_product: match.target_product,
  });
}

if (typeof document !== 'undefined') {
  // Passive: the taxonomy pushes to dataLayer; the browser can still navigate
  // in parallel, matching how the existing outbound analytics behave.
  document.addEventListener('click', onDocumentClick, {capture: true});
}

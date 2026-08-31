/**
 * Human-readable maturity labels for HORO-282 Product Registry entries.
 *
 * This is a SEPARATE axis from `productLifecycle.ts`'s `PORTFOLIO_STAGE_AXIS`.
 * That module labels `src/generated/company-metadata.ts`'s narrower, pinned
 * `PRODUCTS_CATALOG` (AAASM-5520 — id/name/website/githubOrg/lifecycle only).
 * This module labels `src/data/productRegistry.ts`'s richer `ProductEntry`
 * vocabulary (HORO-282 — adds `experimental`, drops nothing), used by the
 * System Map / Horo Run Atlas. The two vocabularies are not the same set
 * (`experimental` has no portfolio-lifecycle counterpart) and the same
 * product can legitimately carry a different label on each axis today (AI
 * Agent Assembly is `beta` here, `release_candidate` on the portfolio axis)
 * — see `productRegistry.ts`'s header comment and `atlas/render.mjs`'s
 * maturity-pill note for the full rationale. Do not merge these two files;
 * that reconciliation, if ever warranted, is a separate future decision.
 */
import {
  PRODUCT_REGISTRY,
  type ProductMaturity,
} from '@site/src/data/productRegistry';

/**
 * The axis name these labels live on. Deliberately does NOT start with
 * "Portfolio" — `scripts/check-product-claims.mjs`'s existing
 * `maturity-vocabulary` rule matches pills by a `title` starting with
 * "Portfolio stage"; a different prefix here keeps this axis's pills out of
 * that rule's extractor entirely, so each axis is checked by its own rule
 * against its own vocabulary rather than one rule silently swallowing both.
 */
export const REGISTRY_STAGE_AXIS = 'Product stage' as const;

/**
 * `Record<ProductMaturity, string>` deliberately, not a partial map: adding a
 * member to `ProductMaturity` must fail the build here until someone decides
 * what it is called on the page, rather than silently rendering no label.
 *
 * Every member gets a real label — unlike the portfolio axis, `available`
 * here is not exempted: this vocabulary starts with `experimental`, so an
 * `available` Registry product has actually reached general availability and
 * saying so is informative, not redundant.
 */
const LABELS: Record<ProductMaturity, string> = {
  experimental: 'Experimental',
  beta: 'Beta',
  release_candidate: 'Release candidate',
  available: 'Available',
};

/**
 * The maturity label for a Product Registry entry id — `null` when the id is
 * not a registry product at all.
 */
export function registryMaturityLabelFor(productId: string): string | null {
  const entry = PRODUCT_REGISTRY.find((p) => p.id === productId);
  return entry ? LABELS[entry.maturity] : null;
}

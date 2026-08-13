/**
 * Human-readable maturity labels for catalog products.
 *
 * The pinned company-registry projection (`src/generated/company-metadata.ts`,
 * AAASM-5520) is the company-level source of truth for how mature each product
 * is. Deriving the on-page label from it — instead of hand-writing one per card
 * — is what stops the homepage claiming a maturity the registry does not, and
 * keeps the two places the homepage shows maturity from drifting apart
 * (AAASM-5614).
 *
 * `available` deliberately maps to no label: a generally-available product
 * needs no qualifier, and hanging one on it would understate it.
 */
import {
  PRODUCTS_CATALOG,
  type ProductLifecycle,
} from '@site/src/generated/company-metadata';

/**
 * The axis these labels live on.
 *
 * Three maturity vocabularies exist for the same product and none of them owns
 * the others (ADR 0034 hand-off 7). This one — the *portfolio lifecycle* — is
 * Horonomy's own and ranges over a product in the company portfolio. The other
 * two range over different subjects: the Docs Hub's `source-of-truth.md`
 * labels range over an area of Agent Assembly documentation, and ADR 0033 §6's
 * eleven claim terms range over a single action on a single host.
 *
 * `release_candidate` deliberately shares the Hub's spelling; hand-off 7
 * ratified that as a genuine coincidence at product level rather than a shared
 * definition, so neither axis may cite the other as its source. Naming the
 * axis at the point of use is what stops a reader importing the wrong one.
 *
 * See `design/product-narrative-hierarchy.md` §5 (AAASM-5615). Carrying this
 * naming across to the Docs Hub is AAASM-5655's, not this module's.
 */
export const PORTFOLIO_STAGE_AXIS = 'Portfolio stage' as const;

/**
 * `Record<ProductLifecycle, …>` deliberately, not a partial map: adding a
 * member to the registry vocabulary must fail the build here until someone
 * decides what it is called on the page, rather than silently rendering no
 * label at all.
 *
 * `release_candidate` reuses the exact wording the Agent Assembly Docs Hub
 * already publishes ("Release candidate", `docs/src/source-of-truth.md`).
 * Coining a third spelling for the same state is what cross-surface
 * incoherence looks like (AAASM-5614).
 */
const LABELS: Record<ProductLifecycle, string | null> = {
  available: null,
  beta: 'Beta',
  release_candidate: 'Release candidate',
  coming_soon: 'Coming soon',
};

/**
 * The maturity label for a catalog product id — `null` when the product needs
 * no label, or when the id is not a catalog product at all (the hero row also
 * carries a "More Constellations" placeholder that the company registry does
 * not know about).
 */
export function maturityLabelFor(productId: string): string | null {
  const entry = PRODUCTS_CATALOG.find((p) => p.id === productId);
  return entry ? LABELS[entry.lifecycle] : null;
}

/**
 * Lifecycle members that mean "a reader can go and use this today".
 *
 * Declared as a `Record<ProductLifecycle, boolean>` for the same reason
 * `LABELS` is: a new registry member must fail the build here until someone
 * decides whether it is released, rather than defaulting to one answer.
 */
const RELEASED: Record<ProductLifecycle, boolean> = {
  available: true,
  beta: true,
  release_candidate: true,
  coming_soon: false,
};

/**
 * Whether a catalog product has somewhere for a visitor to go.
 *
 * The single source for "is this shipped?" across every surface that asks.
 * Three surfaces used to answer it three different ways — a hand-written
 * `comingSoon` boolean in `products.ts`, `href === '#'` in
 * `ConstellationMap`, and this module's registry lookup — so nothing asserted
 * that they agreed and the registry was outvoted two to one (AAASM-5616).
 *
 * An id the registry does not carry is **not** released: the hero row includes
 * a "More Constellations" placeholder that is not a product, and defaulting an
 * unknown id to released would render it as a live link to nowhere.
 */
export function isReleased(productId: string): boolean {
  const entry = PRODUCTS_CATALOG.find((p) => p.id === productId);
  return entry ? RELEASED[entry.lifecycle] : false;
}

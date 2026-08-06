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

const LABELS: Record<ProductLifecycle, string | null> = {
  available: null,
  beta: 'Beta',
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

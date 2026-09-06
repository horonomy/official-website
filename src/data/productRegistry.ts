/**
 * Horonom Product Registry (HORO-282) — the canonical, version-controlled
 * source of truth for the public product portfolio: name, category, one-line
 * problem statement, maturity, and canonical/family/repo URLs.
 *
 * WHY A SEPARATE FILE FROM `src/generated/company-metadata.ts`
 * --------------------------------------------------------------
 * `company-metadata.ts` is generated from a *different*, narrower, pinned
 * cross-repo contract (AAASM-5520: `horonomy/.github`'s
 * `metadata/generated/company.json`) that exists to keep the footer's company
 * name/contact/catalog from drifting. Its `PRODUCTS_CATALOG` has only four
 * fields (id/name/website/githubOrg/lifecycle) — not enough for a System Map
 * card (no category, no problem statement, no celestial identity, no
 * docs/app/API URLs, no controlled maturity vocabulary with an
 * "experimental" tier). Re-pointing that pinned contract to carry the richer
 * shape is a change to a different repo's registry and a different Jira
 * project's ticket (AAASM-5520) — out of this epic's scope to alter
 * autonomously. This registry is additive, not a replacement; reconciling
 * the two (if ever warranted) is a future decision, not this one.
 *
 * HOW TO ADD OR UPDATE A PRODUCT
 * --------------------------------
 * 1. Add/edit one `ProductEntry` in `PRODUCT_REGISTRY` below.
 * 2. `slug` must be unique and match the `<product>.horo.run` subdomain the
 *    product would use under the Horo Run Product Atlas namespace (ADR-0002
 *    in `horonomy/internal-docs`), even before that DNS is live (HORO-286).
 * 3. `maturity` must be one of `ProductMaturity` — never invent a label
 *    inline, and never mark a product `available` unless it is genuinely
 *    generally available. When unsure, use the more conservative label.
 * 4. Run `pnpm check:registry` (schema + invariants) and `pnpm typecheck`
 *    before opening a PR. `pnpm check:claims` also re-validates that every
 *    maturity label rendered on a page is one this file defines.
 * 5. Do not publish an internal HVDL/JPD idea here — only products the
 *    company is ready to show publicly.
 */

/** Controlled maturity vocabulary. Never imply GA ("available") for a
 * product still validating/experimenting — see HORO-284's content
 * constraints and `check-product-claims.mjs`'s banned-absolutes gate. */
export type ProductMaturity =
  | 'experimental'
  | 'beta'
  | 'release_candidate'
  | 'available';

export interface ProductEntry {
  /** Stable identifier — never reused, never renamed once published. */
  id: string;
  /** Public display name. */
  name: string;
  /** `<slug>.horo.run` — the Product Atlas subdomain (may not resolve yet;
   * see HORO-286). */
  slug: string;
  /** Plain-language category, no jargon. */
  category: string;
  /** One sentence: the problem this product owns. */
  problem: string;
  /** Optional short tagline for card/hero use. */
  tagline?: string;
  maturity: ProductMaturity;
  /** The URL this product actually wants visitors to land on today. May be
   * a family alias (`<slug>.horo.run`) or an existing standalone domain
   * that stays canonical per the rebrand's non-goals (e.g. Agent Assembly
   * keeps `agent-assembly.com`). */
  canonicalUrl: string;
  /** `<slug>.horo.run` family alias, when distinct from `canonicalUrl`
   * (e.g. redirects to a standalone canonical domain). `null` when the
   * canonical URL *is* the family alias. */
  familyAliasUrl: string | null;
  docsUrl: string | null;
  appUrl: string | null;
  apiUrl: string | null;
  /** `null` when the product's repo is not genuinely public-visitable (e.g.
   * a private-repo Alpha experiment) — never point this at a URL that
   * 404s/access-denies for the public audience the Atlas serves. */
  githubUrl: string | null;
  /** The celestial name backing this product's identity (ADR-0002). */
  celestialIdentity: string;
  /** Short plain-language description of how this product relates to the
   * rest of the portfolio. Not a hard technical dependency graph — several
   * products can and do stand alone. */
  relationship: string;
  /** Previously-used slugs/URLs that should redirect here, if any. */
  legacyAliases: string[];
  /** Lower sorts first on the System Map / Atlas. */
  order: number;
}

export const PRODUCT_REGISTRY: readonly ProductEntry[] = [
  {
    id: 'ai-agent-assembly',
    name: 'AI Agent Assembly',
    slug: 'agent-assembly',
    category: 'Agent runtime & governance',
    problem:
      'Gives AI agents a runtime with permissions, approval checkpoints, and an audit trail instead of unrestricted tool access.',
    tagline: 'Argo Navis',
    maturity: 'beta',
    // Agent Assembly is the one product that keeps its own standalone
    // canonical domain per the rebrand's explicit non-goal — see the
    // Horo Run family-alias row below.
    canonicalUrl: 'https://agent-assembly.com',
    familyAliasUrl: 'https://agent-assembly.horo.run',
    // Not verified against the live site — leave null rather than guess a
    // path. Fill in once confirmed to actually resolve.
    docsUrl: null,
    appUrl: null,
    apiUrl: null,
    githubUrl: 'https://github.com/ai-agent-assembly',
    celestialIdentity: 'Argo Navis',
    relationship: 'Runtime and governance layer other products assume agent execution passes through.',
    legacyAliases: [],
    order: 0,
  },
  {
    id: 'octans',
    name: 'Octans',
    slug: 'octans',
    category: 'Change safety',
    problem: 'Verifies a change is safe to ship before it reaches production, across distributed services.',
    maturity: 'experimental',
    canonicalUrl: 'https://octans.horo.run',
    familyAliasUrl: null,
    docsUrl: null,
    appUrl: null,
    apiUrl: null,
    // horonomy/octans is a private repo (Alpha-stage experiment) — no
    // public-visitable link to show.
    githubUrl: null,
    celestialIdentity: 'Octans',
    relationship: 'Standalone — usable without any other Horonom product.',
    legacyAliases: [],
    order: 1,
  },
  {
    id: 'circinus',
    name: 'Circinus',
    slug: 'circinus',
    category: 'Provenance & authority',
    problem: 'Establishes who or what is authorized to take a sensitive action, and proves it after the fact.',
    maturity: 'experimental',
    // Migrated HORO-566/569: canonical marketing moved from
    // circinus.horo.run to circinus.horonom.com, verified live 2026-09-06.
    // The old host now issues a real 301 redirect here (see legacyAliases).
    canonicalUrl: 'https://circinus.horonom.com',
    familyAliasUrl: null,
    docsUrl: 'https://circinus.horonom.com/docs',
    appUrl: null,
    apiUrl: 'https://api.circinus.horo.run',
    // horonomy/circinus is a private repo (Alpha-stage experiment) — no
    // public-visitable link to show.
    githubUrl: null,
    celestialIdentity: 'Circinus',
    relationship: 'Standalone — usable without any other Horonom product.',
    legacyAliases: ['https://circinus.horo.run'],
    order: 2,
  },
  {
    id: 'ophiuchus',
    name: 'Ophiuchus',
    slug: 'ophiuchus',
    category: 'Context continuity',
    problem: 'Carries context across machine, tool, and user boundaries so it is not re-derived or lost at each hop.',
    maturity: 'experimental',
    // Migrated HORO-566/568: canonical marketing moved from
    // ophiuchus.horo.run to ophiuchus.horonom.com, verified live 2026-09-06.
    // The old host now issues a real 301 redirect here (see legacyAliases).
    canonicalUrl: 'https://ophiuchus.horonom.com',
    familyAliasUrl: null,
    docsUrl: 'https://ophiuchus.horonom.com/docs',
    appUrl: null,
    apiUrl: null,
    // horonomy/ophiuchus is a private repo (Alpha-stage experiment) — no
    // public-visitable link to show.
    githubUrl: null,
    celestialIdentity: 'Ophiuchus',
    relationship: 'Standalone — usable without any other Horonom product.',
    legacyAliases: ['https://ophiuchus.horo.run'],
    order: 3,
  },
  {
    id: 'fornax',
    name: 'Fornax',
    slug: 'fornax',
    category: 'Agent integrity',
    problem: 'Verifies real evidence for what an AI coding agent claims it did.',
    maturity: 'experimental',
    // Migrated HORO-566/FORNX-328: canonical marketing is fornax.horonom.com
    // (verified live 2026-09-06); the legacy fornax.horo.run host was found
    // still serving duplicate content with no redirect during this same
    // reconciliation pass and has since been fixed to 301 here (HORO-572,
    // fornax-edge Worker).
    canonicalUrl: 'https://fornax.horonom.com',
    familyAliasUrl: null,
    docsUrl: 'https://docs.fornax.horonom.com',
    appUrl: null,
    apiUrl: null,
    // horonomy/fornax-core is a private repo — no public-visitable link.
    // fornax-website (the marketing site) is public but is a presentation
    // repo, not the product itself, so it is not linked as "the" GitHub URL.
    githubUrl: null,
    celestialIdentity: 'Fornax',
    relationship: 'Standalone — usable without any other Horonom product.',
    legacyAliases: ['https://fornax.horo.run'],
    order: 4,
  },
  {
    id: 'horologium',
    name: 'Horologium',
    slug: 'horologium',
    category: 'Product truth & integrity',
    problem: 'Keeps what a product claims and what a product actually does from silently drifting apart.',
    maturity: 'experimental',
    // Public Alpha, migrated HORO-566/571: canonical marketing is
    // horologium.horonom.com, verified live 2026-09-06. Docs are nested at
    // /docs/* on the same host (a dedicated docs.horologium.horonom.com
    // subdomain was attempted and reverted — Cloudflare Universal SSL does
    // not cover this second-level subdomain on the current plan, HORO-571).
    canonicalUrl: 'https://horologium.horonom.com',
    familyAliasUrl: null,
    docsUrl: 'https://horologium.horonom.com/docs',
    appUrl: null,
    // horologium.horo.run remains the real runtime boundary
    // (/v1/*, /app/*, /healthz, /readyz) — unaffected by this migration.
    apiUrl: null,
    // horonomy/horologium is a private repo (Public Alpha) — no
    // public-visitable link to show.
    githubUrl: null,
    celestialIdentity: 'Horologium',
    relationship: 'Standalone — usable without any other Horonom product.',
    legacyAliases: [],
    order: 5,
  },
  {
    id: 'eridanus',
    name: 'Eridanus',
    slug: 'eridanus',
    category: 'Forensic provenance',
    problem: 'Traces a data leak back through transformations to its point of origin, after the fact.',
    maturity: 'experimental',
    // Intentionally NOT public: horonomy/eridanus's own release-evidence
    // record (metadata/release-evidence/eridanus.yaml in horonomy/.github)
    // states claimed_lifecycle: not_yet_public — no website, no docs, no
    // hosted service. canonicalUrl is a placeholder value that
    // resolveDestination() never resolves live (no host on LIVE_HOSTS);
    // it exists only because ProductEntry.canonicalUrl is non-nullable, the
    // same pattern used for every other pending entry in this registry.
    // Do NOT add eridanus.horo.run/eridanus.horonom.com to LIVE_HOSTS
    // merely to make this resolve — that would fabricate a public surface
    // for a release-gated product.
    canonicalUrl: 'https://eridanus.horo.run',
    familyAliasUrl: null,
    docsUrl: null,
    appUrl: null,
    apiUrl: null,
    // horonomy/eridanus is a private validation/research repo — no
    // public-visitable link to show.
    githubUrl: null,
    celestialIdentity: 'Eridanus',
    relationship: 'Standalone — usable without any other Horonom product.',
    legacyAliases: [],
    order: 6,
  },
] as const;

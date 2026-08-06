/**
 * Shared product data for the HeroUniverse.
 *
 * Single source of truth consumed by both the sky {@link ConstellationMap}
 * (HORO-4) and the {@link ProductCards} row below the scene. Downstream tickets
 * read from this array so labels, links, and ordering stay in sync.
 */

export type ProductTone = 'primary' | 'secondary' | 'muted';

export type Product = {
  id: string;
  name: string;
  /** Short punchy line shown beside the constellation. */
  tagline: string;
  /** One-sentence description shown on the product card. */
  blurb: string;
  href: string;
  tone: ProductTone;
  /**
   * When true the product is still in design/estimation and has not shipped.
   * Its card renders as a non-interactive roadmap entry (no link, no pointer,
   * no "Learn more") with a "Coming soon" label.
   */
  comingSoon?: boolean;
};

export const PRODUCTS: Product[] = [
  {
    id: 'ai-agent-assembly',
    name: 'AI Agent Assembly',
    // Governance positioning (AAASM-5614). The previous "Assemble.
    // Orchestrate. Scale." / "assembly line" wording read as an agent-building
    // or orchestration framework; Agent Assembly governs agents someone else
    // builds. The three beats mirror the product's own promise at company
    // altitude: govern what an agent may do, hold risky actions at a
    // checkpoint, record the evidence.
    tagline: 'Govern. Checkpoint. Record.',
    blurb:
      'A governance layer for AI agents — permissions, checkpoints, and evidence.',
    // Canonical product URL: the `agent-assembly.com` apex, which ADR 0007
    // ("Public Domain & URL Contract", ai-agent-assembly/agent-assembly →
    // `docs/src/adr/0007-public-domain-and-url-contract.md`) fixes as the
    // primary public marketing host. No trailing slash: this exact string is
    // what the company registry stores (`PRODUCTS_CATALOG[].website`), and
    // `ConstellationMap` renders the href verbatim into its accessible name,
    // so a slash here would be spoken aloud as "opens agent-assembly.com/".
    href: 'https://agent-assembly.com',
    tone: 'primary',
  },
  {
    id: 'archeweave',
    name: 'ArcheWeave',
    tagline: 'Weave Knowledge. Connect Everything.',
    blurb: 'The knowledge fabric of your organization.',
    href: '#',
    tone: 'secondary',
    comingSoon: true,
  },
  {
    id: 'harbinger',
    name: 'Harbinger',
    tagline: 'Observe. Predict. Guide the Future.',
    blurb: 'Monitoring and prediction for AI-native systems.',
    href: '#',
    tone: 'secondary',
    comingSoon: true,
  },
  {
    id: 'more',
    name: 'More Constellations',
    tagline: 'New stars are forming. Stay tuned.',
    blurb: 'The universe is still expanding.',
    href: '#',
    tone: 'muted',
    comingSoon: true,
  },
];

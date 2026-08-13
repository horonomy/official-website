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
};

/*
 * There is deliberately no `comingSoon` field here.
 *
 * Whether a product has shipped is a registry fact, and `isReleased()` in
 * `src/data/productLifecycle.ts` is the one place that answers it. A boolean
 * on this type was a second, hand-written source that nothing kept in step
 * with the registry (AAASM-5616).
 */

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
    // "approval checkpoints", not a bare "checkpoints": in an AI-agent context
    // an unqualified checkpoint reads as a model/agent state snapshot-and-
    // resume. The qualifier fixes the sense the tagline intends — a gate that
    // holds a risky action for a human — without lengthening the line much.
    blurb:
      'A governance layer for AI agents — permissions, approval checkpoints, and evidence.',
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
  },
  {
    id: 'harbinger',
    name: 'Harbinger',
    tagline: 'Observe. Predict. Guide the Future.',
    blurb: 'Monitoring and prediction for AI-native systems.',
    href: '#',
    tone: 'secondary',
  },
  {
    id: 'more',
    name: 'More Constellations',
    tagline: 'New stars are forming. Stay tuned.',
    blurb: 'The universe is still expanding.',
    href: '#',
    tone: 'muted',
  },
];

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
    tagline: 'Assemble. Orchestrate. Scale.',
    blurb: 'The assembly line for intelligent agents.',
    href: 'https://github.com/AI-agent-assembly',
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

/**
 * Z-index layer tokens for the HeroUniverse scene.
 *
 * Owned by the hero architecture (HORO-2). Every layer component reads its
 * stacking value from here so the back-to-front order stays authoritative as
 * downstream tickets (HORO-4..9) fill in their slots. Order mirrors the layering
 * model in `design/uiux_elements/README.md`.
 */

export const LAYERS = {
  background: 0,
  sky: 1,
  ambient: 2,
  environment: 3,
  observer: 4,
  props: 5,
  constellations: 6,
  content: 7,
  cards: 8,
} as const;

export type LayerName = keyof typeof LAYERS;

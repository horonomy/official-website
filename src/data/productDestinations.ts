/**
 * Hoisted destination-label resolver (HORO-284 PR-2).
 *
 * Both {@link "@site/src/components/SystemMap"} and `ConstellationMap` speak
 * a product's canonical URL to assistive tech (`aria-label`) and need the
 * bare host+path read aloud, not the raw `https://` URL with a trailing
 * slash. Before this module the same two-step regex existed independently in
 * `HeroUniverse/ProductCards.tsx` and `HeroUniverse/ConstellationMap.tsx` —
 * two copies that could silently drift apart. One function, one rule.
 */
export function destinationLabel(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

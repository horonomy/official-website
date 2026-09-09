// @ts-check
/**
 * Immediate semantic target arbitration from the Motion Constitution.
 * ConstellationMap consumes it today; the constitution requires the same
 * adapter for future map/list and observer wiring. Perception latency belongs
 * to the observer, never to this target feedback or its navigation action.
 *
 * @param {{focus?: string | null, selection?: string | null, hover?: string | null}} inputs
 * @returns {string | null}
 */
export function resolveAttentionTarget({focus, selection, hover}) {
  return focus ?? selection ?? hover ?? null;
}

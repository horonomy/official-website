/**
 * Star-node geometry for the sky {@link ConstellationMap} (HORO-4).
 *
 * One {@link Constellation} shape per product id, expressed in the SVG viewBox
 * space (0..1000 x, 0..520 y) used by the map. Kept out of the component so the
 * geometry is a plain, testable data module: `nodes` draw as connected stars,
 * `chords` are optional internal star-map lines (index pairs into `nodes`), and
 * `label` anchors the text block beside the cluster.
 *
 * Placement note: every cluster sits in the upper / right sky so it never
 * overlaps the hero copy anchored to the lower-left.
 */

export type Constellation = {
  nodes: Array<[number, number]>;
  /** Optional internal star-map chords (index pairs into `nodes`). */
  chords?: Array<[number, number]>;
  label: [number, number];
  labelAlign: 'start' | 'end';
};

export const CONSTELLATIONS: Record<string, Constellation> = {
  // The primary constellation is the biggest shape in the sky, roughly centre
  // of the map, label anchored to its lower-right (per the v1 mock).
  'ai-agent-assembly': {
    nodes: [
      [350, 260],
      [415, 160],
      [520, 135],
      [605, 195],
      [580, 300],
      [475, 345],
      [385, 330],
    ],
    chords: [
      [0, 3],
      [1, 4],
    ],
    label: [640, 310],
    labelAlign: 'start',
  },
  // Small cluster in the upper-left of the map region.
  archeweave: {
    nodes: [
      [70, 150],
      [120, 105],
      [180, 125],
      [160, 185],
      [95, 190],
    ],
    label: [210, 140],
    labelAlign: 'start',
  },
  // Small cluster in the upper-right corner of the sky.
  harbinger: {
    nodes: [
      [800, 75],
      [855, 45],
      [915, 80],
      [890, 140],
      [825, 135],
    ],
    label: [775, 85],
    labelAlign: 'end',
  },
  // Faint hint in the lower-right, clearly separated from the primary label.
  more: {
    nodes: [
      [855, 400],
      [905, 380],
      [950, 420],
      [900, 450],
    ],
    label: [830, 415],
    labelAlign: 'end',
  },
};

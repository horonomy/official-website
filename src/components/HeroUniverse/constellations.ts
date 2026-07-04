/**
 * Star-node geometry for the sky {@link ConstellationMap} (HORO-4, HORO-19).
 *
 * One {@link Constellation} shape per product id, expressed in the SVG viewBox
 * space (0..1000 x, 0..520 y) used by the map. Kept out of the component so the
 * geometry is a plain, testable data module:
 *   - `nodes`   — every star, drawn as a circle;
 *   - `figures` — connected stick-figure paths, each a list of indices into
 *                 `nodes` drawn as one polyline (a constellation can have
 *                 several disjoint figures — e.g. the parts of Argo Navis);
 *   - `chords`  — extra closing lines (index pairs into `nodes`);
 *   - `regions` — optional sub-labels naming parts of a large constellation;
 *   - `label`   — anchors the product text block beside the cluster.
 *
 * HORO-19 gives each product a real astronomical identity (Epic AAASM-4084,
 * visual / brand only — no engineering names change):
 *
 * | product id         | sky name  | asterism                                  |
 * |--------------------|-----------|-------------------------------------------|
 * | `ai-agent-assembly`| Argo Navis| the primary — the COMPLETE ship in **true star positions**, drawn as its four modern constellations (Puppis, Vela, Carina, Pyxis), anchored on Canopus |
 * | `archeweave`       | Reticulum | the net / reticle — an emblematic woven rhombus |
 * | `harbinger`        | Sagitta   | the arrow — an emblematic herald's shaft + head |
 * | `more`             | Pleiades  | a small forming star cluster — "new stars are forming" |
 *
 * The hero constellation (`ai-agent-assembly` = Argo Navis) uses the **real
 * relative positions** of its brightest stars. Argo Navis is enormous — so
 * large it was broken up into the modern constellations Carina, Puppis, Vela
 * and Pyxis — so the whole ship is plotted from an equirectangular projection
 * of catalogue right-ascension / declination (RA increasing to the left, north
 * up), scaled uniformly so the pattern's true shape is preserved, with each of
 * the four parts labelled where it sits. The three secondary clusters remain
 * emblematic brand asterisms, not surveyed positions.
 *
 * Layout: Argo Navis fills the right sky as the hero; the three secondary
 * products sit smaller and dimmer down the left of the sky map, clear of both
 * the ship and the hero copy anchored to the lower-left.
 */

export type ConstellationRegion = {
  /** Sub-constellation name, e.g. "Carina". */
  name: string;
  /** Label anchor in viewBox space. */
  at: [number, number];
};

export type Constellation = {
  nodes: Array<[number, number]>;
  /** Connected stick-figure paths; each is a list of indices into `nodes`. */
  figures?: Array<Array<number>>;
  /** Extra closing lines, as index pairs into `nodes`. */
  chords?: Array<[number, number]>;
  /** Index into `nodes` of the brightest anchor star (e.g. Canopus). */
  anchor?: number;
  /** Real constellation name shown as an astronomical sub-label. */
  sky: string;
  /** Optional sub-region labels (the modern parts of a large constellation). */
  regions?: Array<ConstellationRegion>;
  label: [number, number];
  labelAlign: 'start' | 'end';
};

export const CONSTELLATIONS: Record<string, Constellation> = {
  // Argo Navis — the primary, and the whole ship. These are the REAL stars at
  // their true relative positions (equirectangular projection of catalogue
  // RA/Dec, RA increasing left, north up, uniform scale), grouped into the four
  // modern constellations Argo was split into:
  //   Puppis (the stern)  nodes 0–6
  //   Vela   (the sail)   nodes 7–11
  //   Carina (the keel)   nodes 12–17, anchored on Canopus (node 12)
  //   Pyxis  (the compass / old mast) nodes 18–20
  'ai-agent-assembly': {
    sky: 'Argo Navis',
    nodes: [
      [808, 70], // 0  ρ Pup
      [806, 74], // 1  ξ Pup
      [872, 171], // 2  π Pup
      [857, 221], // 3  σ Pup
      [813, 195], // 4  ζ Pup (Naos)
      [907, 279], // 5  τ Pup
      [922, 220], // 6  ν Pup
      [805, 253], // 7  γ Vel (Regor)
      [761, 311], // 8  δ Vel (Alsephina)
      [731, 222], // 9  λ Vel (Suhail)
      [713, 314], // 10 κ Vel (Markeb)
      [605, 269], // 11 μ Vel
      [940, 295], // 12 α Car — Canopus (brightest anchor, the keel)
      [789, 349], // 13 ε Car (Avior)
      [719, 347], // 14 ι Car (Aspidiske)
      [724, 430], // 15 β Car (Miaplacidus)
      [681, 393], // 16 υ Car
      [610, 388], // 17 θ Car
      [762, 140], // 18 α Pyx
      [767, 157], // 19 β Pyx
      [753, 97], // 20 γ Pyx
    ],
    figures: [
      [0, 1, 4, 3, 5, 6, 2], // Puppis — the stern
      [9, 7, 8, 10], // Vela — the sail (three sides)
      [10, 11], //          — the sail's western spar out to μ Vel
      [12, 13, 14, 16, 17], // Carina — the keel, from Canopus westward
      [14, 15], //          — down to β Car (Miaplacidus)
      [20, 18, 19], // Pyxis — the compass / old mast
    ],
    chords: [
      [9, 10], // close the Vela sail (λ–κ)
    ],
    anchor: 12,
    regions: [
      {name: 'Puppis', at: [905, 52]},
      {name: 'Pyxis', at: [690, 92]},
      {name: 'Vela', at: [598, 236]},
      {name: 'Carina', at: [560, 402]},
    ],
    label: [600, 470],
    labelAlign: 'start',
  },
  // Reticulum — the net / reticle. Emblematic: a woven rhombus (0–3) with two
  // cross-threads meeting at a central star (4). Upper-left of the sky map.
  archeweave: {
    sky: 'Reticulum',
    nodes: [
      [96, 158], // 0  west
      [168, 108], // 1  north
      [240, 156], // 2  east
      [168, 206], // 3  south
      [168, 157], // 4  woven centre
    ],
    figures: [[0, 1, 2, 3, 0]],
    chords: [
      [0, 4],
      [4, 2],
      [1, 4],
      [4, 3],
    ],
    label: [252, 150],
    labelAlign: 'start',
  },
  // Sagitta — the arrow / herald. Emblematic: a shaft (0–1–2) from nock to head,
  // with fletching off the nock and barbs off the head. Mid-left of the sky map.
  harbinger: {
    sky: 'Sagitta',
    nodes: [
      [104, 320], // 0  nock
      [162, 292], // 1  shaft mid
      [228, 256], // 2  head tip
      [88, 298], // 3  fletch (upper)
      [120, 338], // 4  fletch (lower)
      [206, 268], // 5  barb (upper)
      [232, 280], // 6  barb (lower)
    ],
    figures: [[0, 1, 2]],
    chords: [
      [0, 3],
      [0, 4],
      [2, 5],
      [2, 6],
    ],
    label: [248, 250],
    labelAlign: 'start',
  },
  // Pleiades — a small forming star cluster. Emblematic: loosely strung stars,
  // still gathering. Lower-left of the sky map, clearly separate from Argo.
  more: {
    sky: 'Pleiades',
    nodes: [
      [60, 398], // 0
      [108, 380], // 1
      [152, 404], // 2
      [124, 442], // 3
      [72, 444], // 4
      [106, 414], // 5  cluster centre
    ],
    chords: [
      [5, 1],
      [5, 3],
    ],
    label: [175, 428],
    labelAlign: 'start',
  },
};

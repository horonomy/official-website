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
 * | `archeweave`       | Reticulum | the net / reticle — α β γ δ ε Reticuli in **true star positions**, anchored on α Ret |
 * | `harbinger`        | Sagitta   | the arrow — α β γ δ η Sagittae in **true star positions**, anchored on γ Sge |
 * | `more`             | Pleiades  | the M45 cluster — eight brightest members in **true star positions**, anchored on Alcyone |
 *
 * **Every** constellation uses the **real relative positions** of its catalogue
 * stars, plotted the same way: an equirectangular projection of catalogue
 * right-ascension / declination (RA increasing to the left, north up), scaled
 * uniformly per constellation so the true shape of the pattern is preserved,
 * then anchored on-canvas where that product sits in the sky map. Argo Navis is
 * enormous — so large it was broken up into the modern constellations Carina,
 * Puppis, Vela and Pyxis — so the whole ship additionally labels each of its
 * four parts where it sits.
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
  /** Indices of subordinate stars, drawn smaller/fainter (e.g. Pyxis, the
   * small navigational instrument off the main hull). */
  minor?: Array<number>;
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
  // RA/Dec, RA increasing left, north up, uniform scale). The three modern
  // constellations Argo was split into carry the hull, plus Pyxis (the compass)
  // as a small side instrument:
  //   Carina (the keel)  — anchored on Canopus (node 10), the deep backbone
  //   Vela   (the sail)  — the quadrilateral above the keel
  //   Puppis (the stern) — up top, kept clear of Canopus so the anchor reads
  //                        unambiguously as Carina's, not Puppis's
  //   Pyxis  (the compass) — a small, faint instrument off the hull (minor)
  'ai-agent-assembly': {
    sky: 'Argo Navis',
    nodes: [
      [808, 70], // 0  ρ Pup
      [806, 74], // 1  ξ Pup
      [872, 171], // 2  π Pup
      [857, 221], // 3  σ Pup
      [813, 195], // 4  ζ Pup (Naos) — Puppis's own brightest
      [805, 253], // 5  γ Vel (Regor)
      [761, 311], // 6  δ Vel (Alsephina)
      [731, 222], // 7  λ Vel (Suhail)
      [713, 314], // 8  κ Vel (Markeb)
      [605, 269], // 9  μ Vel
      [940, 295], // 10 α Car — Canopus, the keel-head (brightest anchor)
      [789, 349], // 11 ε Car (Avior)
      [719, 347], // 12 ι Car (Aspidiske)
      [724, 430], // 13 β Car (Miaplacidus)
      [681, 393], // 14 υ Car
      [610, 388], // 15 θ Car
      [762, 140], // 16 α Pyx
      [767, 157], // 17 β Pyx
      [753, 97], // 18 γ Pyx
    ],
    figures: [
      [0, 1, 4, 3, 2], // Puppis — the stern (up top, clear of Canopus)
      [7, 5, 6, 8], // Vela — the sail
      [8, 9], //          — the sail's western spar out to μ Vel
      [10, 11, 12, 14, 15], // Carina — the keel, sweeping from Canopus westward
      [12, 13], //          — the deep keel down to β Car (Miaplacidus)
      [18, 16, 17], // Pyxis — the compass, a small instrument
    ],
    chords: [
      [7, 8], // close the Vela sail (λ–κ)
    ],
    anchor: 10,
    minor: [16, 17, 18], // Pyxis reads as a small side node, not part of the hull
    regions: [
      {name: 'Puppis', at: [905, 52]},
      {name: 'Vela', at: [598, 236]},
      {name: 'Carina', at: [858, 312]}, // beside Canopus, so the anchor reads as Carina's
      {name: 'Pyxis', at: [690, 96]},
    ],
    label: [600, 470],
    labelAlign: 'start',
  },
  // Reticulum — the net / reticle. The REAL stars at their true relative
  // positions (equirectangular projection of catalogue RA/Dec, RA increasing
  // left, north up, uniform scale), placed upper-left of the sky map. The four
  // outer stars (ε δ β α) frame the net; γ falls almost exactly at the centre
  // of the frame, so it reads as the woven centre with threads to each corner —
  // the same reticle motif, now from surveyed positions. Anchored on α Ret.
  archeweave: {
    sky: 'Reticulum',
    nodes: [
      [144, 165], // 0  α Ret — brightest anchor
      [208, 207], // 1  β Ret
      [172, 159], // 2  γ Ret — the woven centre (near the frame's centroid)
      [177, 146], // 3  δ Ret
      [139, 108], // 4  ε Ret
    ],
    figures: [[4, 3, 1, 0, 4]], // ε–δ–β–α — the net frame
    chords: [
      [0, 2], // α ↔ γ  threads meeting at the woven centre
      [1, 2], // β ↔ γ
      [3, 2], // δ ↔ γ
      [4, 2], // ε ↔ γ
    ],
    anchor: 0,
    label: [252, 150],
    labelAlign: 'start',
  },
  // Sagitta — the arrow / herald. The REAL stars at their true relative
  // positions (same projection as above), placed mid-left of the sky map. The
  // shaft flies η–γ–δ–α from the arrow's point to the nock, with β the second
  // nock feather branching off δ. Anchored on γ Sge, the brightest.
  harbinger: {
    sky: 'Sagitta',
    nodes: [
      [214, 312], // 0  α Sge (Sham) — nock feather
      [209, 324], // 1  β Sge — second nock feather
      [117, 280], // 2  γ Sge — the head; brightest anchor
      [176, 301], // 3  δ Sge — mid-shaft
      [84, 269], // 4  η Sge — the arrow's point
    ],
    figures: [[4, 2, 3, 0]], // η–γ–δ–α — point → head → shaft → nock
    chords: [
      [3, 1], // δ ↔ β  the second nock feather
    ],
    anchor: 2,
    label: [248, 250],
    labelAlign: 'start',
  },
  // Pleiades (M45) — a small forming star cluster. The REAL member stars at
  // their true relative positions (same projection as above), strung as the
  // cluster's familiar little-dipper asterism, placed lower-left of the sky map,
  // clearly separate from Argo. Anchored on Alcyone, the brightest member.
  more: {
    sky: 'Pleiades',
    nodes: [
      [89, 421], // 0  Alcyone (η Tau) — brightest anchor
      [57, 425], // 1  Atlas (27 Tau)
      [140, 420], // 2  Electra (17 Tau)
      [121, 398], // 3  Maia (20 Tau)
      [111, 434], // 4  Merope (23 Tau)
      [133, 390], // 5  Taygeta (19 Tau)
      [56, 418], // 6  Pleione (28 Tau)
      [141, 405], // 7  Celaeno (16 Tau)
    ],
    figures: [[2, 7, 5, 3, 0, 1, 6]], // the little-dipper bowl + handle
    chords: [
      [0, 4], // Alcyone ↔ Merope, the member hanging below the bowl
    ],
    anchor: 0,
    label: [175, 428],
    labelAlign: 'start',
  },
};

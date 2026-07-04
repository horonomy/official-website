/**
 * Star-node geometry for the sky {@link ConstellationMap} (HORO-4, HORO-19).
 *
 * One {@link Constellation} shape per product id, expressed in the SVG viewBox
 * space (0..1000 x, 0..520 y) used by the map. Kept out of the component so the
 * geometry is a plain, testable data module: `nodes` draw as connected stars,
 * `chords` are optional internal star-map lines (index pairs into `nodes`), and
 * `label` anchors the text block beside the cluster.
 *
 * HORO-19 gives each product a real astronomical identity (Epic AAASM-4084,
 * visual / brand only — no engineering names change). The clusters now read as
 * genuine star patterns arranged as one coherent slice of sky:
 *
 * | product id         | sky name  | asterism                                  |
 * |--------------------|-----------|-------------------------------------------|
 * | `ai-agent-assembly`| Argo Navis| the mythic ship — curved hull + masted sail, anchored on Canopus (the primary, brightest cluster) |
 * | `archeweave`       | Reticulum | the net / reticle — a woven rhombus with cross-threads |
 * | `harbinger`        | Sagitta   | the arrow — a herald's shaft, fletching, and barbed head |
 * | `more`             | Pleiades  | a small forming star cluster — "new stars are forming" |
 *
 * Layout: Argo Navis sails through the centre of the sky as the hero pattern;
 * Reticulum sits off its upper-left bow, Sagitta points from the upper-right,
 * and the Pleiades cluster glimmers faintly off the lower-right stern. Every
 * cluster sits in the upper / right sky so it never overlaps the hero copy
 * anchored to the lower-left.
 */

export type Constellation = {
  nodes: Array<[number, number]>;
  /** Optional internal star-map chords (index pairs into `nodes`). */
  chords?: Array<[number, number]>;
  /** Index into `nodes` of the brightest anchor star (e.g. Canopus). */
  anchor?: number;
  /** Real constellation name shown as an astronomical sub-label. */
  sky: string;
  label: [number, number];
  labelAlign: 'start' | 'end';
};

export const CONSTELLATIONS: Record<string, Constellation> = {
  // Argo Navis — the mythic ship, sailing through the centre of the sky. The
  // primary constellation: biggest, brightest, gold, anchored on Canopus (the
  // keel star, node 2). The polyline traces the hull (0–4), up the stern rail
  // (4–5), the aft sail edge (5–6) to the mast-top (7), the fore sail edge to
  // the fore rail (8–9); chords close the bow, run the deck, and raise the mast.
  'ai-agent-assembly': {
    sky: 'Argo Navis',
    nodes: [
      [388, 286], // 0  bow
      [452, 324], // 1  fore hull
      [536, 348], // 2  keel — Canopus (brightest anchor)
      [624, 332], // 3  aft hull
      [706, 292], // 4  stern
      [672, 236], // 5  stern rail
      [628, 196], // 6  aft sail corner
      [548, 150], // 7  mast top
      [470, 198], // 8  fore sail corner
      [430, 240], // 9  fore rail
    ],
    chords: [
      [9, 0], // close the bow
      [9, 5], // deck line across the hull
      [7, 2], // the mast, rising from the keel star
    ],
    anchor: 2,
    label: [726, 338],
    labelAlign: 'start',
  },
  // Reticulum — the net / reticle. A woven rhombus (0–3) with two cross-threads
  // meeting at a central star (4), reading as knotted fabric. Off the ship's
  // upper-left bow.
  archeweave: {
    sky: 'Reticulum',
    nodes: [
      [96, 158], // 0  west
      [168, 108], // 1  north
      [240, 156], // 2  east
      [168, 206], // 3  south
      [168, 157], // 4  woven centre
    ],
    chords: [
      [0, 4],
      [4, 2], // west–east thread through the centre
      [1, 4],
      [4, 3], // north–south thread through the centre
    ],
    label: [252, 150],
    labelAlign: 'start',
  },
  // Sagitta — the arrow / herald. Shaft (0–1–2) from nock to head, with
  // fletching feathers off the nock and barbs off the head, pointing up toward
  // the future. Upper-right sky.
  harbinger: {
    sky: 'Sagitta',
    nodes: [
      [784, 140], // 0  nock
      [842, 112], // 1  shaft mid
      [908, 76], // 2  head tip
      [768, 118], // 3  fletch (upper feather)
      [800, 158], // 4  fletch (lower feather)
      [886, 88], // 5  barb (upper)
      [912, 100], // 6  barb (lower)
    ],
    chords: [
      [0, 3], // fletching
      [0, 4],
      [2, 5], // arrowhead barbs
      [2, 6],
    ],
    label: [760, 100],
    labelAlign: 'end',
  },
  // Pleiades — a small forming star cluster. Loosely strung stars, still
  // gathering; faint hint off the lower-right stern, clearly separated from the
  // primary label.
  more: {
    sky: 'Pleiades',
    nodes: [
      [852, 396], // 0
      [900, 378], // 1
      [944, 402], // 2
      [916, 440], // 3
      [864, 442], // 4
      [898, 412], // 5  cluster centre
    ],
    chords: [
      [5, 1],
      [5, 3], // faint threads hinting stars are drawing together
    ],
    label: [832, 420],
    labelAlign: 'end',
  },
};

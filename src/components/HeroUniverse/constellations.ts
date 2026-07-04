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
 * visual / brand only — no engineering names change):
 *
 * | product id         | sky name  | asterism                                  |
 * |--------------------|-----------|-------------------------------------------|
 * | `ai-agent-assembly`| Argo Navis| the primary — **true star positions** (see below), anchored on Canopus |
 * | `archeweave`       | Reticulum | the net / reticle — an emblematic woven rhombus |
 * | `harbinger`        | Sagitta   | the arrow — an emblematic herald's shaft + head |
 * | `more`             | Pleiades  | a small forming star cluster — "new stars are forming" |
 *
 * The hero constellation (`ai-agent-assembly` = Argo Navis) uses the **real
 * relative positions** of its brightest stars — Canopus, the Vela sail, the
 * Puppis stern, and the recognisable "False Cross" — from an equirectangular
 * projection of their catalogue right-ascension / declination (RA increases to
 * the left, north up), scaled uniformly so the pattern's true shape is
 * preserved. The three secondary clusters remain emblematic brand asterisms,
 * not surveyed positions.
 *
 * Layout: Argo Navis stands as the hero pattern right of centre; Reticulum sits
 * off its upper-left, Sagitta points from the upper-right, and Pleiades
 * glimmers faintly off the lower-right. Every cluster sits in the upper / right
 * sky so it never overlaps the hero copy anchored to the lower-left.
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
  // Argo Navis — the primary constellation: brightest, gold, anchored on
  // Canopus (α Carinae). Unlike the emblematic clusters below, these are the
  // REAL stars at their true relative positions: an equirectangular projection
  // of catalogue RA/Dec (RA increasing to the left, north up), scaled uniformly
  // into the viewBox so the pattern is astronomically faithful, not a drawn
  // ship. The polyline traces the conventional figure — Puppis stern/prow (0–3)
  // down the Vela sail (4–7) and along the Carina keel (8–11) — and the two
  // chords close the sail and the recognisable "False Cross".
  'ai-agent-assembly': {
    sky: 'Argo Navis',
    nodes: [
      [706, 288], // 0  Canopus (α Car) — brightest anchor, the keel/prow star
      [684, 277], // 1  τ Pup
      [662, 207], // 2  π Pup
      [619, 140], // 3  ρ Pup — stern
      [623, 222], // 4  ζ Pup (Naos)
      [618, 260], // 5  γ Vel (Regor) — sail corner
      [569, 240], // 6  λ Vel (Suhail) — sail corner
      [557, 300], // 7  κ Vel (Markeb) — False Cross
      [588, 298], // 8  δ Vel (Alsephina) — False Cross
      [607, 323], // 9  ε Car (Avior) — False Cross
      [561, 322], // 10 ι Car (Aspidiske) — False Cross
      [565, 376], // 11 β Car (Miaplacidus) — keel
    ],
    chords: [
      [5, 8], // close the Vela sail (γ–δ)
      [7, 10], // close the False Cross (κ–ι)
    ],
    anchor: 0,
    label: [724, 300],
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

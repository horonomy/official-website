import React from 'react';
import clsx from 'clsx';
import {LAYERS} from './layers';
import {PRODUCTS, type Product} from './products';
import {CONSTELLATIONS, type Constellation as Shape} from './constellations';
import styles from './ConstellationMap.module.css';

/**
 * The sky map: one small constellation per product, drawn as an SVG overlay
 * from {@link PRODUCTS} + {@link CONSTELLATIONS}. Gold nodes joined by faint
 * gold lines, with a label + tagline anchored beside each cluster. The
 * `primary` product burns brighter than the rest at rest.
 *
 * Interactive (HORO-4): each constellation is a focusable target. On hover or
 * keyboard focus its connecting lines draw in, its nodes brighten, and its
 * label is emphasised, while the others stay dim. Fully self-contained — the
 * hover/focus visual is driven by CSS (`:hover` / `:focus-visible`), so it
 * works standalone with no wiring.
 *
 * Shared active-state with the product cards (HORO-9) is deferred: it needs the
 * shared parent (`index.tsx`) which is owned elsewhere. This component instead
 * accepts optional `activeId` / `onActivate` props so the parent can later sync
 * the two, without this component depending on that wiring.
 */

export type ConstellationMapProps = {
  /** Optional externally-controlled active product id (e.g. from HORO-9 cards). */
  activeId?: string;
  /** Optional callback fired when a constellation is activated/deactivated. */
  onActivate?: (id: string | null) => void;
};

const TONE_CLASS: Record<Product['tone'], string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  muted: styles.muted,
};

function points(nodes: Array<[number, number]>): string {
  return nodes.map(([x, y]) => `${x},${y}`).join(' ');
}

/** Padded bounding box around a cluster, for the hit area + focus ring. */
function bbox(nodes: Array<[number, number]>, pad = 26) {
  const xs = nodes.map(([x]) => x);
  const ys = nodes.map(([, y]) => y);
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  return {
    x: minX,
    y: minY,
    width: Math.max(...xs) + pad - minX,
    height: Math.max(...ys) + pad - minY,
  };
}

function Constellation({
  product,
  active,
  onActivate,
}: {
  product: Product;
  active: boolean;
  onActivate?: (id: string | null) => void;
}): React.ReactElement | null {
  const shape: Shape | undefined = CONSTELLATIONS[product.id];
  if (!shape) return null;

  const isPrimary = product.tone === 'primary';
  // Products still in development (no real destination yet) are faded but kept.
  const comingSoon = product.href === '#';
  const [lx, ly] = shape.label;
  const box = bbox(shape.nodes);
  const figures = shape.figures ?? [shape.nodes.map((_, i) => i)];

  return (
    <g
      className={clsx(styles.constellation, TONE_CLASS[product.tone], {
        [styles.active]: active,
        [styles.comingSoon]: comingSoon,
      })}
      tabIndex={0}
      role="button"
      aria-label={`${product.name}, the ${shape.sky} constellation`}
      onMouseEnter={() => onActivate?.(product.id)}
      onMouseLeave={() => onActivate?.(null)}
      onFocus={() => onActivate?.(product.id)}
      onBlur={() => onActivate?.(null)}
      onClick={() => onActivate?.(product.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onActivate?.(product.id);
        }
      }}>
      {/* Transparent hit area so the whole cluster is hoverable/clickable. */}
      <rect
        className={styles.hit}
        x={box.x}
        y={box.y}
        width={box.width}
        height={box.height}
      />
      {/* Keyboard focus ring — revealed via :focus-visible in CSS. */}
      <rect
        className={styles.focusRing}
        x={box.x}
        y={box.y}
        width={box.width}
        height={box.height}
        rx={12}
        aria-hidden="true"
      />

      {figures.map((idx, i) => (
        <polyline
          key={i}
          className={styles.link}
          points={points(idx.map((n) => shape.nodes[n]))}
          pathLength={1}
          aria-hidden="true"
        />
      ))}
      {shape.chords?.map(([a, b], i) => (
        <line
          key={i}
          className={styles.chord}
          x1={shape.nodes[a][0]}
          y1={shape.nodes[a][1]}
          x2={shape.nodes[b][0]}
          y2={shape.nodes[b][1]}
          pathLength={1}
          aria-hidden="true"
        />
      ))}
      {shape.nodes.map(([x, y], i) => {
        const isAnchor = i === shape.anchor;
        const isMinor = shape.minor?.includes(i) ?? false;
        return (
          <circle
            key={i}
            className={clsx(styles.node, {
              [styles.anchor]: isAnchor,
              [styles.minorNode]: isMinor,
            })}
            cx={x}
            cy={y}
            r={isAnchor ? 5.5 : isMinor ? 1.8 : isPrimary ? 3.2 : 2.4}
            aria-hidden="true"
          />
        );
      })}
      {shape.regions?.map((r, i) => (
        <text
          key={i}
          className={styles.region}
          x={r.at[0]}
          y={r.at[1]}
          aria-hidden="true">
          {r.name}
        </text>
      ))}
      <text
        className={styles.name}
        x={lx}
        y={ly}
        textAnchor={shape.labelAlign}
        aria-hidden="true">
        {product.name}
      </text>
      <text
        className={styles.sky}
        x={lx}
        y={ly + 18}
        textAnchor={shape.labelAlign}
        aria-hidden="true">
        {shape.sky}
      </text>
      <text
        className={styles.tagline}
        x={lx}
        y={ly + 37}
        textAnchor={shape.labelAlign}
        aria-hidden="true">
        {product.tagline}
      </text>
    </g>
  );
}

/* ---- Stone-floor seams (HORO-21) -----------------------------------------
 * The luminous joints of the observatory terrace — the concentric "magic
 * circle" (rings + radial spokes) baked into `ground.webp`, retraced as a live
 * overlay so it can light up. This SVG is anchored over the TERRACE (same box
 * as the ground raster), NOT inside the sky constellation map, so the light
 * appears on the stone floor where the keeper stands — never in the sky.
 *
 * Geometry is authored in the ground image's own pixel space (viewBox
 * 1916x649) and the overlay box matches the raster 1:1, so the rings sit on the
 * baked paving. Foreshortened by FLOOR_K to sit flat in perspective. */
const PRIMARY_ID = PRODUCTS.find((p) => p.tone === 'primary')?.id ?? null;

/* Baked terrace geometry, measured in the ground image's own pixel space
 * (viewBox 1916x649). The overlay box replicates the ground raster 1:1, so these
 * coordinates land on the real baked stone. Two concentric sets trace the actual
 * paving: the fine zodiac wheel on the raised dais, and the larger magic circle
 * spread across the front tiles. All geometry stays below the terrace's back
 * edge (y ~= 130) so nothing is ever drawn over the sky. */
const FLOOR_CX = 764;

/** Raised-dais zodiac wheel — full perspective ellipses. [cy, rx, ry] */
const DAIS_RINGS: ReadonlyArray<readonly [number, number, number]> = [
  [206, 92, 22],
  [206, 170, 40],
  [207, 248, 58],
  [208, 312, 74],
];

/** Larger ground circle — only the FRONT (lower) arc is drawn; its back half is
 * occluded by the dais and would otherwise fall above the terrace line. [cy, rx, ry] */
const GROUND_ARCS: ReadonlyArray<readonly [number, number, number]> = [
  [246, 430, 148],
  [250, 560, 198],
  [252, 690, 242],
];

/** Radial spokes fan from the circle centre across the front tiles only. */
const SPOKE_CX = 764;
const SPOKE_CY = 214;
const SPOKE_INNER = 60;
const SPOKE_OUT_CY = 252;
const SPOKE_OUT_RX = 690;
const SPOKE_OUT_RY = 242;
const SPOKE_COUNT = 18;
const SPOKE_A0 = -0.28; // ~ -16deg (front-right, just above the horizon plane)
const SPOKE_A1 = Math.PI + 0.28; // ~196deg (front-left) — sweeps through the front

/** A full flat-on-the-ground ellipse (perspective circle) as an SVG path. */
function ellipse(cx: number, cy: number, rx: number, ry: number): string {
  return (
    `M${(cx - rx).toFixed(1)} ${cy.toFixed(1)}` +
    `A${rx} ${ry} 0 1 0 ${(cx + rx).toFixed(1)} ${cy.toFixed(1)}` +
    `A${rx} ${ry} 0 1 0 ${(cx - rx).toFixed(1)} ${cy.toFixed(1)}`
  );
}

/** The lower (front) half-arc of an ellipse, left point sweeping under to right. */
function bottomArc(cx: number, cy: number, rx: number, ry: number): string {
  return (
    `M${(cx - rx).toFixed(1)} ${cy.toFixed(1)}` +
    `A${rx} ${ry} 0 0 0 ${(cx + rx).toFixed(1)} ${cy.toFixed(1)}`
  );
}

/** Dais wheel + ground front-arcs + radial spokes, tracing the baked paving. */
function buildFloor(): string[] {
  const paths: string[] = [];
  for (const [cy, rx, ry] of DAIS_RINGS) paths.push(ellipse(FLOOR_CX, cy, rx, ry));
  for (const [cy, rx, ry] of GROUND_ARCS) paths.push(bottomArc(FLOOR_CX, cy, rx, ry));
  for (let i = 0; i < SPOKE_COUNT; i++) {
    const a = SPOKE_A0 + (SPOKE_A1 - SPOKE_A0) * (i / (SPOKE_COUNT - 1));
    const x1 = SPOKE_CX + SPOKE_INNER * Math.cos(a);
    const y1 = SPOKE_CY + SPOKE_INNER * 0.32 * Math.sin(a);
    const x2 = SPOKE_CX + SPOKE_OUT_RX * Math.cos(a);
    const y2 = SPOKE_OUT_CY + SPOKE_OUT_RY * Math.sin(a);
    paths.push(`M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`);
  }
  return paths;
}

// Pure, deterministic, no browser globals → SSR-safe at module load.
const FLOOR_PATHS: string[] = buildFloor();

/**
 * The luminous stone-floor paving. Driven by the same `activeId` that drives the
 * constellations, so pointer hover and keyboard focus light the floor
 * identically (accessibility parity). Idle → a slow travelling pulse ("fixing
 * frequency"); AI Agent Assembly (the primary) hovered → the whole circle burns
 * gold (lead); any other product → a subtler, cooler flare.
 *
 * Rendered as its own terrace-anchored SVG (see `.floorRoot`) below the observer
 * so the keeper stands on the lit floor.
 */
function FloorSeams({
  activeId,
}: {
  activeId: string | null;
}): React.ReactElement {
  const state =
    activeId == null
      ? styles.idle
      : activeId === PRIMARY_ID
        ? clsx(styles.flare, styles.lead)
        : clsx(styles.flare, styles.cool);
  return (
    <svg
      className={styles.floorRoot}
      style={{zIndex: LAYERS.environment}}
      viewBox="0 0 1916 649"
      preserveAspectRatio="none"
      focusable="false"
      aria-hidden="true">
      <g className={clsx(styles.floor, state)}>
        {FLOOR_PATHS.map((d, i) => (
          <g key={i} className={styles.seam}>
            <path className={styles.seamBase} d={d} pathLength={100} />
            <path
              className={styles.seamPulse}
              d={d}
              pathLength={100}
              // Stagger phase so the light appears to travel across the network.
              style={{animationDelay: `${-(i * 0.6)}s`}}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}

export default function ConstellationMap({
  activeId,
  onActivate,
}: ConstellationMapProps = {}): React.ReactElement {
  // Self-contained active state so the map works standalone. An external
  // `activeId` (once HORO-9 wires it through `index.tsx`) takes precedence,
  // but internal hover/focus still drives the standalone experience.
  const [internalActiveId, setInternalActiveId] = React.useState<string | null>(
    null,
  );

  const resolvedActiveId = internalActiveId ?? activeId ?? null;

  const handleActivate = React.useCallback(
    (id: string | null) => {
      setInternalActiveId(id);
      onActivate?.(id);
    },
    [onActivate],
  );

  return (
    <>
      {/* Terrace floor paving — anchored over the ground raster (see
          `.floorRoot`), NOT in the sky SVG, so the light lands on the stone. */}
      <FloorSeams activeId={resolvedActiveId} />
      <svg
        className={styles.root}
        style={{zIndex: LAYERS.constellations}}
        viewBox="0 0 1000 520"
        preserveAspectRatio="xMidYMin meet"
        focusable="false"
        role="group"
        aria-label="Product constellations">
        {PRODUCTS.map((p) => (
          <Constellation
            key={p.id}
            product={p}
            active={resolvedActiveId === p.id}
            onActivate={handleActivate}
          />
        ))}
      </svg>
    </>
  );
}

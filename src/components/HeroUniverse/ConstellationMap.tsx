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
 * A small perspective grid of terrace-floor joints drawn beneath the sky. Radial
 * seams fan from a horizon vanishing point down to the terrace front edge, with
 * a few transverse courses; the whole set ties the constellations to the floor.
 *
 * Geometry lives here (viewBox space), and each radial seam's owner is DERIVED
 * from the shared constellation data (nearest cluster centroid) rather than
 * duplicated into it — so seam ownership tracks the sky automatically. */
const FLOOR_VP: readonly [number, number] = [500, 300];
const FLOOR_BASE_Y = 520;
/** Front-edge x anchors of the terrace slabs, left → right. */
const SEAM_BASE_X = [60, 150, 300, 520, 700, 860, 1000] as const;
/** Transverse courses, as depth fractions from the horizon (0) to the front (1). */
const SEAM_COURSES = [0.5, 0.75, 1] as const;

const PRIMARY_ID = PRODUCTS.find((p) => p.tone === 'primary')?.id ?? null;

type Seam = {d: string; owner: string | null};

/** Centroid x of each product's constellation, from the shared geometry. */
function productCentroids(): Array<{id: string; cx: number}> {
  return PRODUCTS.map((p) => {
    const nodes = CONSTELLATIONS[p.id]?.nodes ?? [];
    const cx = nodes.reduce((sum, [x]) => sum + x, 0) / (nodes.length || 1);
    return {id: p.id, cx};
  });
}

/** The product whose constellation sits nearest (horizontally) above a seam. */
function nearestOwner(
  baseX: number,
  centroids: Array<{id: string; cx: number}>,
): string | null {
  let best: {id: string; cx: number} | null = null;
  for (const c of centroids) {
    if (!best || Math.abs(c.cx - baseX) < Math.abs(best.cx - baseX)) best = c;
  }
  return best?.id ?? null;
}

function buildSeams(): Seam[] {
  const centroids = productCentroids();
  const [vx, vy] = FLOOR_VP;
  const radial: Seam[] = SEAM_BASE_X.map((bx) => ({
    d: `M${vx} ${vy}L${bx} ${FLOOR_BASE_Y}`,
    owner: nearestOwner(bx, centroids),
  }));
  const left = SEAM_BASE_X[0];
  const right = SEAM_BASE_X[SEAM_BASE_X.length - 1];
  // Transverse courses span the fanned width and belong to no single product —
  // they carry the ambient network pulse only.
  const transverse: Seam[] = SEAM_COURSES.map((t) => {
    const y = vy + (FLOOR_BASE_Y - vy) * t;
    const lx = vx + (left - vx) * t;
    const rx = vx + (right - vx) * t;
    return {d: `M${lx} ${y}L${rx} ${y}`, owner: null};
  });
  return [...radial, ...transverse];
}

// Pure, deterministic, no browser globals → SSR-safe at module load.
const SEAMS: Seam[] = buildSeams();

/**
 * The luminous stone-floor seams. Driven by the same `activeId` that drives the
 * constellations, so pointer hover and keyboard focus light the floor
 * identically (accessibility parity). Idle → a slow travelling pulse; active →
 * the seams nearest the focused constellation flare (lead for the primary,
 * a cooler subtler flare for the rest).
 */
function FloorSeams({
  activeId,
}: {
  activeId: string | null;
}): React.ReactElement {
  return (
    <g className={styles.floor} aria-hidden="true">
      {SEAMS.map((seam, i) => {
        const owned = seam.owner != null && seam.owner === activeId;
        const state =
          activeId == null
            ? styles.idle
            : owned
              ? seam.owner === PRIMARY_ID
                ? clsx(styles.flare, styles.lead)
                : clsx(styles.flare, styles.cool)
              : styles.quiet;
        return (
          <g key={i} className={clsx(styles.seam, state)}>
            <path className={styles.seamBase} d={seam.d} pathLength={100} />
            <path
              className={styles.seamPulse}
              d={seam.d}
              pathLength={100}
              // Stagger phase so the light appears to travel across the network.
              style={{animationDelay: `${-(i * 0.9)}s`}}
            />
          </g>
        );
      })}
    </g>
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
    <svg
      className={styles.root}
      style={{zIndex: LAYERS.constellations}}
      viewBox="0 0 1000 520"
      preserveAspectRatio="xMidYMin meet"
      focusable="false"
      role="group"
      aria-label="Product constellations">
      {/* Stone-floor seams, painted first so they sit BENEATH the sky. */}
      <FloorSeams activeId={resolvedActiveId} />
      {PRODUCTS.map((p) => (
        <Constellation
          key={p.id}
          product={p}
          active={resolvedActiveId === p.id}
          onActivate={handleActivate}
        />
      ))}
    </svg>
  );
}

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
  const [lx, ly] = shape.label;
  const box = bbox(shape.nodes);

  return (
    <g
      className={clsx(styles.constellation, TONE_CLASS[product.tone], {
        [styles.active]: active,
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

      <polyline
        className={styles.link}
        points={points(shape.nodes)}
        pathLength={1}
        aria-hidden="true"
      />
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
        return (
          <circle
            key={i}
            className={clsx(styles.node, {[styles.anchor]: isAnchor})}
            cx={x}
            cy={y}
            r={isAnchor ? 6.5 : isPrimary ? 4.5 : 3}
            aria-hidden="true"
          />
        );
      })}
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

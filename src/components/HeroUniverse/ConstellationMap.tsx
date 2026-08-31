import React from 'react';
import clsx from 'clsx';
import {LAYERS} from './layers';
import {PRODUCT_REGISTRY, type ProductEntry} from '@site/src/data/productRegistry';
import {destinationLabel} from '@site/src/data/productDestinations';
import {CONSTELLATIONS, type Constellation as Shape} from './constellations';
import styles from './ConstellationMap.module.css';

/**
 * The sky map: one small constellation per product, drawn as an SVG overlay
 * from {@link PRODUCT_REGISTRY} + {@link CONSTELLATIONS}.
 *
 * HORO-284 PR-2 moved this off the old, stale `./products.ts` hardcoded array
 * (AI Agent Assembly, ArcheWeave, Harbinger) onto the real HORO-282 registry.
 * `CONSTELLATIONS` only has plotted sky geometry for `ai-agent-assembly` today
 * — Octans, Circinus and Ophiuchus have no celestial identity drawn yet, a
 * design task outside this structural PR (tracked as an open item on
 * HORO-284). Rather than draw an approximate/placeholder shape for them, this
 * map renders only registry entries that have a real plotted `Constellation`
 * — every entry is a real, live registry product, so there is no "coming
 * soon" concept left to apply here (the old `isReleased()` check this file
 * used to run has no registry-axis equivalent, and none is needed: a product
 * only enters the registry once the company is ready to show it publicly).
 *
 * Gold nodes joined by faint gold lines, with a label + tagline anchored
 * beside each cluster. The `order: 0` product burns brighter than the rest at
 * rest.
 *
 * Interactive (HORO-4, navigation fixed in HORO-38): renders as a real SVG
 * `<a href>` — not a synthetic `role="button"` element — so clicking (or
 * Enter on keyboard focus) actually opens `entry.canonicalUrl`, matching the
 * external-link convention `SystemMap` uses for the same product. On hover or
 * keyboard focus its connecting lines draw in, its nodes brighten, and its
 * label is emphasised.
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
  entry,
  shape,
  active,
  onActivate,
}: {
  entry: ProductEntry;
  shape: Shape;
  active: boolean;
  onActivate?: (id: string | null) => void;
}): React.ReactElement {
  const isPrimary = entry.order === 0;
  const [lx, ly] = shape.label;
  const box = bbox(shape.nodes);
  const figures = shape.figures ?? [shape.nodes.map((_, i) => i)];

  const glowHandlers = {
    onMouseEnter: () => onActivate?.(entry.id),
    onMouseLeave: () => onActivate?.(null),
    onFocus: () => onActivate?.(entry.id),
    onBlur: () => onActivate?.(null),
  };

  const groupClassName = clsx(
    styles.constellation,
    isPrimary ? styles.primary : styles.secondary,
    {[styles.active]: active},
  );

  const content = (
    <>
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
        {entry.name}
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
        {entry.tagline ?? entry.category}
      </text>
    </>
  );

  return (
    <a
      className={groupClassName}
      href={entry.canonicalUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${entry.name}, the ${shape.sky} constellation — opens ${destinationLabel(entry.canonicalUrl)}`}
      {...glowHandlers}>
      {content}
    </a>
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

  const shaped = PRODUCT_REGISTRY.filter((entry) => CONSTELLATIONS[entry.id]);

  return (
    <svg
      className={styles.root}
      style={{zIndex: LAYERS.constellations}}
      viewBox="0 0 1000 520"
      preserveAspectRatio="xMidYMin meet"
      focusable="false"
      role="group"
      aria-label="Product constellations">
      {shaped.map((entry) => (
        <Constellation
          key={entry.id}
          entry={entry}
          shape={CONSTELLATIONS[entry.id]}
          active={resolvedActiveId === entry.id}
          onActivate={handleActivate}
        />
      ))}
    </svg>
  );
}

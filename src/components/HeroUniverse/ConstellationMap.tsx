import React from 'react';
import {LAYERS} from './layers';
import {PRODUCTS, type Product} from './products';
import styles from './ConstellationMap.module.css';

/**
 * The sky map: one small constellation per product, drawn as a static SVG
 * overlay from {@link PRODUCTS}. Gold nodes joined by faint gold lines, with a
 * label + tagline anchored beside each cluster. The `primary` product burns
 * brighter than the rest.
 *
 * STUB SLOT — static and non-interactive for now.
 * // HORO-4 adds interactivity/hover/keyboard and links each constellation to
 * // its product.
 */

// Constellation geometry keyed by product id. Coordinates are in the SVG
// viewBox space (0..1000 x, 0..520 y). `nodes` draw as connected stars; `label`
// anchors the text block beside the cluster.
type Shape = {
  nodes: Array<[number, number]>;
  /** Optional internal star-map chords (index pairs into `nodes`). */
  chords?: Array<[number, number]>;
  label: [number, number];
  labelAlign: 'start' | 'end';
};

const SHAPES: Record<string, Shape> = {
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

function line(nodes: Array<[number, number]>): string {
  return nodes.map(([x, y]) => `${x},${y}`).join(' ');
}

function Constellation({product}: {product: Product}): React.ReactElement | null {
  const shape = SHAPES[product.id];
  if (!shape) return null;
  const isPrimary = product.tone === 'primary';
  const [lx, ly] = shape.label;

  return (
    <g className={isPrimary ? styles.primary : styles.dim}>
      <polyline className={styles.link} points={line(shape.nodes)} />
      {shape.chords?.map(([a, b], i) => (
        <line
          key={i}
          className={styles.chord}
          x1={shape.nodes[a][0]}
          y1={shape.nodes[a][1]}
          x2={shape.nodes[b][0]}
          y2={shape.nodes[b][1]}
        />
      ))}
      {shape.nodes.map(([x, y], i) => (
        <circle
          key={i}
          className={styles.node}
          cx={x}
          cy={y}
          r={isPrimary ? 4.5 : 3}
        />
      ))}
      <text
        className={styles.name}
        x={lx}
        y={ly}
        textAnchor={shape.labelAlign}>
        {product.name}
      </text>
      <text
        className={styles.tagline}
        x={lx}
        y={ly + 20}
        textAnchor={shape.labelAlign}>
        {product.tagline}
      </text>
    </g>
  );
}

export default function ConstellationMap(): React.ReactElement {
  return (
    <svg
      className={styles.root}
      style={{zIndex: LAYERS.constellations}}
      viewBox="0 0 1000 520"
      preserveAspectRatio="xMidYMin meet"
      role="img"
      aria-label="Product constellations: AI Agent Assembly, ArcheWeave, Harbinger, and more.">
      {PRODUCTS.map((p) => (
        <Constellation key={p.id} product={p} />
      ))}
    </svg>
  );
}

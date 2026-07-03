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
// viewBox space (0..1000 x, 0..500 y). `nodes` draw as connected stars; `label`
// anchors the text block beside the cluster.
type Shape = {
  nodes: Array<[number, number]>;
  label: [number, number];
  labelAlign: 'start' | 'end';
};

const SHAPES: Record<string, Shape> = {
  'ai-agent-assembly': {
    nodes: [
      [470, 210],
      [520, 150],
      [590, 165],
      [610, 235],
      [560, 285],
      [500, 270],
      [455, 300],
    ],
    label: [630, 210],
    labelAlign: 'start',
  },
  archeweave: {
    nodes: [
      [120, 120],
      [175, 95],
      [230, 130],
      [200, 185],
      [140, 175],
    ],
    label: [255, 120],
    labelAlign: 'start',
  },
  harbinger: {
    nodes: [
      [790, 110],
      [845, 90],
      [900, 120],
      [875, 175],
      [815, 170],
    ],
    label: [770, 110],
    labelAlign: 'end',
  },
  more: {
    nodes: [
      [820, 300],
      [870, 285],
      [910, 320],
      [865, 350],
    ],
    label: [790, 300],
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
      viewBox="0 0 1000 500"
      preserveAspectRatio="xMidYMin meet"
      role="img"
      aria-label="Product constellations: AI Agent Assembly, ArcheWeave, Harbinger, and more.">
      {PRODUCTS.map((p) => (
        <Constellation key={p.id} product={p} />
      ))}
    </svg>
  );
}

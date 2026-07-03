import React from 'react';
import {LAYERS} from './layers';
import styles from './EnvironmentProps.module.css';

/**
 * Foreground props resting on the platform beside the observer. For now a simple
 * static SVG hourglass; decorative (`aria-hidden`).
 *
 * STUB SLOT — a single static prop for now.
 * // HORO-6/8 draw the animated hourglass (sand mask) and apply `--wind` to the
 * // decorative props.
 */
export default function EnvironmentProps(): React.ReactElement {
  return (
    <div
      className={styles.root}
      style={{zIndex: LAYERS.props}}
      aria-hidden="true">
      <svg className={styles.hourglass} viewBox="0 0 60 90" fill="none">
        <path
          d="M12 8 h36 M12 82 h36 M16 8 C16 30 44 30 44 45 C44 60 16 60 16 82 M44 8 C44 30 16 30 16 45 C16 60 44 60 44 82"
          stroke="var(--hn-gold)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* settled sand */}
        <path
          d="M20 78 C20 66 40 66 40 78 Z"
          fill="var(--hn-gold-bright)"
          opacity="0.85"
        />
        <circle cx="30" cy="45" r="1.6" fill="var(--hn-gold-bright)" />
      </svg>
    </div>
  );
}

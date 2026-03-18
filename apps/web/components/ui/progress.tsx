import React from 'react';

interface ProgressProps {
  value: number;
  max?: number;
  color?: string;
  style?: React.CSSProperties;
}

export default function Progress({ value, max = 100, color, style }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="progress-track" style={style}>
      <div
        className="progress-fill"
        style={{
          width: `${pct}%`,
          ...(color ? { background: color } : {}),
        }}
      />
    </div>
  );
}

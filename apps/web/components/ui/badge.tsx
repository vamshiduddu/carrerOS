import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'amber' | 'red' | 'blue' | 'muted' | 'accent';
  style?: React.CSSProperties;
  className?: string;
}

export default function Badge({ children, variant = 'muted', style, className }: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className ?? ''}`} style={style}>
      {children}
    </span>
  );
}

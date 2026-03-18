import React from 'react';

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, style, className, onClick }: CardProps) {
  return (
    <div
      className={`panel ${className ?? ''}`}
      style={{ padding: '1.2rem', ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

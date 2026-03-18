import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && (
          <p style={{ margin: '0.2rem 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {actions}
        </div>
      )}
    </div>
  );
}

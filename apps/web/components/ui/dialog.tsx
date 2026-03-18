'use client';

import React from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: number | string;
}

export default function Dialog({ open, onClose, title, children, width = 480 }: DialogProps) {
  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="panel"
        style={{ width: typeof width === 'number' ? `min(${width}px, 100%)` : width, padding: '1.5rem' }}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
            <h2 style={{ margin: 0, fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.2rem', fontWeight: 600 }}>{title}</h2>
            <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

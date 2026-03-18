'use client';

import React from 'react';
import { X } from 'lucide-react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: 'left' | 'right';
}

export default function Sheet({ open, onClose, title, children, side = 'right' }: SheetProps) {
  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.35)',
        zIndex: 200,
        display: 'flex',
        justifyContent: side === 'right' ? 'flex-end' : 'flex-start',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(380px, 90vw)',
          height: '100%',
          background: 'var(--panel-solid)',
          borderLeft: side === 'right' ? '1px solid var(--line-solid)' : 'none',
          borderRight: side === 'left' ? '1px solid var(--line-solid)' : 'none',
          padding: '1.5rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          {title && (
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{title}</h2>
          )}
          <button className="btn btn-ghost btn-icon" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

'use client';

import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export default function ConfirmDialog({ title, message, onConfirm, onCancel, danger }: ConfirmDialogProps) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onCancel}
    >
      <div
        className="panel"
        style={{ width: 'min(420px, 100%)', padding: '1.5rem' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
          {danger && (
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'var(--danger-muted)', color: 'var(--danger)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <AlertTriangle size={20} />
            </div>
          )}
          <div>
            <h3 style={{ margin: '0 0 0.35rem', fontSize: '1rem', fontWeight: 700 }}>{title}</h3>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>{message}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

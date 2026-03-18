'use client';

import { AlertTriangle, Zap } from 'lucide-react';

interface AutoApplyToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export default function AutoApplyToggle({ enabled, onChange }: AutoApplyToggleProps) {
  return (
    <div style={{ display: 'grid', gap: '0.6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={16} style={{ color: enabled ? 'var(--accent-2)' : 'var(--muted)' }} />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Auto-Apply</span>
        </div>
        {/* Toggle switch */}
        <button
          onClick={() => onChange(!enabled)}
          style={{
            position: 'relative',
            width: 44, height: 24,
            borderRadius: 999,
            background: enabled ? 'var(--accent)' : 'var(--line-solid)',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.2s ease',
            flexShrink: 0,
          }}
          aria-checked={enabled}
          role="switch"
        >
          <span style={{
            position: 'absolute',
            top: 2,
            left: enabled ? 22 : 2,
            width: 20, height: 20,
            borderRadius: '50%',
            background: 'white',
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            transition: 'left 0.2s ease',
          }} />
        </button>
      </div>

      {enabled && (
        <div className="alert alert-warning">
          <AlertTriangle size={14} style={{ flexShrink: 0 }} />
          <span>AI will apply to matching jobs automatically. Make sure your resume and preferences are up to date.</span>
        </div>
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { X, Zap, Lock } from 'lucide-react';

interface UpgradeModalProps {
  onClose: () => void;
  feature: string;
}

export default function UpgradeModal({ onClose, feature }: UpgradeModalProps) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="panel"
        style={{ width: 'min(460px, 100%)', padding: '1.8rem', textAlign: 'center' }}
        onClick={e => e.stopPropagation()}
      >
        <button
          className="btn btn-ghost btn-icon"
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem' }}
        >
          <X size={18} />
        </button>

        <div style={{
          width: 60, height: 60, borderRadius: 16, margin: '0 auto 1.2rem',
          background: 'var(--accent-2-muted)', color: 'var(--accent-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Lock size={26} />
        </div>

        <h2 style={{ margin: '0 0 0.5rem', fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.3rem', fontWeight: 600 }}>
          Upgrade to Unlock
        </h2>

        <p style={{ margin: '0 0 0.75rem', color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--ink)' }}>{feature}</strong> is available on our Pro plan.
          Upgrade now to access this feature and supercharge your job search.
        </p>

        <div style={{
          background: 'var(--accent-2-muted)',
          border: '1px solid rgba(244,166,60,0.25)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.9rem 1rem',
          marginBottom: '1.2rem',
          textAlign: 'left',
        }}>
          <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.5rem', color: 'var(--accent-2)' }}>
            Pro Plan Includes:
          </div>
          {[
            'Unlimited AI resume improvements',
            'Full ATS keyword analysis',
            'Mock interview sessions',
            'Interview copilot & stealth overlay',
            'Auto-apply to matching jobs',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
              <Zap size={11} style={{ color: 'var(--accent-2)', flexShrink: 0 }} />
              {item}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={onClose}>Maybe Later</button>
          <Link
            href="/settings/subscription"
            className="btn"
            style={{
              background: 'linear-gradient(135deg, var(--accent-2), #e89520)',
              color: 'white',
              boxShadow: '0 4px 14px rgba(244,166,60,0.3)',
              gap: '0.4rem',
            }}
            onClick={onClose}
          >
            <Zap size={14} /> View Plans
          </Link>
        </div>
      </div>
    </div>
  );
}

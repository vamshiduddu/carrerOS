import Link from 'next/link';
import { Zap } from 'lucide-react';

interface UpgradeBannerProps {
  feature: string;
}

export default function UpgradeBanner({ feature }: UpgradeBannerProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1.1rem',
      background: 'var(--accent-2-muted)',
      border: '1px solid rgba(244,166,60,0.3)',
      borderRadius: 'var(--radius-sm)',
      fontSize: '0.875rem',
      fontWeight: 500,
    }}>
      <Zap size={16} style={{ color: 'var(--accent-2)', flexShrink: 0 }} />
      <span style={{ flex: 1, color: 'var(--ink)' }}>
        Upgrade to Pro to unlock <strong>{feature}</strong>
      </span>
      <Link
        href="/settings/subscription"
        className="btn btn-sm"
        style={{
          background: 'linear-gradient(135deg, var(--accent-2), #e89520)',
          color: 'white',
          boxShadow: '0 2px 8px rgba(244,166,60,0.3)',
          padding: '0.3rem 0.8rem',
          fontSize: '0.78rem',
        }}
      >
        Upgrade
      </Link>
    </div>
  );
}

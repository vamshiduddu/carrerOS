import { Check, Zap } from 'lucide-react';

interface Plan {
  name: string;
  displayName: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  limits?: Record<string, any>;
}

interface PlanCardProps {
  plan: Plan;
  current?: boolean;
  onSelect: () => void;
  popular?: boolean;
}

export default function PlanCard({ plan, current, onSelect, popular }: PlanCardProps) {
  const isFree = plan.priceMonthly === 0;

  return (
    <div
      className={`panel ${popular ? 'pricing-popular' : ''}`}
      style={{
        padding: '1.5rem',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {popular && (
        <div className="pricing-popular-badge">Most Popular</div>
      )}

      {current && (
        <span className="badge badge-green" style={{ alignSelf: 'flex-start', marginBottom: '0.75rem' }}>
          Current Plan
        </span>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ margin: '0 0 0.3rem', fontSize: '1.1rem', fontWeight: 700 }}>
          {plan.displayName}
        </h3>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--ink)' }}>
            {isFree ? 'Free' : `$${plan.priceMonthly}`}
          </span>
          {!isFree && (
            <span style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>/mo</span>
          )}
        </div>
        {!isFree && plan.priceYearly && (
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--success)' }}>
            ${plan.priceYearly}/yr — save {Math.round((1 - (plan.priceYearly / (plan.priceMonthly * 12))) * 100)}%
          </p>
        )}
      </div>

      <ul style={{ margin: '0 0 1.2rem', paddingLeft: 0, listStyle: 'none', display: 'grid', gap: '0.5rem', flex: 1 }}>
        {plan.features.map((feature, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem' }}>
            <Check size={14} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        className={`btn ${current ? 'btn-secondary' : 'btn-primary'}`}
        onClick={onSelect}
        disabled={current}
        style={{ width: '100%', justifyContent: 'center', gap: '0.4rem' }}
      >
        {current ? (
          'Current Plan'
        ) : (
          <>
            <Zap size={14} /> {isFree ? 'Get Started' : 'Upgrade'}
          </>
        )}
      </button>
    </div>
  );
}

interface UsageMeterProps {
  used: number;
  limit: number;
  label: string;
}

export default function UsageMeter({ used, limit, label }: UsageMeterProps) {
  const isUnlimited = limit <= 0 || limit === Infinity;
  const pct = isUnlimited ? 0 : Math.min(100, (used / limit) * 100);

  const fillColor = pct > 90
    ? 'var(--danger)'
    : pct > 70
    ? 'var(--warning)'
    : 'var(--success)';

  const bgColor = pct > 90
    ? 'var(--danger-muted)'
    : pct > 70
    ? 'var(--warning-muted)'
    : 'var(--success-muted)';

  return (
    <div style={{ display: 'grid', gap: '0.4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)' }}>{label}</span>
        <span style={{
          fontSize: '0.75rem', fontWeight: 700,
          padding: '0.15rem 0.5rem',
          borderRadius: 999,
          background: bgColor,
          color: fillColor,
        }}>
          {isUnlimited ? `${used} / ∞` : `${used} / ${limit}`}
        </span>
      </div>

      {!isUnlimited && (
        <>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${pct}%`,
                background: pct > 90
                  ? `linear-gradient(90deg, var(--danger), #e05a4a)`
                  : pct > 70
                  ? `linear-gradient(90deg, var(--warning), #e8a020)`
                  : undefined,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
          {pct > 80 && (
            <p style={{ margin: 0, fontSize: '0.72rem', color: fillColor }}>
              {pct > 90
                ? 'You have almost used your limit. Consider upgrading.'
                : 'You are approaching your usage limit.'}
            </p>
          )}
        </>
      )}
    </div>
  );
}

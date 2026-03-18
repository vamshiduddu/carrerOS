interface MatchScoreProps {
  score: number;
}

export default function MatchScore({ score }: MatchScoreProps) {
  const color = score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--warning)' : 'var(--danger)';
  const bg = score >= 70 ? 'var(--success-muted)' : score >= 40 ? 'var(--warning-muted)' : 'var(--danger-muted)';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.22rem 0.6rem',
      borderRadius: 999,
      fontSize: '0.75rem',
      fontWeight: 700,
      background: bg,
      color,
    }}>
      {score}% match
    </span>
  );
}

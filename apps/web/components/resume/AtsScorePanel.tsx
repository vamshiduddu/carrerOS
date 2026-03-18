import { CheckCircle, XCircle, Lightbulb } from 'lucide-react';

interface AtsScorePanelProps {
  score: number;
  found: string[];
  missing: string[];
  suggestions: string[];
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--accent-2)' : 'var(--danger)';
  const bg = score >= 70 ? 'var(--success-muted)' : score >= 40 ? 'var(--accent-2-muted)' : 'var(--danger-muted)';
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
      <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
        <svg width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={radius} fill="none" stroke="var(--line-solid)" strokeWidth="8" />
          <circle
            cx="48" cy="48" r={radius} fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={`${filled} ${circumference - filled}`}
            strokeLinecap="round"
            transform="rotate(-90 48 48)"
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 600 }}>/ 100</span>
        </div>
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>ATS Score</div>
        <div style={{
          display: 'inline-block', padding: '0.2rem 0.6rem',
          background: bg, color, borderRadius: 999, fontSize: '0.78rem', fontWeight: 600,
        }}>
          {score >= 70 ? 'Strong' : score >= 40 ? 'Fair' : 'Needs Work'}
        </div>
      </div>
    </div>
  );
}

export default function AtsScorePanel({ score, found, missing, suggestions }: AtsScorePanelProps) {
  return (
    <div style={{ display: 'grid', gap: '1.2rem' }}>
      <div className="panel" style={{ padding: '1.5rem' }}>
        <ScoreRing score={score} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Found Keywords */}
        <div className="panel" style={{ padding: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <CheckCircle size={16} style={{ color: 'var(--success)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Found ({found.length})</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {found.map(kw => (
              <span key={kw} className="badge badge-green">{kw}</span>
            ))}
            {found.length === 0 && <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>None found</span>}
          </div>
        </div>

        {/* Missing Keywords */}
        <div className="panel" style={{ padding: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <XCircle size={16} style={{ color: 'var(--danger)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Missing ({missing.length})</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {missing.map(kw => (
              <span key={kw} className="badge badge-red">{kw}</span>
            ))}
            {missing.length === 0 && <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>None missing</span>}
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="panel" style={{ padding: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Lightbulb size={16} style={{ color: 'var(--accent-2)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Suggestions</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'grid', gap: '0.4rem' }}>
            {suggestions.map((s, i) => (
              <li key={i} style={{ color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

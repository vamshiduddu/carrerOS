import { CheckCircle, TrendingUp, MessageSquare } from 'lucide-react';

interface ScoreReportProps {
  score: number;
  strengths: string[];
  improvements: string[];
  questions: any[];
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--warning)' : 'var(--danger)';
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const label = score >= 70 ? 'Excellent' : score >= 40 ? 'Good' : 'Needs Practice';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ position: 'relative', width: 130, height: 130 }}>
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r={radius} fill="none" stroke="var(--line-solid)" strokeWidth="10" />
          <circle
            cx="65" cy="65" r={radius} fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={`${filled} ${circumference - filled}`}
            strokeLinecap="round"
            transform="rotate(-90 65 65)"
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '2.2rem', fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600 }}>/ 100</span>
        </div>
      </div>
      <span style={{ fontWeight: 700, fontSize: '0.9rem', color }}>{label}</span>
    </div>
  );
}

export default function ScoreReport({ score, strengths, improvements, questions }: ScoreReportProps) {
  return (
    <div style={{ display: 'grid', gap: '1.2rem' }}>
      {/* Score header */}
      <div className="panel" style={{ padding: '1.8rem', textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 1rem', fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.3rem', fontWeight: 600 }}>
          Interview Report
        </h2>
        <ScoreRing score={score} />
        <p style={{ margin: '0.75rem 0 0', color: 'var(--muted)', fontSize: '0.875rem' }}>
          Overall performance across {questions.length} question{questions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Strengths & Improvements */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="panel" style={{ padding: '1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
            <CheckCircle size={15} style={{ color: 'var(--success)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--success)' }}>Strengths</span>
          </div>
          {strengths.length === 0 ? (
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.82rem' }}>—</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: '1rem', display: 'grid', gap: '0.3rem' }}>
              {strengths.map((s, i) => (
                <li key={i} style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>{s}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel" style={{ padding: '1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
            <TrendingUp size={15} style={{ color: 'var(--warning)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--warning)' }}>Improve</span>
          </div>
          {improvements.length === 0 ? (
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.82rem' }}>—</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: '1rem', display: 'grid', gap: '0.3rem' }}>
              {improvements.map((s, i) => (
                <li key={i} style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>{s}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Per-question breakdown */}
      {questions.length > 0 && (
        <div className="panel" style={{ padding: '1.2rem' }}>
          <h3 style={{ margin: '0 0 0.9rem', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MessageSquare size={15} style={{ color: 'var(--accent)' }} />
            Question Breakdown
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {questions.map((q: any, i: number) => (
              <div key={i} style={{ padding: '0.8rem', background: 'rgba(244,246,241,0.6)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line-solid)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.3rem' }}>
                  Q{i + 1}: {q.question || q.text || q.content || 'Question'}
                </div>
                {q.score !== undefined && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="progress-track" style={{ flex: 1 }}>
                      <div className="progress-fill" style={{ width: `${q.score}%` }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)', minWidth: 32 }}>
                      {q.score}%
                    </span>
                  </div>
                )}
                {q.feedback && (
                  <p style={{ margin: '0.35rem 0 0', color: 'var(--muted)', fontSize: '0.8rem', lineHeight: 1.5 }}>{q.feedback}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { CheckCircle, TrendingUp, Award } from 'lucide-react';

interface FeedbackPanelProps {
  strengths: string[];
  improvements: string[];
  score?: number;
}

export default function FeedbackPanel({ strengths, improvements, score }: FeedbackPanelProps) {
  return (
    <div className="panel" style={{ padding: '1.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Award size={16} style={{ color: 'var(--accent-2)' }} />
          AI Feedback
        </h3>
        {score !== undefined && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 52, height: 52, borderRadius: '50%',
            background: score >= 70 ? 'var(--success-muted)' : score >= 40 ? 'var(--warning-muted)' : 'var(--danger-muted)',
            border: `3px solid ${score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--warning)' : 'var(--danger)'}`,
            fontSize: '1.1rem', fontWeight: 800,
            color: score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--warning)' : 'var(--danger)',
          }}>
            {score}
          </div>
        )}
      </div>

      {/* Strengths */}
      {strengths.length > 0 && (
        <div style={{ marginBottom: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <CheckCircle size={14} style={{ color: 'var(--success)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--success)' }}>STRENGTHS</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1rem', display: 'grid', gap: '0.35rem' }}>
            {strengths.map((s, i) => (
              <li key={i} style={{ fontSize: '0.875rem', color: 'var(--ink)', lineHeight: 1.5 }}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {improvements.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <TrendingUp size={14} style={{ color: 'var(--warning)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--warning)' }}>AREAS TO IMPROVE</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1rem', display: 'grid', gap: '0.35rem' }}>
            {improvements.map((s, i) => (
              <li key={i} style={{ fontSize: '0.875rem', color: 'var(--ink)', lineHeight: 1.5 }}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {strengths.length === 0 && improvements.length === 0 && (
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.875rem' }}>No feedback available yet.</p>
      )}
    </div>
  );
}

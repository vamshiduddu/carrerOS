import { CheckCircle, XCircle } from 'lucide-react';

interface KeywordAnalysisProps {
  found: string[];
  missing: string[];
}

export default function KeywordAnalysis({ found, missing }: KeywordAnalysisProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
      {/* Found */}
      <div className="panel" style={{ padding: '1.1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <CheckCircle size={15} style={{ color: 'var(--success)' }} />
          <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Found Keywords</span>
          <span className="badge badge-green" style={{ marginLeft: 'auto' }}>{found.length}</span>
        </div>
        {found.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.82rem' }}>No keywords found yet.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {found.map(kw => (
              <span key={kw} className="badge badge-green">{kw}</span>
            ))}
          </div>
        )}
      </div>

      {/* Missing */}
      <div className="panel" style={{ padding: '1.1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <XCircle size={15} style={{ color: 'var(--danger)' }} />
          <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Missing Keywords</span>
          <span className="badge badge-red" style={{ marginLeft: 'auto' }}>{missing.length}</span>
        </div>
        {missing.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.82rem' }}>All keywords present!</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {missing.map(kw => (
              <span key={kw} className="badge badge-amber">{kw}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

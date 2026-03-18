'use client';

import { useState } from 'react';
import { api } from '../../lib/api';
import { Sparkles, ArrowRight } from 'lucide-react';

interface BulletRewriterProps {
  resumeId: string;
  onImproved: (text: string) => void;
}

export default function BulletRewriter({ resumeId, onImproved }: BulletRewriterProps) {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function improve() {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.post<{ improved: string }>(`/v1/resumes/${resumeId}/ai/improve`, { text });
      const improved = res.improved ?? '';
      setResult(improved);
      onImproved(improved);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to improve bullet');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel" style={{ padding: '1.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Sparkles size={16} style={{ color: 'var(--accent)' }} />
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>AI Bullet Rewriter</h3>
      </div>

      <div className="field-group" style={{ marginBottom: '0.75rem' }}>
        <label className="field-label">Paste your bullet point</label>
        <textarea
          className="textarea"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="e.g. Worked on backend features and helped the team..."
          rows={3}
        />
      </div>

      <button
        className="btn btn-primary btn-sm"
        onClick={improve}
        disabled={loading || !text.trim()}
        style={{ marginBottom: result || error ? '1rem' : 0 }}
      >
        <Sparkles size={13} />
        {loading ? 'Improving...' : 'Improve with AI'}
      </button>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '0.75rem' }}>{error}</div>
      )}

      {result && (
        <div style={{
          background: 'var(--accent-muted)',
          border: '1px solid rgba(18,120,90,0.2)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.9rem 1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <ArrowRight size={13} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Improved Version
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>{result}</p>
          <button
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '0.75rem' }}
            onClick={() => { setText(result); setResult(''); }}
          >
            Use this version
          </button>
        </div>
      )}
    </div>
  );
}

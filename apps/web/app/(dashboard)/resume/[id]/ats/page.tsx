'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '../../../../../lib/api';
import { ArrowLeft, Target, TrendingUp, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

type AtsResult = {
  score: number;
  keywords: { found: string[]; missing: string[] };
  suggestions: string[];
  grade: string;
};

export default function Page() {
  const params = useParams<{ id: string }>();
  const [result, setResult] = useState<AtsResult | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function runAts() {
    if (!jobDescription.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.post<AtsResult>(`/v1/resumes/${params.id}/ats`, {
        jobDescription: jobDescription.trim()
      });
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ATS check failed');
    } finally {
      setLoading(false);
    }
  }

  const scoreColor = !result ? 'var(--muted)' :
    result.score >= 75 ? 'var(--success)' :
    result.score >= 50 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href={`/resume/${params.id}`} className="btn btn-ghost btn-icon">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="page-title">ATS Score Checker</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', alignItems: 'start' }}>
        {/* Input */}
        <div className="panel" style={{ padding: '1.3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Target size={18} color="var(--accent)" />
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Job Description</h2>
          </div>
          <textarea
            className="textarea"
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here to see how well your resume matches the keywords and requirements..."
            rows={12}
          />
          {error && <div className="alert alert-error" style={{ marginTop: '0.75rem' }}>{error}</div>}
          <button
            className="btn btn-primary"
            onClick={runAts}
            disabled={loading || !jobDescription.trim()}
            style={{ marginTop: '0.9rem', width: '100%', justifyContent: 'center' }}
          >
            {loading ? 'Analyzing...' : <><Sparkles size={15} /> Analyze Resume Match</>}
          </button>
        </div>

        {/* Results */}
        <div style={{ display: 'grid', gap: '0.9rem' }}>
          {!result && !loading && (
            <div className="panel" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--accent-muted)', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.8rem' }}>
                <Target size={24} />
              </div>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
                Paste a job description and run the ATS check to see your match score.
              </p>
            </div>
          )}

          {result && (
            <>
              {/* Score */}
              <div className="panel" style={{ padding: '1.3rem', textAlign: 'center' }}>
                <div style={{
                  width: 100, height: 100,
                  borderRadius: '50%',
                  border: `6px solid ${scoreColor}`,
                  background: `${scoreColor}15`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.8rem',
                  flexDirection: 'column'
                }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{result.score}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>/ 100</span>
                </div>
                <h3 style={{ margin: '0 0 0.3rem', fontWeight: 700 }}>ATS Match Score</h3>
                <span style={{ display: 'inline-block', padding: '0.2rem 0.7rem', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700, background: `${scoreColor}15`, color: scoreColor }}>
                  {result.grade}
                </span>
              </div>

              {/* Found Keywords */}
              {result.keywords.found.length > 0 && (
                <div className="panel" style={{ padding: '1.1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <CheckCircle size={16} color="var(--success)" />
                    <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700 }}>
                      Matching Keywords ({result.keywords.found.length})
                    </h3>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {result.keywords.found.map(kw => (
                      <span key={kw} className="badge badge-green">{kw}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Keywords */}
              {result.keywords.missing.length > 0 && (
                <div className="panel" style={{ padding: '1.1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <AlertCircle size={16} color="var(--danger)" />
                    <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700 }}>
                      Missing Keywords ({result.keywords.missing.length})
                    </h3>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {result.keywords.missing.map(kw => (
                      <span key={kw} className="badge badge-red">{kw}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {result.suggestions.length > 0 && (
                <div className="panel" style={{ padding: '1.1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <TrendingUp size={16} color="var(--accent)" />
                    <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700 }}>Improvement Suggestions</h3>
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '0.5rem' }}>
                    {result.suggestions.map((s, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                        <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '3px' }}>→</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

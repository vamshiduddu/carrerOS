'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '../../../../../lib/api';
import { ArrowLeft, BarChart3, CheckCircle, TrendingUp, AlertCircle, RotateCcw } from 'lucide-react';

type Report = {
  score: number;
  grade?: string;
  strengths: string[];
  improvements: string[];
  summary?: string;
  questionScores?: { question: string; score: number }[];
};

export default function Page() {
  const params = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<Report>(`/v1/mock/${params.id}/report`)
      .then(setReport)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load report'));
  }, [params.id]);

  if (error) return (
    <div className="panel" style={{ padding: '2rem', textAlign: 'center' }}>
      <p style={{ color: 'var(--danger)', margin: '0 0 1rem' }}>{error}</p>
      <Link href="/mock" className="btn btn-secondary"><ArrowLeft size={15} /> Back to Mock</Link>
    </div>
  );

  if (!report) return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {[1,2,3].map(n => <div key={n} className="skeleton" style={{ height: 100, borderRadius: 18 }} />)}
    </div>
  );

  const scoreColor = report.score >= 75 ? 'var(--success)' : report.score >= 50 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/mock" className="btn btn-ghost btn-icon"><ArrowLeft size={18} /></Link>
          <h1 className="page-title">Interview Report</h1>
        </div>
        <Link href="/mock" className="btn btn-secondary btn-sm">
          <RotateCcw size={14} /> Practice Again
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.2rem', alignItems: 'start' }}>
        {/* Score Card */}
        <div style={{ display: 'grid', gap: '0.8rem' }}>
          <div className="panel" style={{ padding: '1.5rem', textAlign: 'center', background: `linear-gradient(135deg, ${scoreColor}08, ${scoreColor}05)` }}>
            <div style={{
              width: 110, height: 110,
              borderRadius: '50%',
              border: `7px solid ${scoreColor}`,
              background: `${scoreColor}12`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              marginBottom: '0.9rem'
            }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{report.score}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.1rem' }}>/ 100</span>
            </div>
            <h3 style={{ margin: '0 0 0.3rem', fontWeight: 700 }}>Overall Score</h3>
            {report.grade && (
              <span style={{ display: 'inline-block', padding: '0.25rem 0.8rem', borderRadius: 999, fontSize: '0.82rem', fontWeight: 700, background: `${scoreColor}15`, color: scoreColor }}>
                Grade: {report.grade}
              </span>
            )}
          </div>

          {/* Progress bars for question scores */}
          {report.questionScores && report.questionScores.length > 0 && (
            <div className="panel" style={{ padding: '1.1rem' }}>
              <h3 style={{ margin: '0 0 0.8rem', fontSize: '0.875rem', fontWeight: 700 }}>Per-Question Scores</h3>
              {report.questionScores.map((qs, i) => (
                <div key={i} style={{ marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>Q{i + 1}</span>
                    <span style={{ fontWeight: 700, color: qs.score >= 75 ? 'var(--success)' : 'var(--warning)' }}>{qs.score}</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${qs.score}%`, background: qs.score >= 75 ? 'linear-gradient(90deg, var(--success), #34d399)' : 'linear-gradient(90deg, var(--warning), #fbbf24)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div style={{ display: 'grid', gap: '1rem' }}>
          {report.summary && (
            <div className="panel" style={{ padding: '1.3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <BarChart3 size={16} color="var(--accent)" />
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Performance Summary</h3>
              </div>
              <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.7, fontSize: '0.9rem' }}>{report.summary}</p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Strengths */}
            <div className="panel" style={{ padding: '1.3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <CheckCircle size={16} color="var(--success)" />
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Strengths</h3>
              </div>
              {report.strengths.length === 0 ? (
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.875rem' }}>Complete the session to see strengths.</p>
              ) : (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '0.5rem' }}>
                  {report.strengths.map((item) => (
                    <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', lineHeight: 1.5 }}>
                      <span style={{ color: 'var(--success)', flexShrink: 0, marginTop: '3px' }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Improvements */}
            <div className="panel" style={{ padding: '1.3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <TrendingUp size={16} color="var(--accent)" />
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>To Improve</h3>
              </div>
              {report.improvements.length === 0 ? (
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.875rem' }}>No improvements needed — great job!</p>
              ) : (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '0.5rem' }}>
                  {report.improvements.map((item) => (
                    <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', lineHeight: 1.5 }}>
                      <AlertCircle size={13} color="var(--warning)" style={{ flexShrink: 0, marginTop: '3px' }} />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="panel" style={{ padding: '1.2rem', display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'linear-gradient(135deg, rgba(18,120,90,0.05), rgba(244,166,60,0.04))' }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>Ready to improve your score?</p>
              <p style={{ margin: '0.2rem 0 0', color: 'var(--muted)', fontSize: '0.82rem' }}>Practice another mock session to build confidence and track progress.</p>
            </div>
            <Link href="/mock" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
              <RotateCcw size={13} /> Practice Again
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

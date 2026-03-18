'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import { ArrowLeft, Building2, MapPin, ExternalLink, TrendingUp, Zap, Clock } from 'lucide-react';

type Job = {
  id: string;
  title: string;
  company: string;
  location?: string;
  source: string;
  url?: string;
  description?: string;
  salary?: string;
  remote?: boolean;
  matchScore?: number;
  postedAt?: string;
};

export default function Page() {
  const params = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    api.get<Job>(`/v1/jobs/${params.id}`)
      .then(setJob)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load job'));
  }, [params.id]);

  async function quickApply() {
    if (!job) return;
    setApplying(true);
    try {
      await api.post('/v1/applications', { company: job.company, role: job.title, status: 'applied', jobId: job.id });
      setApplied(true);
    } catch { /* silent */ }
    finally { setApplying(false); }
  }

  if (error) return (
    <div className="panel" style={{ padding: '2rem', textAlign: 'center' }}>
      <p style={{ color: 'var(--danger)', margin: '0 0 1rem' }}>{error}</p>
      <Link href="/jobs" className="btn btn-secondary"><ArrowLeft size={15} /> Back to Jobs</Link>
    </div>
  );

  if (!job) return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {[1,2].map(n => <div key={n} className="skeleton" style={{ height: 120, borderRadius: 18 }} />)}
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/jobs" className="btn btn-ghost btn-icon"><ArrowLeft size={18} /></Link>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.5rem' }}>{job.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--muted)', fontSize: '0.875rem' }}>
                <Building2 size={14} /> {job.company}
              </span>
              {job.location && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--muted)', fontSize: '0.875rem' }}>
                  <MapPin size={13} /> {job.location}
                </span>
              )}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {job.url && (
            <a href={job.url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
              <ExternalLink size={13} /> View Original
            </a>
          )}
          <button
            className={`btn btn-sm ${applied ? 'btn-secondary' : 'btn-primary'}`}
            onClick={quickApply}
            disabled={applying || applied}
          >
            <Zap size={13} /> {applied ? 'Added to Pipeline' : applying ? 'Adding...' : 'Quick Apply'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '1.2rem', alignItems: 'start' }}>
        {/* Main content */}
        <div className="panel" style={{ padding: '1.4rem' }}>
          {job.description ? (
            <>
              <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 }}>Job Description</h2>
              <div style={{ color: 'var(--muted)', lineHeight: 1.75, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                {job.description}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--muted)' }}>
              <p style={{ margin: 0 }}>No description available for this listing.</p>
              {job.url && (
                <a href={job.url} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem', display: 'inline-flex' }}>
                  <ExternalLink size={13} /> View on Job Board
                </a>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'grid', gap: '0.8rem', position: 'sticky', top: 80 }}>
          <div className="panel" style={{ padding: '1.1rem' }}>
            <h3 style={{ margin: '0 0 0.8rem', fontSize: '0.875rem', fontWeight: 700 }}>Details</h3>
            <div style={{ display: 'grid', gap: '0.6rem' }}>
              {[
                { label: 'Source', value: job.source },
                { label: 'Type', value: job.remote ? 'Remote' : 'On-site' },
                ...(job.salary ? [{ label: 'Salary', value: job.salary }] : []),
                ...(job.postedAt ? [{ label: 'Posted', value: new Date(job.postedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }] : [])
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--muted)' }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {job.matchScore != null && (
            <div className="panel" style={{ padding: '1.1rem', textAlign: 'center' }}>
              <TrendingUp size={18} color="var(--accent)" style={{ marginBottom: '0.4rem' }} />
              <div style={{ fontSize: '2rem', fontWeight: 800, color: job.matchScore >= 75 ? 'var(--success)' : 'var(--warning)' }}>
                {job.matchScore}%
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.2rem' }}>Profile Match</div>
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={quickApply}
            disabled={applying || applied}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Zap size={15} />
            {applied ? 'Added to Pipeline' : applying ? 'Adding...' : 'Add to Pipeline'}
          </button>
        </div>
      </div>
    </div>
  );
}

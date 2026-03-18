'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { Search, MapPin, Building2, TrendingUp, Zap, Filter } from 'lucide-react';

type Job = {
  id: string;
  title: string;
  company: string;
  location?: string;
  source: string;
  matchScore?: number;
  salary?: string;
  remote?: boolean;
  postedAt?: string;
};

export default function Page() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);

  async function loadJobs(q?: string) {
    setFiltering(true);
    const endpoint = q ? `/v1/jobs?q=${encodeURIComponent(q)}` : '/v1/jobs';
    const data = await api.get<Job[]>(endpoint).catch(() => []);
    setJobs(Array.isArray(data) ? data : []);
    setLoading(false);
    setFiltering(false);
  }

  useEffect(() => { loadJobs(); }, []);

  async function onSearch(event: FormEvent) {
    event.preventDefault();
    await loadJobs(query);
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Job Matches</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.875rem' }}>
          <TrendingUp size={16} color="var(--accent)" />
          <span>{jobs.length} roles found</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="panel" style={{ padding: '1rem 1.2rem', marginBottom: '1.2rem' }}>
        <form onSubmit={onSearch} style={{ display: 'flex', gap: '0.6rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} />
            <input
              className="input"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by title, company, skill..."
              style={{ paddingLeft: '2.3rem' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={filtering}>
            {filtering ? 'Searching...' : <><Search size={15} /> Search</>}
          </button>
        </form>
      </div>

      {/* Job Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {[1,2,3,4,5,6].map(n => <div key={n} className="skeleton" style={{ height: 180, borderRadius: 18 }} />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="panel" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--accent-muted)', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Search size={26} />
          </div>
          <h3 style={{ margin: '0 0 0.4rem', fontWeight: 700 }}>No jobs found</h3>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
            {query ? `No results for "${query}". Try different keywords.` : 'Job listings are synced periodically. Check back soon.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {jobs.map((job) => (
            <article key={job.id} className="panel" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '10px',
                  background: 'var(--accent-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Building2 size={18} color="var(--accent)" />
                </div>
                {job.matchScore != null && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                    padding: '0.2rem 0.5rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700,
                    background: job.matchScore >= 75 ? 'rgba(26,140,90,0.1)' : job.matchScore >= 50 ? 'rgba(244,166,60,0.12)' : 'rgba(79,95,81,0.08)',
                    color: job.matchScore >= 75 ? 'var(--success)' : job.matchScore >= 50 ? 'var(--warning)' : 'var(--muted)'
                  }}>
                    <TrendingUp size={10} />
                    {job.matchScore}% match
                  </span>
                )}
              </div>

              <h3 style={{ margin: '0 0 0.25rem', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3 }}>{job.title}</h3>
              <div style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Building2 size={12} />{job.company}
              </div>
              {job.location && (
                <div style={{ color: 'var(--muted)', fontSize: '0.78rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={11} />{job.location}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.35rem', marginBottom: 'auto', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                <span style={{ padding: '0.15rem 0.5rem', borderRadius: 999, fontSize: '0.7rem', background: 'rgba(79,95,81,0.06)', color: 'var(--muted)', fontWeight: 500 }}>
                  {job.source}
                </span>
                {job.remote && (
                  <span style={{ padding: '0.15rem 0.5rem', borderRadius: 999, fontSize: '0.7rem', background: 'rgba(14,165,233,0.08)', color: '#0ea5e9', fontWeight: 600 }}>
                    Remote
                  </span>
                )}
                {job.salary && (
                  <span style={{ padding: '0.15rem 0.5rem', borderRadius: 999, fontSize: '0.7rem', background: 'rgba(26,140,90,0.08)', color: 'var(--success)', fontWeight: 600 }}>
                    {job.salary}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.9rem' }}>
                <Link href={`/jobs/${job.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                  View Details
                </Link>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => api.post('/v1/applications', { company: job.company, role: job.title, status: 'applied', jobId: job.id }).catch(() => {})}
                  title="Quick apply"
                >
                  <Zap size={13} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

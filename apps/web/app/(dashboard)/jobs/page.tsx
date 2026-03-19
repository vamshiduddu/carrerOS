'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { api } from '../../../lib/api';
import { Search, MapPin, Building2, TrendingUp, Zap, RefreshCw, ExternalLink } from 'lucide-react';
import { useJobMatches } from '../../../hooks/useJobMatches';
import JobPreferencesPanel from '../../../components/jobs/JobPreferencesPanel';

export default function Page() {
  const { matches, prefs, loading, refreshing, savePreferences, forceRefresh } = useJobMatches();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [searching, setSearching] = useState(false);

  async function onSearch(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) { setSearchResults(null); return; }
    setSearching(true);
    const data = await api.get<any[]>(`/v1/jobs?q=${encodeURIComponent(query)}`).catch(() => []);
    setSearchResults(Array.isArray(data) ? data : []);
    setSearching(false);
  }

  // Show search results if user searched, otherwise show matches
  const displayJobs = searchResults !== null
    ? searchResults.map((j) => ({ job: j, matchScore: null }))
    : matches;

  const hasCustomPrefs = prefs.titles.length > 0 || prefs.keywords.length > 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Job Matches</h1>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.85rem' }}>
            {refreshing
              ? 'Pulling live jobs from Arbeitnow & Remotive…'
              : hasCustomPrefs
                ? `${matches.length} matched roles · updates live`
                : `${matches.length} Software Engineer roles in the USA · customise with Preferences`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={forceRefresh} disabled={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            Refresh
          </button>
          <JobPreferencesPanel prefs={prefs} saving={refreshing} onSave={savePreferences} />
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
              onChange={(e) => { setQuery(e.target.value); if (!e.target.value) setSearchResults(null); }}
              placeholder="Search by title, company, skill…"
              style={{ paddingLeft: '2.3rem' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={searching}>
            {searching ? 'Searching…' : <><Search size={15} /> Search</>}
          </button>
        </form>
      </div>

      {/* Live refresh banner */}
      {refreshing && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          padding: '0.75rem 1rem', borderRadius: 12, marginBottom: '1rem',
          background: 'var(--accent-muted)', color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 500
        }}>
          <RefreshCw size={14} className="spin" />
          Pulling live jobs based on your preferences…
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {[1,2,3,4,5,6].map((n) => <div key={n} className="skeleton" style={{ height: 200, borderRadius: 18 }} />)}
        </div>
      )}

      {/* Job cards */}
      {!loading && displayJobs.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {displayJobs.map(({ job, matchScore }) => (
            <article key={job.id} className="panel" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ width: 38, height: 38, borderRadius: '10px', background: 'var(--accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Building2 size={18} color="var(--accent)" />
                </div>
                {matchScore != null && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                    padding: '0.2rem 0.5rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700,
                    background: matchScore >= 75 ? 'rgba(26,140,90,0.1)' : matchScore >= 50 ? 'rgba(244,166,60,0.12)' : 'rgba(79,95,81,0.08)',
                    color: matchScore >= 75 ? 'var(--success)' : matchScore >= 50 ? 'var(--warning)' : 'var(--muted)'
                  }}>
                    <TrendingUp size={10} />{matchScore}% match
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

              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.3rem', marginBottom: 'auto' }}>
                {job.remote && (
                  <span style={{ padding: '0.15rem 0.5rem', borderRadius: 999, fontSize: '0.7rem', background: 'rgba(14,165,233,0.08)', color: '#0ea5e9', fontWeight: 600 }}>Remote</span>
                )}
                {job.jobType && (
                  <span style={{ padding: '0.15rem 0.5rem', borderRadius: 999, fontSize: '0.7rem', background: 'rgba(79,95,81,0.06)', color: 'var(--muted)', fontWeight: 500 }}>{job.jobType}</span>
                )}
                {job.salary && (
                  <span style={{ padding: '0.15rem 0.5rem', borderRadius: 999, fontSize: '0.7rem', background: 'rgba(26,140,90,0.08)', color: 'var(--success)', fontWeight: 600 }}>{job.salary}</span>
                )}
                {(job.tags ?? []).slice(0, 2).map((tag: string) => (
                  <span key={tag} style={{ padding: '0.15rem 0.5rem', borderRadius: 999, fontSize: '0.7rem', background: 'rgba(79,95,81,0.06)', color: 'var(--muted)' }}>{tag}</span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.9rem' }}>
                <Link href={`/jobs/${job.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                  View Details
                </Link>
                {job.url && (
                  <a href={job.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" title="Open original posting">
                    <ExternalLink size={13} />
                  </a>
                )}
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

      {/* No search results */}
      {!loading && searchResults !== null && searchResults.length === 0 && (
        <div className="panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <p style={{ margin: 0, color: 'var(--muted)' }}>No results for "{query}"</p>
        </div>
      )}
    </div>
  );
}

import { MapPin, Wifi, DollarSign, Plus, Building2, Calendar, ExternalLink } from 'lucide-react';
import MatchScore from './MatchScore';

interface JobDetailProps {
  job: any;
  onApply?: () => void;
}

function formatSalary(min?: number, max?: number): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  if (max) return `Up to ${fmt(max)}`;
  return null;
}

export default function JobDetail({ job, onApply }: JobDetailProps) {
  const salary = formatSalary(job.salaryMin, job.salaryMax);
  const postedDate = job.postedAt
    ? new Date(job.postedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div style={{ display: 'grid', gap: '1.2rem' }}>
      {/* Header */}
      <div className="panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div>
            <h1 style={{ margin: '0 0 0.3rem', fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.4rem', fontWeight: 600 }}>
              {job.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
              <Building2 size={14} /> {job.company}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {job.matchScore !== undefined && <MatchScore score={job.matchScore} />}
            <button className="btn btn-primary" onClick={onApply} style={{ gap: '0.4rem' }}>
              <Plus size={15} /> Add to Pipeline
            </button>
          </div>
        </div>

        {/* Meta badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
          {job.location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: 'var(--muted)', background: 'rgba(79,95,81,0.08)', padding: '0.25rem 0.65rem', borderRadius: 999 }}>
              <MapPin size={12} /> {job.location}
            </span>
          )}
          {job.remote && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: 'var(--accent)', background: 'var(--accent-muted)', padding: '0.25rem 0.65rem', borderRadius: 999 }}>
              <Wifi size={12} /> Remote
            </span>
          )}
          {salary && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: 'var(--muted)', background: 'rgba(79,95,81,0.08)', padding: '0.25rem 0.65rem', borderRadius: 999 }}>
              <DollarSign size={12} /> {salary}
            </span>
          )}
          {postedDate && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: 'var(--muted)', background: 'rgba(79,95,81,0.08)', padding: '0.25rem 0.65rem', borderRadius: 999 }}>
              <Calendar size={12} /> Posted {postedDate}
            </span>
          )}
          {job.jobUrl && (
            <a
              href={job.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: 'var(--accent)', background: 'var(--accent-muted)', padding: '0.25rem 0.65rem', borderRadius: 999, textDecoration: 'none' }}
            >
              <ExternalLink size={12} /> View Posting
            </a>
          )}
        </div>
      </div>

      {/* Description */}
      {job.description && (
        <div className="panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 700 }}>Job Description</h2>
          <div style={{ color: 'var(--ink)', fontSize: '0.9rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {job.description}
          </div>
        </div>
      )}

      {/* Requirements */}
      {(job.requirements || Array.isArray(job.requirements)) && (
        <div className="panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 700 }}>Requirements</h2>
          {Array.isArray(job.requirements) ? (
            <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'grid', gap: '0.4rem' }}>
              {job.requirements.map((req: string, i: number) => (
                <li key={i} style={{ fontSize: '0.9rem', color: 'var(--ink)', lineHeight: 1.6 }}>{req}</li>
              ))}
            </ul>
          ) : (
            <div style={{ color: 'var(--ink)', fontSize: '0.9rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {job.requirements}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

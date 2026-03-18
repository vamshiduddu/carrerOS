import { MapPin, Wifi, DollarSign, Plus } from 'lucide-react';
import MatchScore from './MatchScore';

interface Job {
  id: string;
  title: string;
  company: string;
  location?: string;
  remote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  matchScore?: number;
}

interface JobCardProps {
  job: Job;
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

export default function JobCard({ job, onApply }: JobCardProps) {
  const salary = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <div className="panel" style={{ padding: '1.1rem 1.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.6rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.15rem' }}>{job.title}</div>
          <div style={{ color: 'var(--muted)', fontSize: '0.82rem', fontWeight: 500 }}>{job.company}</div>
        </div>
        {job.matchScore !== undefined && <MatchScore score={job.matchScore} />}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.9rem' }}>
        {job.location && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: 'var(--muted)' }}>
            <MapPin size={11} /> {job.location}
          </span>
        )}
        {job.remote && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: 'var(--accent)', background: 'var(--accent-muted)', padding: '0.1rem 0.5rem', borderRadius: 999 }}>
            <Wifi size={10} /> Remote
          </span>
        )}
        {salary && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: 'var(--muted)' }}>
            <DollarSign size={11} /> {salary}
          </span>
        )}
      </div>

      <button
        className="btn btn-primary btn-sm"
        onClick={onApply}
        style={{ gap: '0.35rem' }}
      >
        <Plus size={13} /> Add to Pipeline
      </button>
    </div>
  );
}

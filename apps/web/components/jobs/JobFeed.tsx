import JobCard from './JobCard';
import LoadingSkeleton from '../shared/LoadingSkeleton';
import EmptyState from '../shared/EmptyState';

interface JobFeedProps {
  jobs: any[];
  loading: boolean;
  onApply: (jobId: string) => void;
}

export default function JobFeed({ jobs, loading, onApply }: JobFeedProps) {
  if (loading) {
    return <LoadingSkeleton rows={6} type="card" />;
  }

  if (jobs.length === 0) {
    return (
      <div className="panel" style={{ padding: '1.5rem' }}>
        <EmptyState
          title="No jobs found"
          description="Try adjusting your filters or check back later for new opportunities."
          action={{ label: 'Browse All Jobs', href: '/jobs' }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
      {jobs.map(job => (
        <JobCard
          key={job.id}
          job={job}
          onApply={() => onApply(job.id)}
        />
      ))}
    </div>
  );
}

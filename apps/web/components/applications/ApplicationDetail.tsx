import { Building2, Briefcase, Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import TimelineView from './TimelineView';

interface ApplicationDetailProps {
  application: any;
  timeline: any[];
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  saved:      { label: 'Saved',     color: 'var(--muted)',   bg: 'rgba(79,95,81,0.1)' },
  applied:    { label: 'Applied',   color: '#0ea5e9',        bg: 'rgba(14,165,233,0.1)' },
  screening:  { label: 'Screening', color: 'var(--warning)', bg: 'rgba(244,166,60,0.1)' },
  interview:  { label: 'Interview', color: '#9333ea',        bg: 'rgba(147,51,234,0.08)' },
  offer:      { label: 'Offer',     color: 'var(--success)', bg: 'rgba(26,140,90,0.1)' },
  rejected:   { label: 'Rejected',  color: 'var(--danger)',  bg: 'rgba(211,68,53,0.08)' },
};

export default function ApplicationDetail({ application, timeline }: ApplicationDetailProps) {
  const meta = STATUS_META[application.status] ?? STATUS_META.saved;
  const createdDate = new Date(application.createdAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div style={{ display: 'grid', gap: '1.2rem' }}>
      {/* Header card */}
      <div className="panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'var(--accent-muted)', color: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Building2 size={20} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{application.company}</h2>
                <div style={{ color: 'var(--muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Briefcase size={13} /> {application.role}
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{
              padding: '0.3rem 0.8rem', borderRadius: 999,
              fontSize: '0.82rem', fontWeight: 700,
              background: meta.bg, color: meta.color,
            }}>
              {meta.label}
            </span>
            <Link href={`/applications/${application.id}/edit`} className="btn btn-secondary btn-sm">
              Edit
            </Link>
          </div>
        </div>

        <div className="divider" />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
          {[
            { label: 'Applied', value: createdDate, icon: Clock },
            ...(application.jobUrl ? [{ label: 'Job Posting', value: 'View', icon: ExternalLink, href: application.jobUrl }] : []),
            ...(application.salary ? [{ label: 'Salary', value: application.salary }] : []),
            ...(application.location ? [{ label: 'Location', value: application.location }] : []),
          ].map((item, i) => (
            <div key={i}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: '0.2rem' }}>
                {item.label}
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                {(item as any).href ? (
                  <a href={(item as any).href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {item.value} <ExternalLink size={11} />
                  </a>
                ) : item.value}
              </div>
            </div>
          ))}
        </div>

        {application.notes && (
          <>
            <div className="divider" />
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: '0.4rem' }}>
                Notes
              </div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--ink)', lineHeight: 1.6 }}>{application.notes}</p>
            </div>
          </>
        )}
      </div>

      {/* Timeline */}
      <div className="panel" style={{ padding: '1.2rem' }}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>
          Activity Timeline
        </h3>
        <TimelineView events={timeline} />
      </div>
    </div>
  );
}

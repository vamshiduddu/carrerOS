'use client';

import { useRouter } from 'next/navigation';
import { Building2, Briefcase, Clock } from 'lucide-react';

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  saved:      { label: 'Saved',     color: 'var(--muted)',   bg: 'rgba(79,95,81,0.1)' },
  applied:    { label: 'Applied',   color: '#0ea5e9',        bg: 'rgba(14,165,233,0.1)' },
  screening:  { label: 'Screening', color: 'var(--warning)', bg: 'rgba(244,166,60,0.1)' },
  interview:  { label: 'Interview', color: '#9333ea',        bg: 'rgba(147,51,234,0.08)' },
  offer:      { label: 'Offer',     color: 'var(--success)', bg: 'rgba(26,140,90,0.1)' },
  rejected:   { label: 'Rejected',  color: 'var(--danger)',  bg: 'rgba(211,68,53,0.08)' },
};

interface ApplicationCardProps {
  application: {
    id: string;
    company: string;
    role: string;
    status: string;
    createdAt: string;
  };
  onClick?: () => void;
}

export default function ApplicationCard({ application, onClick }: ApplicationCardProps) {
  const router = useRouter();
  const meta = STATUS_META[application.status] ?? STATUS_META.saved;
  const date = new Date(application.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  });

  function handleClick() {
    if (onClick) {
      onClick();
    } else {
      router.push(`/applications/${application.id}`);
    }
  }

  return (
    <div
      className="panel"
      style={{ padding: '0.9rem 1rem', cursor: 'pointer' }}
      onClick={handleClick}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontWeight: 700, fontSize: '0.9rem',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}>
            <Building2 size={13} style={{ color: 'var(--muted)', flexShrink: 0 }} />
            {application.company}
          </div>
          <div style={{
            color: 'var(--muted)', fontSize: '0.8rem', marginTop: '0.1rem',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}>
            <Briefcase size={11} style={{ flexShrink: 0 }} />
            {application.role}
          </div>
        </div>
        <span style={{
          padding: '0.2rem 0.55rem', borderRadius: 999,
          fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
          background: meta.bg, color: meta.color,
        }}>
          {meta.label}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--muted)', fontSize: '0.72rem' }}>
        <Clock size={10} />
        {date}
      </div>
    </div>
  );
}

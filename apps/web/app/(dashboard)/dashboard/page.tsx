'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { FileText, Briefcase, Mic, TrendingUp, ArrowRight, Plus, Clock } from 'lucide-react';

type MeResponse = { user: { fullName: string; email: string } };
type Application = { id: string; company: string; role: string; status: string; updatedAt: string };
type Resume = { id: string; title: string; updatedAt: string };

const statusColors: Record<string, { bg: string; color: string }> = {
  saved:      { bg: 'rgba(79,95,81,0.1)',     color: 'var(--muted)' },
  applied:    { bg: 'rgba(14,165,233,0.1)',   color: '#0ea5e9' },
  screening:  { bg: 'rgba(244,166,60,0.12)',  color: 'var(--warning)' },
  interview:  { bg: 'rgba(244,166,60,0.12)',  color: 'var(--warning)' },
  offer:      { bg: 'rgba(26,140,90,0.1)',    color: 'var(--success)' },
  rejected:   { bg: 'rgba(211,68,53,0.1)',    color: 'var(--danger)' }
};

function StatusBadge({ status }: { status: string }) {
  const s = statusColors[status] ?? statusColors.saved;
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.2rem 0.55rem',
      borderRadius: '999px',
      fontSize: '0.72rem',
      fontWeight: 600,
      background: s.bg,
      color: s.color
    }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function Page() {
  const [name, setName] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);

  useEffect(() => {
    api.get<MeResponse>('/v1/auth/me')
      .then((r) => setName(r.user?.fullName?.split(' ')[0] || 'there'))
      .catch(() => setName('there'));

    Promise.all([
      api.get<Application[]>('/v1/applications').catch(() => []),
      api.get<Resume[]>('/v1/resumes').catch(() => [])
    ]).then(([apps, rsum]) => {
      setApplications(Array.isArray(apps) ? apps.slice(0, 5) : []);
      setResumes(Array.isArray(rsum) ? rsum : []);
      setLoadingApps(false);
    });
  }, []);

  const kpis = [
    { label: 'Resumes', value: resumes.length, icon: FileText, color: '#12785a', bg: 'rgba(18,120,90,0.1)', href: '/resume' },
    { label: 'Applications', value: applications.length, icon: Briefcase, color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)', href: '/applications' },
    { label: 'Interviews', value: applications.filter(a => a.status === 'interview').length, icon: Mic, color: '#9333ea', bg: 'rgba(147,51,234,0.1)', href: '/interview' },
    { label: 'Active Pipeline', value: applications.filter(a => !['rejected', 'withdrawn'].includes(a.status)).length, icon: TrendingUp, color: '#f4a63c', bg: 'rgba(244,166,60,0.12)', href: '/applications' }
  ];

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {/* Greeting */}
      <div className="panel fade-in" style={{ padding: '1.5rem 1.8rem', background: 'linear-gradient(135deg, rgba(18,120,90,0.06), rgba(244,166,60,0.05))' }}>
        <h1 className="title-display" style={{ margin: '0 0 0.3rem', fontSize: 'clamp(1.5rem, 3vw, 2.1rem)' }}>
          Good morning{name ? `, ${name}` : ''} 👋
        </h1>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.95rem' }}>
          Your career command center. Let&apos;s build momentum today.
        </p>
        <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.1rem', flexWrap: 'wrap' }}>
          <Link href="/resume/new" className="btn btn-primary btn-sm">
            <Plus size={14} /> New Resume
          </Link>
          <Link href="/applications" className="btn btn-secondary btn-sm">
            <Briefcase size={14} /> View Pipeline
          </Link>
          <Link href="/jobs" className="btn btn-secondary btn-sm">
            <TrendingUp size={14} /> Browse Jobs
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={kpi.label}
              href={kpi.href}
              className="panel fade-in kpi-card"
              style={{ animationDelay: `${i * 60}ms`, textDecoration: 'none', display: 'block' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <p className="kpi-label">{kpi.label}</p>
                <div style={{ width: 32, height: 32, borderRadius: '9px', background: kpi.bg, color: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="kpi-value">{kpi.value}</div>
            </Link>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '1.2rem' }}>
        {/* Recent Applications */}
        <div className="panel" style={{ padding: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Recent Applications</h2>
            <Link href="/applications" style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>

          {loadingApps ? (
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {[1,2,3].map(n => <div key={n} className="skeleton" style={{ height: 48 }} />)}
            </div>
          ) : applications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Briefcase size={22} /></div>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.875rem' }}>No applications yet</p>
              <Link href="/applications" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem', display: 'inline-flex' }}>
                <Plus size={13} /> Track First Application
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {applications.map((app) => (
                <Link
                  key={app.id}
                  href={`/applications/${app.id}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.75rem', borderRadius: '10px', background: 'rgba(244,246,241,0.5)', border: '1px solid var(--line-solid)', textDecoration: 'none', transition: 'background 0.15s ease' }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.company}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.role}</div>
                  </div>
                  <StatusBadge status={app.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gap: '1rem', alignContent: 'start' }}>
          <div className="panel" style={{ padding: '1.2rem' }}>
            <h2 style={{ margin: '0 0 0.9rem', fontSize: '0.95rem', fontWeight: 700 }}>Quick Actions</h2>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {[
                { href: '/resume/new', label: 'Create new resume', icon: FileText, color: '#12785a' },
                { href: '/applications', label: 'Add application', icon: Briefcase, color: '#0ea5e9' },
                { href: '/jobs', label: 'Find matching jobs', icon: TrendingUp, color: '#f4a63c' },
                { href: '/mock', label: 'Practice mock interview', icon: Mic, color: '#9333ea' }
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.7rem',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '10px',
                      border: '1px solid var(--line-solid)',
                      background: 'rgba(255,255,255,0.6)',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'var(--ink)',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: '8px', background: `${action.color}15`, color: action.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={14} />
                    </div>
                    {action.label}
                    <ArrowRight size={13} style={{ marginLeft: 'auto', color: 'var(--muted)' }} />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Resumes */}
          {resumes.length > 0 && (
            <div className="panel" style={{ padding: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Resumes</h2>
                <Link href="/resume" style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  All <ArrowRight size={13} />
                </Link>
              </div>
              {resumes.slice(0, 3).map((r) => (
                <Link key={r.id} href={`/resume/${r.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.45rem 0', textDecoration: 'none', borderBottom: '1px solid var(--line-solid)' }}>
                  <FileText size={14} color="var(--accent)" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.875rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.2rem', flexShrink: 0 }}>
                    <Clock size={11} />
                    {new Date(r.updatedAt).toLocaleDateString()}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

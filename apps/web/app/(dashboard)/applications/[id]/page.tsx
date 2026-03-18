'use client';

import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import { ArrowLeft, Clock, Plus, MessageSquare, Tag, TrendingUp } from 'lucide-react';

type Application = { id: string; company: string; role: string; status: string; url?: string };
type Timeline = { id: string; title: string; eventType: string; content?: string; createdAt: string };

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  saved:      { label: 'Saved',     color: 'var(--muted)',    bg: 'rgba(79,95,81,0.08)' },
  applied:    { label: 'Applied',   color: '#0ea5e9',         bg: 'rgba(14,165,233,0.08)' },
  screening:  { label: 'Screening', color: 'var(--warning)',  bg: 'rgba(244,166,60,0.1)' },
  interview:  { label: 'Interview', color: '#9333ea',         bg: 'rgba(147,51,234,0.08)' },
  offer:      { label: 'Offer',     color: 'var(--success)',  bg: 'rgba(26,140,90,0.1)' },
  rejected:   { label: 'Rejected',  color: 'var(--danger)',   bg: 'rgba(211,68,53,0.06)' }
};

const EVENT_ICONS: Record<string, React.ReactNode> = {
  note: <MessageSquare size={14} />,
  status: <Tag size={14} />,
  interview: <TrendingUp size={14} />,
  default: <Clock size={14} />
};

export default function Page() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [app, setApp] = useState<Application | null>(null);
  const [timeline, setTimeline] = useState<Timeline[]>([]);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    const [appData, tlData] = await Promise.all([
      api.get<Application>(`/v1/applications/${params.id}`).catch(() => null),
      api.get<Timeline[]>(`/v1/applications/${params.id}/timeline`).catch(() => [])
    ]);
    if (appData) {
      setApp(appData);
      setStatus(appData.status);
    }
    setTimeline(Array.isArray(tlData) ? tlData : []);
  }

  useEffect(() => { load(); }, [params.id]);

  async function addNote(event: FormEvent) {
    event.preventDefault();
    if (!note.trim()) return;
    try {
      await api.post(`/v1/applications/${params.id}/notes`, { content: note });
      setNote('');
      await load();
    } catch { /* silent */ }
  }

  async function updateStatus(newStatus: string) {
    setSaving(true);
    try {
      await api.patch(`/v1/applications/${params.id}/status`, { status: newStatus });
      setStatus(newStatus);
      if (app) setApp({ ...app, status: newStatus });
    } finally { setSaving(false); }
  }

  if (!app) return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {[1,2].map(n => <div key={n} className="skeleton" style={{ height: 100, borderRadius: 18 }} />)}
    </div>
  );

  const meta = STATUS_META[app.status] ?? STATUS_META.saved;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/applications" className="btn btn-ghost btn-icon">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.5rem' }}>{app.company}</h1>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>{app.role}</p>
          </div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.3rem 0.8rem', borderRadius: 999, fontSize: '0.8rem', fontWeight: 700, background: meta.bg, color: meta.color }}>
          {meta.label}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.2rem', alignItems: 'start' }}>
        {/* Timeline */}
        <div>
          {/* Note form */}
          <div className="panel" style={{ padding: '1.2rem', marginBottom: '1rem' }}>
            <h2 style={{ margin: '0 0 0.8rem', fontSize: '0.95rem', fontWeight: 700 }}>Add Note</h2>
            <form onSubmit={addNote} style={{ display: 'flex', gap: '0.6rem' }}>
              <input
                className="input"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add a note, reminder, or observation..."
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" disabled={!note.trim()}>
                <Plus size={15} /> Add
              </button>
            </form>
          </div>

          {/* Timeline events */}
          <div className="panel" style={{ padding: '1.2rem' }}>
            <h2 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 700 }}>Activity Timeline</h2>
            {timeline.length === 0 ? (
              <p style={{ color: 'var(--muted)', margin: 0, fontSize: '0.875rem' }}>No events yet. Add a note to get started.</p>
            ) : (
              <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                <div style={{ position: 'absolute', left: '0.5rem', top: 0, bottom: 0, width: 2, background: 'var(--line-solid)', borderRadius: 1 }} />
                {timeline.map((event) => (
                  <div key={event.id} style={{ position: 'relative', marginBottom: '1.1rem' }}>
                    <div style={{
                      position: 'absolute', left: '-1.5rem',
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'var(--panel-solid)',
                      border: '2px solid var(--accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--accent)', flexShrink: 0
                    }}>
                      {EVENT_ICONS[event.eventType] ?? EVENT_ICONS.default}
                    </div>
                    <div style={{ background: 'rgba(244,246,241,0.5)', border: '1px solid var(--line-solid)', borderRadius: 12, padding: '0.7rem 0.9rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: event.content ? '0.3rem' : 0 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{event.title}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                          {new Date(event.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {event.content && <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>{event.content}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'grid', gap: '0.8rem', position: 'sticky', top: 80 }}>
          <div className="panel" style={{ padding: '1.1rem' }}>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', fontWeight: 700 }}>Update Status</h3>
            <div style={{ display: 'grid', gap: '0.35rem' }}>
              {Object.entries(STATUS_META).map(([s, m]) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  disabled={saving}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 10,
                    border: status === s ? `2px solid ${m.color}` : '1px solid var(--line-solid)',
                    background: status === s ? m.bg : 'transparent',
                    color: status === s ? m.color : 'var(--muted)',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: status === s ? 700 : 500,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                  {m.label}
                  {status === s && <span style={{ marginLeft: 'auto', fontSize: '0.68rem' }}>Current</span>}
                </button>
              ))}
            </div>
          </div>

          {app.url && (
            <div className="panel" style={{ padding: '1.1rem' }}>
              <a href={app.url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                View Job Listing
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

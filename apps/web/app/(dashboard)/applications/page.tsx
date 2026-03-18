'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { Plus, Briefcase, X } from 'lucide-react';

type Application = { id: string; company: string; role: string; status: string; updatedAt?: string };

const STATUSES = ['saved', 'applied', 'screening', 'interview', 'offer', 'rejected'];

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  saved:      { label: 'Saved',     color: 'var(--muted)',    bg: 'rgba(79,95,81,0.08)' },
  applied:    { label: 'Applied',   color: '#0ea5e9',         bg: 'rgba(14,165,233,0.08)' },
  screening:  { label: 'Screening', color: 'var(--warning)',  bg: 'rgba(244,166,60,0.1)' },
  interview:  { label: 'Interview', color: '#9333ea',         bg: 'rgba(147,51,234,0.08)' },
  offer:      { label: 'Offer',     color: 'var(--success)',  bg: 'rgba(26,140,90,0.1)' },
  rejected:   { label: 'Rejected',  color: 'var(--danger)',   bg: 'rgba(211,68,53,0.06)' }
};

export default function Page() {
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      const data = await api.get<Application[]>('/v1/applications');
      setItems(Array.isArray(data) ? data : []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function create(event: FormEvent) {
    event.preventDefault();
    setCreating(true);
    try {
      await api.post('/v1/applications', { company, role, status: 'saved' });
      setCompany(''); setRole(''); setShowModal(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create');
    } finally { setCreating(false); }
  }

  async function move(id: string, status: string) {
    await api.patch(`/v1/applications/${id}/status`, { status });
    await load();
  }

  const grouped = STATUSES.reduce<Record<string, Application[]>>((acc, s) => {
    acc[s] = items.filter(a => a.status === s);
    return acc;
  }, {} as Record<string, Application[]>);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Application Pipeline</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Application
        </button>
      </div>

      {/* Summary bar */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
        {STATUSES.map(s => {
          const count = grouped[s].length;
          const meta = STATUS_META[s];
          return count > 0 ? (
            <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.65rem', borderRadius: 999, fontSize: '0.78rem', fontWeight: 600, background: meta.bg, color: meta.color }}>
              {meta.label} {count}
            </span>
          ) : null;
        })}
        {items.length > 0 && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.65rem', borderRadius: 999, fontSize: '0.78rem', fontWeight: 600, background: 'var(--accent-muted)', color: 'var(--accent)' }}>
            Total: {items.length}
          </span>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setShowModal(false)}>
          <div className="panel" style={{ width: 'min(480px,100%)', padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
              <h2 style={{ margin: 0, fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.2rem' }}>Track Application</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={create} style={{ display: 'grid', gap: '0.8rem' }}>
              <div className="field-group">
                <label className="field-label">Company</label>
                <input className="input" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Stripe" required autoFocus />
              </div>
              <div className="field-group">
                <label className="field-label">Role</label>
                <input className="input" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Senior Engineer" required />
              </div>
              {error && <div className="alert alert-error">{error}</div>}
              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Adding...' : 'Add Application'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '1rem' }}>
          {[1,2,3,4].map(n => <div key={n} className="skeleton" style={{ height: 200, borderRadius: 18 }} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="panel" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--accent-muted)', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Briefcase size={26} />
          </div>
          <h3 style={{ margin: '0 0 0.4rem', fontWeight: 700 }}>No applications yet</h3>
          <p style={{ margin: '0 0 1.2rem', color: 'var(--muted)', fontSize: '0.9rem' }}>Start tracking your job applications on this visual pipeline.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={15} /> Add First Application
          </button>
        </div>
      ) : (
        <div className="kanban-board">
          {STATUSES.map(status => {
            const cards = grouped[status];
            const meta = STATUS_META[status];
            return (
              <div key={status} className="kanban-col">
                <div className="kanban-col-header">
                  <span className="kanban-col-title">{meta.label}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', fontSize: '0.7rem', fontWeight: 700, background: meta.bg, color: meta.color }}>
                    {cards.length}
                  </span>
                </div>
                <div className="kanban-cards">
                  {cards.map(app => (
                    <div key={app.id} className="panel" style={{ padding: '0.9rem 1rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.2rem' }}>{app.company}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '0.8rem' }}>{app.role}</div>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        <Link href={`/applications/${app.id}`} className="btn btn-secondary btn-sm" style={{ fontSize: '0.72rem' }}>Details</Link>
                        {status !== 'offer' && status !== 'rejected' && (
                          <select
                            className="input"
                            value={status}
                            onChange={e => move(app.id, e.target.value)}
                            style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem', flex: 1, minWidth: 0 }}
                          >
                            {STATUSES.map(s => (
                              <option key={s} value={s}>{STATUS_META[s].label}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                  {cards.length === 0 && (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.8rem', border: '2px dashed var(--line-solid)', borderRadius: 12 }}>
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

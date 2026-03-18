'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { Mic, Plus, X, Clock, Tag } from 'lucide-react';

type Session = { id: string; title: string; interviewType: string; status: string; createdAt?: string };

const TYPE_COLORS: Record<string, { color: string; bg: string }> = {
  behavioral: { color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
  technical:  { color: '#9333ea', bg: 'rgba(147,51,234,0.1)' },
  system:     { color: '#f4a63c', bg: 'rgba(244,166,60,0.12)' }
};

export default function Page() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('behavioral');
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const data = await api.get<Session[]>('/v1/interviews').catch(() => []);
    setSessions(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function create(event: FormEvent) {
    event.preventDefault();
    setCreating(true);
    try {
      await api.post('/v1/interviews', { title, type });
      setTitle(''); setShowModal(false);
      await load();
    } finally { setCreating(false); }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Interview Copilot</h1>
          <p style={{ margin: '0.2rem 0 0', color: 'var(--muted)', fontSize: '0.875rem' }}>
            AI-assisted real-time interview preparation
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Session
        </button>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setShowModal(false)}>
          <div className="panel" style={{ width: 'min(480px,100%)', padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
              <h2 style={{ margin: 0, fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.2rem' }}>New Interview Session</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={create} style={{ display: 'grid', gap: '0.8rem' }}>
              <div className="field-group">
                <label className="field-label">Session title</label>
                <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Google SWE Behavioral" required autoFocus />
              </div>
              <div className="field-group">
                <label className="field-label">Interview type</label>
                <select className="input" value={type} onChange={e => setType(e.target.value)}>
                  <option value="behavioral">Behavioral</option>
                  <option value="technical">Technical</option>
                  <option value="system">System Design</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Creating...' : 'Start Session'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sessions */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1rem' }}>
          {[1,2,3].map(n => <div key={n} className="skeleton" style={{ height: 160, borderRadius: 18 }} />)}
        </div>
      ) : sessions.length === 0 ? (
        <div className="panel" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--accent-muted)', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Mic size={26} />
          </div>
          <h3 style={{ margin: '0 0 0.4rem', fontWeight: 700 }}>No sessions yet</h3>
          <p style={{ margin: '0 0 1.2rem', color: 'var(--muted)', fontSize: '0.9rem' }}>Create your first interview session and get real-time AI coaching.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={15} /> Start First Session</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1rem' }}>
          {sessions.map(session => {
            const typeMeta = TYPE_COLORS[session.interviewType] ?? TYPE_COLORS.behavioral;
            return (
              <article key={session.id} className="panel" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '10px', background: typeMeta.bg, color: typeMeta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mic size={17} />
                  </div>
                  <span style={{ padding: '0.2rem 0.55rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600, background: typeMeta.bg, color: typeMeta.color }}>
                    {session.interviewType}
                  </span>
                </div>
                <h3 style={{ margin: '0 0 0.3rem', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3 }}>{session.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--muted)', fontSize: '0.78rem', marginBottom: 'auto' }}>
                  {session.createdAt && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={11} /> {new Date(session.createdAt).toLocaleDateString()}
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Tag size={11} /> {session.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1rem' }}>
                  <Link href={`/interview/${session.id}`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Open Session</Link>
                  <Link href={`/interview/${session.id}/stealth`} className="btn btn-secondary btn-sm" title="Stealth mode">Stealth</Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

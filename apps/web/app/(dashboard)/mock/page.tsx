'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { MessageSquare, Plus, Clock, BarChart3, ChevronRight } from 'lucide-react';

type MockSession = { id: string; status: string; createdAt: string; questionCount?: number; score?: number };

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: 'In Progress', color: '#0ea5e9',        bg: 'rgba(14,165,233,0.1)' },
  completed: { label: 'Completed',   color: 'var(--success)', bg: 'var(--success-muted)' },
  pending:   { label: 'Pending',     color: 'var(--warning)', bg: 'var(--warning-muted)' }
};

export default function Page() {
  const [sessions, setSessions] = useState<MockSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  async function load() {
    const data = await api.get<MockSession[]>('/v1/mock').catch(() => []);
    setSessions(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function create() {
    setCreating(true);
    try {
      await api.post('/v1/mock', {});
      await load();
    } finally { setCreating(false); }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Mock Interviews</h1>
          <p style={{ margin: '0.2rem 0 0', color: 'var(--muted)', fontSize: '0.875rem' }}>Practice with AI-generated interview questions and get instant feedback</p>
        </div>
        <button className="btn btn-primary" onClick={create} disabled={creating}>
          <Plus size={16} /> {creating ? 'Starting...' : 'Start New Mock'}
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1rem' }}>
          {[1,2,3].map(n => <div key={n} className="skeleton" style={{ height: 160, borderRadius: 18 }} />)}
        </div>
      ) : sessions.length === 0 ? (
        <div className="panel" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--accent-muted)', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <MessageSquare size={26} />
          </div>
          <h3 style={{ margin: '0 0 0.4rem', fontWeight: 700 }}>No mock sessions yet</h3>
          <p style={{ margin: '0 0 1.2rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
            Practice behavioral and technical interview questions with AI feedback.
          </p>
          <button className="btn btn-primary" onClick={create} disabled={creating}>
            <Plus size={15} /> Start Your First Mock
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1rem' }}>
          {sessions.map((session) => {
            const meta = STATUS_META[session.status] ?? STATUS_META.pending;
            return (
              <article key={session.id} className="panel" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--accent-muted)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MessageSquare size={17} />
                  </div>
                  <span style={{ padding: '0.2rem 0.55rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600, background: meta.bg, color: meta.color }}>
                    {meta.label}
                  </span>
                </div>

                <h3 style={{ margin: '0 0 0.3rem', fontWeight: 700, fontSize: '0.95rem' }}>
                  Session {session.id.slice(0, 8).toUpperCase()}
                </h3>

                <div style={{ color: 'var(--muted)', fontSize: '0.78rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={11} /> {new Date(session.createdAt).toLocaleDateString()}
                  </span>
                  {session.questionCount && (
                    <span>{session.questionCount} questions</span>
                  )}
                </div>

                {session.score != null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <BarChart3 size={13} color="var(--accent)" />
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: session.score >= 75 ? 'var(--success)' : 'var(--warning)' }}>
                      Score: {session.score}/100
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.4rem', marginTop: 'auto', paddingTop: '0.8rem' }}>
                  <Link href={`/mock/${session.id}`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                    {session.status === 'completed' ? 'Review' : 'Continue'}
                  </Link>
                  {session.status === 'completed' && (
                    <Link href={`/mock/${session.id}/report`} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <BarChart3 size={13} /> Report
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

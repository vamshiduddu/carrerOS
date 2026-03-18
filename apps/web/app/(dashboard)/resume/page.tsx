'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { FileText, Plus, Trash2, Edit2, Clock, ExternalLink, X } from 'lucide-react';

type Resume = { id: string; title: string; updatedAt: string };

export default function Page() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function loadResumes() {
    try {
      const data = await api.get<Resume[]>('/v1/resumes');
      setResumes(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load resumes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadResumes(); }, []);

  async function create(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setError('');
    setCreating(true);
    try {
      await api.post('/v1/resumes', { title: title.trim() });
      setTitle('');
      setShowModal(false);
      await loadResumes();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create resume');
    } finally {
      setCreating(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this resume?')) return;
    setDeleting(id);
    try {
      await api.delete(`/v1/resumes/${id}`);
      await loadResumes();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Resume Builder</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Resume
        </button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Create Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }} onClick={() => setShowModal(false)}>
          <div className="panel" style={{ width: 'min(480px,100%)', padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
              <h2 style={{ margin: 0, fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.2rem' }}>Create New Resume</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={create} style={{ display: 'grid', gap: '0.9rem' }}>
              <div className="field-group">
                <label className="field-label" htmlFor="resumeTitle">Resume title</label>
                <input
                  id="resumeTitle"
                  className="input"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Senior Engineer - FAANG"
                  required
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Resume'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resume Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '1rem' }}>
          {[1,2,3].map(n => <div key={n} className="skeleton" style={{ height: 160, borderRadius: 18 }} />)}
        </div>
      ) : resumes.length === 0 ? (
        <div className="panel" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'var(--accent-muted)',
            color: 'var(--accent)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <FileText size={26} />
          </div>
          <h3 style={{ margin: '0 0 0.4rem', fontWeight: 700 }}>No resumes yet</h3>
          <p style={{ margin: '0 0 1.2rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
            Create your first resume and start tailoring it to specific roles.
          </p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={15} /> Create Your First Resume
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '1rem' }}>
          {resumes.map((resume) => (
            <article key={resume.id} className="panel" style={{ padding: '1.3rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{
                width: 40, height: 40,
                borderRadius: '11px',
                background: 'var(--accent-muted)',
                color: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '0.8rem'
              }}>
                <FileText size={18} />
              </div>
              <h3 style={{ margin: '0 0 0.3rem', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3 }}>
                {resume.title}
              </h3>
              <p style={{ margin: '0 0 auto', color: 'var(--muted)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={11} />
                {new Date(resume.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <Link href={`/resume/${resume.id}`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                  <Edit2 size={13} /> Edit
                </Link>
                <Link href={`/resume/${resume.id}/ats`} className="btn btn-secondary btn-sm" title="ATS Score">
                  <ExternalLink size={13} />
                </Link>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => remove(resume.id)}
                  disabled={deleting === resume.id}
                  style={{ color: deleting === resume.id ? 'var(--muted)' : 'var(--danger)' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

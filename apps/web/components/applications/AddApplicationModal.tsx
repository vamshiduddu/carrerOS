'use client';

import { FormEvent, useState } from 'react';
import { api } from '../../lib/api';
import { X, Briefcase } from 'lucide-react';

const STATUSES = ['saved', 'applied', 'screening', 'interview', 'offer', 'rejected'];

interface AddApplicationModalProps {
  onClose: () => void;
  onCreated: (app: any) => void;
}

export default function AddApplicationModal({ onClose, onCreated }: AddApplicationModalProps) {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('saved');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;
    setCreating(true);
    setError('');
    try {
      const app = await api.post<any>('/v1/applications', { company, role, status });
      onCreated(app);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create application');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="panel"
        style={{ width: 'min(500px, 100%)', padding: '1.5rem' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--accent-muted)', color: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Briefcase size={16} />
            </div>
            <h2 style={{ margin: 0, fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.2rem', fontWeight: 600 }}>
              Track Application
            </h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.85rem' }}>
          <div className="field-group">
            <label className="field-label">Company *</label>
            <input
              className="input"
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="e.g. Stripe, Figma, Notion..."
              required
              autoFocus
            />
          </div>

          <div className="field-group">
            <label className="field-label">Role *</label>
            <input
              className="input"
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="e.g. Senior Software Engineer"
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label">Status</label>
            <select
              className="select"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="alert alert-error">{error}</div>
          )}

          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={creating || !company.trim() || !role.trim()}>
              {creating ? 'Adding...' : 'Add Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

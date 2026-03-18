'use client';

import { FormEvent, useState } from 'react';
import { api } from '../../lib/api';
import { Mic, Play } from 'lucide-react';

interface SessionSetupProps {
  onCreated: (session: any) => void;
}

const INTERVIEW_TYPES = [
  { value: 'behavioral', label: 'Behavioral', description: 'STAR method, soft skills, past experience' },
  { value: 'technical', label: 'Technical', description: 'Coding, system knowledge, problem solving' },
  { value: 'system-design', label: 'System Design', description: 'Architecture, scalability, design patterns' },
];

export default function SessionSetup({ onCreated }: SessionSetupProps) {
  const [title, setTitle] = useState('');
  const [interviewType, setInterviewType] = useState('behavioral');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    setError('');
    try {
      const session = await api.post<any>('/v1/interviews/sessions', {
        title,
        interviewType,
      });
      onCreated(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="panel" style={{ padding: '1.8rem', maxWidth: 560 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'rgba(147,51,234,0.1)', color: '#9333ea',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Mic size={20} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.2rem', fontWeight: 600 }}>
            New Interview Session
          </h2>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.82rem' }}>
            Set up an AI-powered interview practice session
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <div className="field-group">
          <label className="field-label">Session Title</label>
          <input
            className="input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Google SWE Prep, Amazon Leadership..."
            required
            autoFocus
          />
        </div>

        <div>
          <label className="field-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Interview Type</label>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {INTERVIEW_TYPES.map(type => (
              <label
                key={type.value}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  border: `2px solid ${interviewType === type.value ? 'var(--accent)' : 'var(--line-solid)'}`,
                  borderRadius: 'var(--radius-sm)',
                  background: interviewType === type.value ? 'var(--accent-muted)' : 'var(--panel-solid)',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease, background 0.15s ease',
                }}
              >
                <input
                  type="radio"
                  name="interviewType"
                  value={type.value}
                  checked={interviewType === type.value}
                  onChange={() => setInterviewType(type.value)}
                  style={{ display: 'none' }}
                />
                <div style={{
                  width: 16, height: 16, borderRadius: '50%',
                  border: `2px solid ${interviewType === type.value ? 'var(--accent)' : 'var(--line-solid)'}`,
                  background: interviewType === type.value ? 'var(--accent)' : 'transparent',
                  flexShrink: 0, transition: 'all 0.15s ease',
                }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: interviewType === type.value ? 'var(--accent)' : 'var(--ink)' }}>
                    {type.label}
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{type.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={creating || !title.trim()}
          style={{ gap: '0.4rem', marginTop: '0.25rem' }}
        >
          <Play size={15} />
          {creating ? 'Starting...' : 'Start Session'}
        </button>
      </form>
    </div>
  );
}

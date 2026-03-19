'use client';

import { useState } from 'react';
import { Settings2, Plus, X, RefreshCw } from 'lucide-react';
import type { JobPreferences } from '../../hooks/useJobMatches';

interface Props {
  prefs: JobPreferences;
  saving: boolean;
  onSave: (prefs: JobPreferences) => void;
}

function TagInput({
  label, values, onChange, placeholder
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState('');

  function add() {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) onChange([...values, trimmed]);
    setInput('');
  }

  return (
    <div>
      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
        {label}
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.4rem' }}>
        {values.map((v) => (
          <span key={v} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
            padding: '0.2rem 0.55rem', borderRadius: 999,
            background: 'var(--accent-muted)', color: 'var(--accent)',
            fontSize: '0.78rem', fontWeight: 600
          }}>
            {v}
            <button onClick={() => onChange(values.filter((x) => x !== v))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, lineHeight: 1, display: 'flex' }}>
              <X size={11} />
            </button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <input
          className="input"
          style={{ fontSize: '0.85rem', padding: '0.4rem 0.7rem' }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder}
        />
        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.7rem' }} onClick={add} type="button">
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export default function JobPreferencesPanel({ prefs, saving, onSave }: Props) {
  const [local, setLocal] = useState<JobPreferences>(prefs);
  const [open, setOpen] = useState(false);

  function set<K extends keyof JobPreferences>(key: K, value: JobPreferences[K]) {
    setLocal((p) => ({ ...p, [key]: value }));
  }

  function handleSave() {
    onSave(local);
    setOpen(false);
  }

  return (
    <>
      <button
        className="btn btn-secondary"
        onClick={() => { setLocal(prefs); setOpen(true); }}
        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
      >
        <Settings2 size={15} />
        Preferences
        {prefs.titles.length > 0 && (
          <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: 999, padding: '0.05rem 0.45rem', fontSize: '0.7rem', fontWeight: 700 }}>
            {prefs.titles.length}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="panel" style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Job Preferences</h2>
              <button className="btn btn-secondary" style={{ padding: '0.3rem' }} onClick={() => setOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <TagInput label="Job Titles" values={local.titles} onChange={(v) => set('titles', v)} placeholder="e.g. Software Engineer" />
            <TagInput label="Locations" values={local.locations} onChange={(v) => set('locations', v)} placeholder="e.g. New York, Remote" />
            <TagInput label="Keywords / Skills" values={local.keywords} onChange={(v) => set('keywords', v)} placeholder="e.g. React, Python, AWS" />

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                Job Type
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {['full-time', 'part-time', 'contract', 'internship', 'freelance'].map((t) => {
                  const active = local.jobTypes.includes(t);
                  return (
                    <button key={t} type="button"
                      onClick={() => set('jobTypes', active ? local.jobTypes.filter((x) => x !== t) : [...local.jobTypes, t])}
                      style={{
                        padding: '0.3rem 0.75rem', borderRadius: 999, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: 'none',
                        background: active ? 'var(--accent)' : 'var(--surface-2)',
                        color: active ? '#fff' : 'var(--muted)'
                      }}>
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', userSelect: 'none' }}>
              <div
                onClick={() => set('remote', !local.remote)}
                style={{
                  width: 36, height: 20, borderRadius: 999, position: 'relative', cursor: 'pointer', flexShrink: 0,
                  background: local.remote ? 'var(--accent)' : 'var(--surface-2)',
                  transition: 'background 0.2s'
                }}>
                <div style={{
                  position: 'absolute', top: 2, left: local.remote ? 18 : 2,
                  width: 16, height: 16, borderRadius: '50%', background: '#fff',
                  transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }} />
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Remote only</span>
            </label>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                onClick={handleSave} disabled={saving}>
                {saving ? <><RefreshCw size={14} className="spin" /> Fetching jobs...</> : 'Save & Find Matches'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

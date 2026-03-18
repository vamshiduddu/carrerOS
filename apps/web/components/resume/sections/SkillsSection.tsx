'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface SkillsSectionProps {
  items: string[];
  onChange: (items: string[]) => void;
}

export default function SkillsSection({ items, onChange }: SkillsSectionProps) {
  const [newSkill, setNewSkill] = useState('');

  function addSkill() {
    const trimmed = newSkill.trim();
    if (!trimmed || items.includes(trimmed)) return;
    onChange([...items, trimmed]);
    setNewSkill('');
  }

  function removeSkill(skill: string) {
    onChange(items.filter(s => s !== skill));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  }

  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', minHeight: 40 }}>
        {items.map(skill => (
          <span
            key={skill}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              background: 'var(--accent-muted)', color: 'var(--accent)',
              border: '1px solid rgba(18,120,90,0.2)',
              borderRadius: 999, padding: '0.25rem 0.6rem',
              fontSize: '0.82rem', fontWeight: 600,
            }}
          >
            {skill}
            <button
              onClick={() => removeSkill(skill)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--accent)', display: 'flex', alignItems: 'center', padding: 0,
              }}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        {items.length === 0 && (
          <span style={{ color: 'var(--muted)', fontSize: '0.82rem', alignSelf: 'center' }}>
            Add skills below...
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          className="input"
          value={newSkill}
          onChange={e => setNewSkill(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. TypeScript, React, AWS..."
          style={{ flex: 1 }}
        />
        <button
          className="btn btn-primary btn-sm"
          onClick={addSkill}
          disabled={!newSkill.trim()}
          style={{ gap: '0.3rem' }}
        >
          <Plus size={13} /> Add
        </button>
      </div>
    </div>
  );
}

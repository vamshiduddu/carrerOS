'use client';

import { Check } from 'lucide-react';

interface TemplateSelectorProps {
  onSelect: (template: string) => void;
  selected: string;
}

const TEMPLATES = [
  { id: 'modern', label: 'Modern', color: '#12785a', accent: 'rgba(18,120,90,0.15)' },
  { id: 'classic', label: 'Classic', color: '#1a2b4a', accent: 'rgba(26,43,74,0.12)' },
  { id: 'minimal', label: 'Minimal', color: '#4f5f51', accent: 'rgba(79,95,81,0.1)' },
  { id: 'executive', label: 'Executive', color: '#8b4513', accent: 'rgba(139,69,19,0.1)' },
];

export default function TemplateSelector({ onSelect, selected }: TemplateSelectorProps) {
  return (
    <div>
      <p style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', color: 'var(--muted)' }}>
        Choose a template style for your resume
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
        {TEMPLATES.map(tpl => {
          const isSelected = selected === tpl.id;
          return (
            <button
              key={tpl.id}
              onClick={() => onSelect(tpl.id)}
              style={{
                border: isSelected ? `2px solid ${tpl.color}` : '2px solid var(--line-solid)',
                borderRadius: 'var(--radius-md)',
                background: isSelected ? tpl.accent : 'var(--panel)',
                padding: '0.75rem',
                cursor: 'pointer',
                transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
                textAlign: 'center',
                boxShadow: isSelected ? `0 0 0 3px ${tpl.color}22` : 'none',
              }}
            >
              {/* Thumbnail */}
              <div style={{
                width: '100%',
                paddingTop: '130%',
                position: 'relative',
                borderRadius: 8,
                background: 'white',
                border: '1px solid var(--line-solid)',
                marginBottom: '0.6rem',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', inset: 0, padding: '8px',
                  display: 'flex', flexDirection: 'column', gap: 4,
                }}>
                  <div style={{ height: 10, background: tpl.color, borderRadius: 2 }} />
                  <div style={{ height: 4, background: tpl.accent, borderRadius: 2, width: '70%' }} />
                  <div style={{ height: 1, background: tpl.color, margin: '2px 0' }} />
                  {[80, 60, 70, 50, 65].map((w, i) => (
                    <div key={i} style={{ height: 3, background: '#e5e7eb', borderRadius: 2, width: `${w}%` }} />
                  ))}
                  <div style={{ height: 1, background: tpl.color, margin: '2px 0', opacity: 0.5 }} />
                  {[55, 75, 45].map((w, i) => (
                    <div key={i} style={{ height: 3, background: '#e5e7eb', borderRadius: 2, width: `${w}%` }} />
                  ))}
                </div>
                {isSelected && (
                  <div style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 18, height: 18, borderRadius: '50%',
                    background: tpl.color, color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Check size={11} />
                  </div>
                )}
              </div>
              <span style={{
                fontSize: '0.8rem', fontWeight: isSelected ? 700 : 500,
                color: isSelected ? tpl.color : 'var(--ink)',
              }}>
                {tpl.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface ExperienceItem {
  company: string;
  title: string;
  dates: string;
  bullets: string[];
}

interface ExperienceSectionProps {
  items: ExperienceItem[];
  onChange: (items: ExperienceItem[]) => void;
}

function ExperienceEntry({
  item, index, onChange, onRemove,
}: {
  item: ExperienceItem;
  index: number;
  onChange: (item: ExperienceItem) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  function updateBullet(i: number, val: string) {
    const bullets = [...item.bullets];
    bullets[i] = val;
    onChange({ ...item, bullets });
  }

  function addBullet() {
    onChange({ ...item, bullets: [...item.bullets, ''] });
  }

  function removeBullet(i: number) {
    onChange({ ...item, bullets: item.bullets.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="panel-flat" style={{ padding: '1rem', borderRadius: 'var(--radius-md)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: expanded ? '0.75rem' : 0 }}>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setExpanded(e => !e)}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <span style={{ flex: 1, fontWeight: 600, fontSize: '0.9rem' }}>
          {item.title || 'New Position'}{item.company ? ` @ ${item.company}` : ''}
        </span>
        <button className="btn btn-sm" style={{ background: 'var(--danger-muted)', color: 'var(--danger)' }} onClick={onRemove}>
          <Trash2 size={13} />
        </button>
      </div>

      {expanded && (
        <div style={{ display: 'grid', gap: '0.6rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            <div className="field-group">
              <label className="field-label">Job Title</label>
              <input className="input" value={item.title} onChange={e => onChange({ ...item, title: e.target.value })} placeholder="Software Engineer" />
            </div>
            <div className="field-group">
              <label className="field-label">Company</label>
              <input className="input" value={item.company} onChange={e => onChange({ ...item, company: e.target.value })} placeholder="Acme Corp" />
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Dates</label>
            <input className="input" value={item.dates} onChange={e => onChange({ ...item, dates: e.target.value })} placeholder="Jan 2022 – Present" />
          </div>

          <div>
            <label className="field-label">Bullet Points</label>
            <div style={{ display: 'grid', gap: '0.4rem', marginTop: '0.35rem' }}>
              {item.bullets.map((b, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '0.8rem', flexShrink: 0 }}>•</span>
                  <input
                    className="input"
                    value={b}
                    onChange={e => updateBullet(i, e.target.value)}
                    placeholder={`Achievement ${i + 1}...`}
                    style={{ flex: 1 }}
                  />
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => removeBullet(i)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: '0.4rem', gap: '0.3rem' }} onClick={addBullet}>
              <Plus size={12} /> Add bullet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExperienceSection({ items, onChange }: ExperienceSectionProps) {
  function addEntry() {
    onChange([...items, { company: '', title: '', dates: '', bullets: [''] }]);
  }

  function updateEntry(index: number, item: ExperienceItem) {
    const updated = [...items];
    updated[index] = item;
    onChange(updated);
  }

  function removeEntry(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      {items.map((item, i) => (
        <ExperienceEntry
          key={i}
          item={item}
          index={i}
          onChange={updated => updateEntry(i, updated)}
          onRemove={() => removeEntry(i)}
        />
      ))}
      <button className="btn btn-secondary btn-sm" style={{ justifySelf: 'start', gap: '0.35rem' }} onClick={addEntry}>
        <Plus size={14} /> Add Experience
      </button>
    </div>
  );
}

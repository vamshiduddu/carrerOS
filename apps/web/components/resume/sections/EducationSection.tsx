'use client';

import { Plus, Trash2 } from 'lucide-react';

interface EducationItem {
  school: string;
  degree: string;
  year: string;
}

interface EducationSectionProps {
  items: EducationItem[];
  onChange: (items: EducationItem[]) => void;
}

export default function EducationSection({ items, onChange }: EducationSectionProps) {
  function addEntry() {
    onChange([...items, { school: '', degree: '', year: '' }]);
  }

  function updateEntry(index: number, field: keyof EducationItem, value: string) {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange(updated);
  }

  function removeEntry(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      {items.map((item, i) => (
        <div key={i} className="panel-flat" style={{ padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
              {item.school || 'New Education Entry'}
            </span>
            <button
              className="btn btn-sm"
              style={{ background: 'var(--danger-muted)', color: 'var(--danger)' }}
              onClick={() => removeEntry(i)}
            >
              <Trash2 size={13} />
            </button>
          </div>
          <div style={{ display: 'grid', gap: '0.6rem' }}>
            <div className="field-group">
              <label className="field-label">School / University</label>
              <input
                className="input"
                value={item.school}
                onChange={e => updateEntry(i, 'school', e.target.value)}
                placeholder="MIT, Stanford..."
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.6rem' }}>
              <div className="field-group">
                <label className="field-label">Degree</label>
                <input
                  className="input"
                  value={item.degree}
                  onChange={e => updateEntry(i, 'degree', e.target.value)}
                  placeholder="B.S. Computer Science"
                />
              </div>
              <div className="field-group">
                <label className="field-label">Year</label>
                <input
                  className="input"
                  value={item.year}
                  onChange={e => updateEntry(i, 'year', e.target.value)}
                  placeholder="2022"
                />
              </div>
            </div>
          </div>
        </div>
      ))}
      <button className="btn btn-secondary btn-sm" style={{ justifySelf: 'start', gap: '0.35rem' }} onClick={addEntry}>
        <Plus size={14} /> Add Education
      </button>
    </div>
  );
}

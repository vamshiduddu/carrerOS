'use client';

import { Plus, Trash2 } from 'lucide-react';

interface CustomItem {
  title?: string;
  description?: string;
}

interface CustomSectionProps {
  title: string;
  items: CustomItem[];
  onChange: (items: CustomItem[]) => void;
}

export default function CustomSection({ title, items, onChange }: CustomSectionProps) {
  function addItem() {
    onChange([...items, { title: '', description: '' }]);
  }

  function updateItem(index: number, field: keyof CustomItem, value: string) {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange(updated);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      {items.length === 0 && (
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.875rem' }}>
          No entries yet. Add one below.
        </p>
      )}

      {items.map((item, i) => (
        <div key={i} className="panel-flat" style={{ padding: '0.9rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, display: 'grid', gap: '0.5rem' }}>
              <input
                className="input"
                value={item.title ?? ''}
                onChange={e => updateItem(i, 'title', e.target.value)}
                placeholder={`${title} title...`}
              />
              <textarea
                className="textarea"
                value={item.description ?? ''}
                onChange={e => updateItem(i, 'description', e.target.value)}
                placeholder="Description (optional)..."
                rows={2}
                style={{ minHeight: 60 }}
              />
            </div>
            <button
              className="btn btn-sm"
              style={{ background: 'var(--danger-muted)', color: 'var(--danger)', flexShrink: 0 }}
              onClick={() => removeItem(i)}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ))}

      <button className="btn btn-secondary btn-sm" style={{ justifySelf: 'start', gap: '0.35rem' }} onClick={addItem}>
        <Plus size={14} /> Add {title}
      </button>
    </div>
  );
}

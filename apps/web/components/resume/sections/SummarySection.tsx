'use client';

interface SummarySectionProps {
  value: string;
  onChange: (v: string) => void;
}

export default function SummarySection({ value, onChange }: SummarySectionProps) {
  const charCount = value.length;
  const recommended = 600;

  return (
    <div style={{ display: 'grid', gap: '0.5rem' }}>
      <textarea
        className="textarea"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Write a compelling 2-4 sentence summary highlighting your experience, skills, and career goals..."
        rows={5}
        style={{ minHeight: 120 }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
          Aim for 300–600 characters
        </span>
        <span style={{
          fontSize: '0.78rem', fontWeight: 600,
          color: charCount > recommended ? 'var(--warning)' : charCount > 0 ? 'var(--success)' : 'var(--muted)',
        }}>
          {charCount} chars
        </span>
      </div>
    </div>
  );
}

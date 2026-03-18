'use client';

import { useState } from 'react';
import { Search, Wifi, DollarSign } from 'lucide-react';

interface JobFiltersProps {
  onFilter: (filters: any) => void;
}

export default function JobFilters({ onFilter }: JobFiltersProps) {
  const [search, setSearch] = useState('');
  const [remote, setRemote] = useState(false);
  const [minSalary, setMinSalary] = useState('');

  function handleChange(updates: Partial<{ search: string; remote: boolean; minSalary: string }>) {
    const next = {
      search,
      remote,
      minSalary,
      ...updates,
    };
    if ('search' in updates) setSearch(updates.search!);
    if ('remote' in updates) setRemote(updates.remote!);
    if ('minSalary' in updates) setMinSalary(updates.minSalary!);

    onFilter({
      search: next.search,
      remote: next.remote,
      minSalary: next.minSalary ? Number(next.minSalary) : undefined,
    });
  }

  return (
    <div className="panel" style={{ padding: '1rem 1.2rem' }}>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        {/* Search */}
        <div className="field-group" style={{ flex: '2 1 200px' }}>
          <label className="field-label">Search</label>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input
              className="input"
              value={search}
              onChange={e => handleChange({ search: e.target.value })}
              placeholder="Job title, company, skills..."
              style={{ paddingLeft: '2.2rem' }}
            />
          </div>
        </div>

        {/* Min Salary */}
        <div className="field-group" style={{ flex: '1 1 130px' }}>
          <label className="field-label">Min Salary</label>
          <div style={{ position: 'relative' }}>
            <DollarSign size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input
              className="input"
              type="number"
              value={minSalary}
              onChange={e => handleChange({ minSalary: e.target.value })}
              placeholder="e.g. 80000"
              style={{ paddingLeft: '2.2rem' }}
            />
          </div>
        </div>

        {/* Remote toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.65rem' }}>
          <button
            onClick={() => handleChange({ remote: !remote })}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.55rem 0.9rem',
              border: `1.5px solid ${remote ? 'var(--accent)' : 'var(--line-solid)'}`,
              borderRadius: 999,
              background: remote ? 'var(--accent-muted)' : 'var(--panel-solid)',
              color: remote ? 'var(--accent)' : 'var(--muted)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              transition: 'all 0.15s ease',
              fontFamily: 'inherit',
            }}
          >
            <Wifi size={14} />
            Remote Only
          </button>
        </div>
      </div>
    </div>
  );
}

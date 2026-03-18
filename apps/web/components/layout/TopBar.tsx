'use client';

import { useState, useEffect } from 'react';
import { Bell, Menu, X } from 'lucide-react';
import { api } from '../../lib/api';

type MeResponse = {
  user: { fullName: string; email: string };
};

interface TopBarProps {
  onMenuClick?: () => void;
  mobileMenuOpen?: boolean;
}

export default function TopBar({ onMenuClick, mobileMenuOpen }: TopBarProps) {
  const [name, setName] = useState('');
  const [initials, setInitials] = useState('U');

  useEffect(() => {
    api.get<MeResponse>('/v1/auth/me')
      .then((res) => {
        const n = res.user?.fullName || res.user?.email || 'User';
        setName(n);
        setInitials(
          n.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase()
        );
      })
      .catch(() => { setInitials('U'); });
  }, []);

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          className="btn btn-ghost btn-icon"
          onClick={onMenuClick}
          aria-label="Toggle menu"
          style={{ display: 'none' }}
          id="mobile-menu-btn"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span style={{ fontSize: '0.875rem', color: 'var(--muted)', fontWeight: 500 }}>
          {name ? `Welcome back, ${name.split(' ')[0]}` : 'CareerOS'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button className="btn btn-ghost btn-icon" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.72rem',
          fontWeight: 700,
          cursor: 'pointer',
          flexShrink: 0
        }}>
          {initials}
        </div>
      </div>
    </div>
  );
}

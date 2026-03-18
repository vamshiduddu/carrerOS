'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { User, CreditCard, Bell, Puzzle, Save, CheckCircle } from 'lucide-react';

const settingsNav = [
  { href: '/settings', label: 'Profile', icon: User },
  { href: '/settings/subscription', label: 'Subscription', icon: CreditCard },
  { href: '/settings/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings/integrations', label: 'Integrations', icon: Puzzle }
];

type Profile = { fullName: string; timezone: string; locale: string; bio?: string };

export default function Page() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile>({ fullName: '', timezone: 'UTC', locale: 'en', bio: '' });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [initials, setInitials] = useState('U');

  useEffect(() => {
    api.get<Profile>('/v1/users/profile')
      .then(data => {
        setProfile({ fullName: data.fullName || '', timezone: data.timezone || 'UTC', locale: data.locale || 'en', bio: data.bio || '' });
        const n = data.fullName || 'U';
        setInitials(n.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase());
      })
      .catch(() => setMessage('Could not load profile'));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.patch('/v1/users/profile', profile);
      setMessage('saved');
      const n = profile.fullName || 'U';
      setInitials(n.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase());
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Update failed');
    } finally { setSaving(false); }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="settings-layout">
        {/* Settings Nav */}
        <div className="settings-nav">
          {settingsNav.map(item => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${active ? 'active' : ''}`}
              >
                <Icon size={16} className="nav-icon" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Profile Form */}
        <div className="panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--line-solid)' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
              color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem', fontWeight: 700, flexShrink: 0
            }}>
              {initials}
            </div>
            <div>
              <h2 style={{ margin: '0 0 0.2rem', fontWeight: 700 }}>{profile.fullName || 'Your Profile'}</h2>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.875rem' }}>Update your personal information</p>
            </div>
          </div>

          <form onSubmit={onSubmit} style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="field-group">
                <label className="field-label">Full name</label>
                <input
                  className="input"
                  value={profile.fullName}
                  onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                  placeholder="Jane Smith"
                />
              </div>
              <div className="field-group">
                <label className="field-label">Locale</label>
                <select
                  className="input"
                  value={profile.locale}
                  onChange={e => setProfile({ ...profile, locale: e.target.value })}
                >
                  <option value="en">English (en)</option>
                  <option value="en-GB">English UK (en-GB)</option>
                  <option value="fr">French (fr)</option>
                  <option value="de">German (de)</option>
                  <option value="es">Spanish (es)</option>
                </select>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Timezone</label>
              <select
                className="input"
                value={profile.timezone}
                onChange={e => setProfile({ ...profile, timezone: e.target.value })}
              >
                {['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
                  'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Kolkata', 'Australia/Sydney'
                ].map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">Bio (optional)</label>
              <textarea
                className="textarea"
                value={profile.bio}
                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                placeholder="A brief description of your professional background..."
                rows={3}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : <><Save size={15} /> Save Changes</>}
              </button>
              {message === 'saved' && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)', fontSize: '0.875rem', fontWeight: 600 }}>
                  <CheckCircle size={15} /> Saved successfully
                </span>
              )}
              {message && message !== 'saved' && (
                <span style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{message}</span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

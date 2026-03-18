'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '../../../../lib/api';
import { User, CreditCard, Bell, Puzzle, CheckCircle } from 'lucide-react';

const settingsNav = [
  { href: '/settings', label: 'Profile', icon: User },
  { href: '/settings/subscription', label: 'Subscription', icon: CreditCard },
  { href: '/settings/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings/integrations', label: 'Integrations', icon: Puzzle }
];

type Notification = { id: string; title: string; body: string; isRead: boolean; createdAt?: string };

export default function Page() {
  const pathname = usePathname();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const data = await api.get<Notification[]>('/v1/notifications').catch(() => []);
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function read(id: string) {
    await api.patch(`/v1/notifications/${id}/read`, {}).catch(() => {});
    await load();
  }

  async function readAll() {
    await api.patch('/v1/notifications/read-all', {}).catch(() => {});
    await load();
  }

  const unread = items.filter(n => !n.isRead).length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="settings-layout">
        <div className="settings-nav">
          {settingsNav.map(item => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`nav-link ${active ? 'active' : ''}`}>
                <Icon size={16} className="nav-icon" />{item.label}
              </Link>
            );
          })}
        </div>

        <div>
          <div className="panel" style={{ padding: '1.4rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                  <Bell size={18} color="var(--accent)" />
                  <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>Notifications</h2>
                  {unread > 0 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', color: 'white', fontSize: '0.68rem', fontWeight: 700 }}>
                      {unread}
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.875rem' }}>Stay up to date on your applications and opportunities.</p>
              </div>
              {unread > 0 && (
                <button className="btn btn-secondary btn-sm" onClick={readAll}>
                  Mark All Read
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {[1,2,3].map(n => <div key={n} className="skeleton" style={{ height: 72, borderRadius: 14 }} />)}
            </div>
          ) : items.length === 0 ? (
            <div className="panel" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--accent-muted)', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.8rem' }}>
                <Bell size={22} />
              </div>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>You&apos;re all caught up! No notifications.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {items.map(item => (
                <div
                  key={item.id}
                  className="panel"
                  style={{
                    padding: '1rem 1.2rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.8rem',
                    background: item.isRead ? undefined : 'linear-gradient(135deg, rgba(18,120,90,0.04), transparent)'
                  }}
                >
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: '0.45rem',
                    background: item.isRead ? 'var(--line-solid)' : 'var(--accent)'
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <p style={{ margin: 0, fontWeight: item.isRead ? 500 : 700, fontSize: '0.9rem' }}>{item.title}</p>
                      {item.createdAt && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--muted)', flexShrink: 0 }}>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '0.2rem 0 0', color: 'var(--muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>{item.body}</p>
                  </div>
                  {!item.isRead && (
                    <button className="btn btn-ghost btn-sm" onClick={() => read(item.id)} title="Mark as read" style={{ flexShrink: 0, color: 'var(--accent)' }}>
                      <CheckCircle size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

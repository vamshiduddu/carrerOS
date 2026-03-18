'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, CreditCard, Bell, Puzzle, Linkedin, Github, Mail } from 'lucide-react';

const settingsNav = [
  { href: '/settings', label: 'Profile', icon: User },
  { href: '/settings/subscription', label: 'Subscription', icon: CreditCard },
  { href: '/settings/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings/integrations', label: 'Integrations', icon: Puzzle }
];

const integrations = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: '#0077b5',
    bg: 'rgba(0,119,181,0.08)',
    desc: 'Import your profile, sync connections, and apply with one click.'
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: Github,
    color: '#333',
    bg: 'rgba(51,51,51,0.06)',
    desc: 'Showcase your repositories and contribution history in your resume.'
  },
  {
    id: 'gmail',
    name: 'Gmail',
    icon: Mail,
    color: '#ea4335',
    bg: 'rgba(234,67,53,0.08)',
    desc: 'Track application emails automatically and get follow-up reminders.'
  }
];

export default function Page() {
  const pathname = usePathname();

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
          <div className="panel" style={{ padding: '1.4rem', marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
              <Puzzle size={18} color="var(--accent)" />
              <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>Integrations</h2>
            </div>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.875rem' }}>
              Connect external services to supercharge your job search workflow.
            </p>
          </div>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {integrations.map(integration => {
              const Icon = integration.icon;
              return (
                <div key={integration.id} className="panel" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '12px',
                    background: integration.bg,
                    color: integration.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={22} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <h3 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{integration.name}</h3>
                      <span style={{ padding: '0.15rem 0.5rem', borderRadius: 999, fontSize: '0.65rem', fontWeight: 700, background: 'var(--accent-2-muted)', color: 'var(--accent-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Coming Soon
                      </span>
                    </div>
                    <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>{integration.desc}</p>
                  </div>
                  <button className="btn btn-secondary btn-sm" disabled style={{ flexShrink: 0 }}>
                    Connect
                  </button>
                </div>
              );
            })}
          </div>

          <div className="panel" style={{ padding: '1.2rem', marginTop: '1rem', background: 'linear-gradient(135deg, rgba(18,120,90,0.04), rgba(244,166,60,0.04))' }}>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              More integrations are on the roadmap including Slack, Notion, Greenhouse, and Lever.
              Want to request one?{' '}
              <a href="mailto:hello@careeros.app" style={{ color: 'var(--accent)', fontWeight: 600 }}>Let us know.</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

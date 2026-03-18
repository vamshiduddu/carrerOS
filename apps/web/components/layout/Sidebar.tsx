'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Search,
  Mic,
  MessageSquare,
  Settings,
  CreditCard,
  Bell,
  Puzzle,
  LogOut,
  Sparkles
} from 'lucide-react';
import { clearToken } from '../../lib/api';
import { useRouter } from 'next/navigation';

const mainNav = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/resume', label: 'Resumes', icon: FileText },
  { href: '/applications', label: 'Applications', icon: Briefcase },
  { href: '/jobs', label: 'Job Matches', icon: Search },
  { href: '/interview', label: 'Interview Copilot', icon: Mic },
  { href: '/mock', label: 'Mock Practice', icon: MessageSquare }
];

const settingsNav = [
  { href: '/settings', label: 'Profile', icon: Settings },
  { href: '/settings/subscription', label: 'Subscription', icon: CreditCard },
  { href: '/settings/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings/integrations', label: 'Integrations', icon: Puzzle }
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  function logout() {
    clearToken();
    router.push('/login');
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <Sparkles size={16} />
        </div>
        <span className="sidebar-logo-text">Career<span>OS</span></span>
      </div>

      <nav className="sidebar-nav">
        <p className="sidebar-section-label">Workspace</p>
        {mainNav.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
            >
              <Icon className="nav-icon" size={17} />
              {item.label}
            </Link>
          );
        })}

        <p className="sidebar-section-label">Settings</p>
        {settingsNav.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname === item.href ? 'active' : ''}`}
            >
              <Icon className="nav-icon" size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-link" onClick={logout} style={{ width: '100%' }}>
          <LogOut size={17} className="nav-icon" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

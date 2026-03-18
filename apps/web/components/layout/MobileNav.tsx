'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Briefcase, Search, Mic } from 'lucide-react';

const nav = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/resume', label: 'Resumes', icon: FileText },
  { href: '/applications', label: 'Apps', icon: Briefcase },
  { href: '/jobs', label: 'Jobs', icon: Search },
  { href: '/interview', label: 'Interview', icon: Mic }
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: 'rgba(255,255,255,0.95)',
      borderTop: '1px solid var(--line-solid)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '0.5rem 0'
    }}>
      {nav.map((item) => {
        const Icon = item.icon;
        const active = item.href === '/dashboard'
          ? pathname === '/dashboard'
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.2rem',
              padding: '0.3rem 0.8rem',
              borderRadius: '10px',
              color: active ? 'var(--accent)' : 'var(--muted)',
              fontSize: '0.68rem',
              fontWeight: active ? 700 : 500,
              transition: 'color 0.15s ease',
              textDecoration: 'none'
            }}
          >
            <Icon size={20} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

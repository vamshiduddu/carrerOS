'use client';

import { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';
import MobileNav from '../../components/layout/MobileNav';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <Sidebar />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            zIndex: 35,
            display: 'none'
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main */}
      <div className="main-content">
        <TopBar
          onMenuClick={() => setMobileOpen(!mobileOpen)}
          mobileMenuOpen={mobileOpen}
        />
        <div className="page-wrapper">
          {children}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}

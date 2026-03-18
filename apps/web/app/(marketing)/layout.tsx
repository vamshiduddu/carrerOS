import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="marketing-nav">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '9px',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: '0.8rem'
            }}>C</div>
            <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' }}>
              Career<span style={{ color: 'var(--accent)' }}>OS</span>
            </span>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link href="/features" className="btn btn-ghost" style={{ fontSize: '0.875rem' }}>Features</Link>
            <Link href="/pricing" className="btn btn-ghost" style={{ fontSize: '0.875rem' }}>Pricing</Link>
            <Link href="/login" className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>Log In</Link>
            <Link href="/register" className="btn btn-primary" style={{ fontSize: '0.875rem' }}>Get Started</Link>
          </nav>
        </div>
      </header>

      {children}

      <footer style={{
        borderTop: '1px solid var(--line-solid)',
        padding: '2rem 0',
        marginTop: '4rem',
        color: 'var(--muted)',
        fontSize: '0.85rem'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span>© 2026 CareerOS · Built to help you land faster.</span>
          <div style={{ display: 'flex', gap: '1.2rem' }}>
            <Link href="/features">Features</Link>
            <Link href="/pricing">Pricing</Link>
          </div>
        </div>
      </footer>
    </>
  );
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div className="panel fade-in" style={{ width: 'min(480px, 100%)', padding: '2.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1, marginBottom: '0.5rem' }}>404</div>
        <h1 className="title-display" style={{ margin: '0 0 0.5rem', fontSize: '1.6rem' }}>Page not found</h1>
        <p style={{ margin: '0 0 1.5rem', color: 'var(--muted)' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn-primary">Back to Home</Link>
          <Link href="/dashboard" className="btn btn-secondary">Go to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles, CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { api } from '../../../lib/api';

function VerifyContent() {
  const params = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Please request a new one.');
      return;
    }
    api.post('/v1/auth/verify-email', { token })
      .then(() => { setStatus('success'); setMessage('Your email has been verified successfully!'); })
      .catch(e => { setStatus('error'); setMessage(e instanceof Error ? e.message : 'Verification failed.'); });
  }, [token]);

  return (
    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
      {status === 'loading' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <Loader2 size={36} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
          <h2 className="title-display" style={{ margin: '0 0 0.4rem', fontSize: '1.4rem' }}>Verifying your email...</h2>
          <p style={{ color: 'var(--muted)', margin: 0, fontSize: '0.9rem' }}>Just a moment.</p>
        </>
      )}
      {status === 'success' && (
        <>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--success-muted)', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <CheckCircle size={26} />
          </div>
          <h2 className="title-display" style={{ margin: '0 0 0.4rem', fontSize: '1.4rem' }}>Email Verified!</h2>
          <p style={{ color: 'var(--muted)', margin: '0 0 1.5rem', fontSize: '0.9rem' }}>{message}</p>
          <Link href="/login" className="btn btn-primary">Sign In to CareerOS</Link>
        </>
      )}
      {status === 'error' && (
        <>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--danger-muted)', color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <XCircle size={26} />
          </div>
          <h2 className="title-display" style={{ margin: '0 0 0.4rem', fontSize: '1.4rem' }}>Verification Failed</h2>
          <p style={{ color: 'var(--muted)', margin: '0 0 1.5rem', fontSize: '0.9rem' }}>{message}</p>
          <Link href="/login" className="btn btn-secondary" style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <div className="auth-container">
      <div className="auth-card panel fade-in">
        <div className="auth-logo">
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, var(--accent), var(--accent-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Sparkles size={18} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
            Career<span style={{ color: 'var(--accent)' }}>OS</span>
          </span>
        </div>
        <Suspense fallback={<div style={{ textAlign: 'center', color: 'var(--muted)', padding: '1rem 0' }}>Loading...</div>}>
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  );
}

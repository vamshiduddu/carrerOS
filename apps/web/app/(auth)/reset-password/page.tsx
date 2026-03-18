'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';
import { Sparkles, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { api } from '../../../lib/api';

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/v1/auth/reset-password', { token, password });
      router.push('/login?reset=success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed. Try requesting a new link.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: '0.9rem' }}>
      {!token && (
        <div className="alert alert-error">Invalid or expired reset link. Please request a new one.</div>
      )}
      <div className="field-group">
        <label className="field-label" htmlFor="password">New password</label>
        <div style={{ position: 'relative' }}>
          <input
            id="password"
            className="input"
            type={showPass ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            required
            minLength={8}
            disabled={!token}
            style={{ paddingRight: '2.5rem' }}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0, display: 'flex', alignItems: 'center' }}
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <button disabled={loading || !token} className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
        {loading ? 'Resetting...' : 'Set New Password'}
      </button>
    </form>
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
        <h1 className="title-display" style={{ margin: '0 0 0.35rem', fontSize: '1.7rem' }}>Set new password</h1>
        <p style={{ margin: '0 0 1.5rem', color: 'var(--muted)', fontSize: '0.9rem' }}>Choose a strong password for your account.</p>
        <Suspense fallback={<div style={{ color: 'var(--muted)' }}>Loading...</div>}>
          <ResetForm />
        </Suspense>
        <p style={{ margin: '1rem 0 0', textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted)' }}>
          <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <ArrowLeft size={13} /> Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

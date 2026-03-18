'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Sparkles, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { api } from '../../../lib/api';

export default function Page() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/v1/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card panel fade-in">
        <div className="auth-logo">
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <Sparkles size={18} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
            Career<span style={{ color: 'var(--accent)' }}>OS</span>
          </span>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'var(--success-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: 'var(--success)'
            }}>
              <CheckCircle size={26} />
            </div>
            <h2 className="title-display" style={{ margin: '0 0 0.5rem', fontSize: '1.4rem' }}>Check your inbox</h2>
            <p style={{ color: 'var(--muted)', margin: '0 0 1.5rem', fontSize: '0.9rem' }}>
              We sent a password reset link to <strong>{email}</strong>. It expires in 1 hour.
            </p>
            <Link href="/login" className="btn btn-secondary" style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
              <ArrowLeft size={15} />
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <h1 className="title-display" style={{ margin: '0 0 0.35rem', fontSize: '1.7rem' }}>Reset your password</h1>
            <p style={{ margin: '0 0 1.5rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
              Enter your email and we&apos;ll send you a link to get back in.
            </p>

            <form onSubmit={onSubmit} style={{ display: 'grid', gap: '0.9rem' }}>
              <div className="field-group">
                <label className="field-label" htmlFor="email">Email address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="email"
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <Mail size={16} style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--muted)'
                  }} />
                </div>
              </div>

              {error && (
                <div className="alert alert-error" style={{ fontSize: '0.875rem' }}>{error}</div>
              )}

              <button
                disabled={loading}
                className="btn btn-primary"
                type="submit"
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <p style={{ margin: '1rem 0 0', textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted)' }}>
              <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <ArrowLeft size={13} /> Back to Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

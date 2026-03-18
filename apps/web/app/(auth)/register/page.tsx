'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Eye, EyeOff, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { api, setToken } from '../../../lib/api';

type RegisterResponse = { accessToken: string };

export default function Page() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'][passwordStrength];
  const strengthColor = ['', 'var(--danger)', 'var(--warning)', 'var(--success)'][passwordStrength];

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await api.post<RegisterResponse>('/v1/auth/register', { fullName, email, password });
      setToken(result.accessToken);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Try again.');
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

        <h1 className="title-display" style={{ margin: '0 0 0.35rem', fontSize: '1.7rem' }}>Create your account</h1>
        <p style={{ margin: '0 0 1.5rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
          Start building smarter resumes and tracking applications.
        </p>

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: '0.9rem' }}>
          <div className="field-group">
            <label className="field-label" htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              className="input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Smith"
              required
              autoComplete="name"
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="email">Email address</label>
            <input
              id="email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="password">Password</label>
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
                autoComplete="new-password"
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--muted)',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {password && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                <div style={{ flex: 1, height: 4, borderRadius: 4, background: 'var(--line-solid)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${(passwordStrength / 3) * 100}%`,
                    background: strengthColor,
                    borderRadius: 4,
                    transition: 'width 0.3s ease, background 0.3s ease'
                  }} />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: strengthColor }}>{strengthLabel}</span>
              </div>
            )}
          </div>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="btn btn-primary"
            type="submit"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ margin: '1.2rem 0 0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {['Free forever plan available', 'No credit card required', 'ATS-optimized from day one'].map((t) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--muted)' }}>
              <CheckCircle size={13} color="var(--accent)" />
              {t}
            </div>
          ))}
        </div>

        <p style={{ margin: '1.2rem 0 0', textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '../../../../lib/api';
import { User, CreditCard, Bell, Puzzle, CheckCircle, Zap, Crown } from 'lucide-react';

const settingsNav = [
  { href: '/settings', label: 'Profile', icon: User },
  { href: '/settings/subscription', label: 'Subscription', icon: CreditCard },
  { href: '/settings/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings/integrations', label: 'Integrations', icon: Puzzle }
];

type Plan = { id: string; name: string; displayName: string; priceMonthly: number; features?: string[] };
type SubPayload = { subscription: { planId: string; plan?: { displayName: string }; status?: string } | null };

const planFeatures: Record<string, string[]> = {
  free:    ['1 resume', '5 applications', 'Basic ATS score', 'Job feed'],
  starter: ['5 resumes', 'Unlimited apps', 'Full ATS optimizer', 'Cover letters', 'Interview prep'],
  pro:     ['Unlimited resumes', 'Auto-apply engine', 'Interview copilot', 'Mock interviews', 'Stealth mode', '24/7 support']
};

export default function Page() {
  const pathname = usePathname();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<Plan[]>('/v1/billing/plans').catch(() => []),
      api.get<SubPayload>('/v1/billing/subscription').catch(() => ({ subscription: null }))
    ]).then(([plansData, subData]) => {
      setPlans(Array.isArray(plansData) ? plansData : []);
      setCurrentPlanId(subData.subscription?.planId ?? null);
      setLoading(false);
    });
  }, []);

  async function choosePlan(planId: string) {
    setProcessingId(planId);
    setMessage('');
    try {
      const result = await api.post<{ url?: string }>('/v1/billing/checkout', { planId });
      if (result.url) {
        window.location.href = result.url;
      } else {
        setCurrentPlanId(planId);
        setMessage('Plan updated successfully');
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Plan update failed');
    } finally { setProcessingId(null); }
  }

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
              <Crown size={18} color="var(--accent-2)" />
              <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>Subscription & Billing</h2>
            </div>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.875rem' }}>
              Manage your plan and billing information.
            </p>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1rem' }}>
              {[1,2,3].map(n => <div key={n} className="skeleton" style={{ height: 280, borderRadius: 18 }} />)}
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1rem', marginBottom: '1rem' }}>
                {plans.map((plan) => {
                  const active = currentPlanId === plan.id;
                  const features = plan.features ?? planFeatures[plan.name.toLowerCase()] ?? [];
                  const isPopular = plan.name.toLowerCase() === 'starter';
                  return (
                    <article
                      key={plan.id}
                      className="panel"
                      style={{
                        padding: '1.4rem',
                        border: active ? '2px solid var(--accent)' : isPopular ? '2px solid var(--accent)' : undefined,
                        position: 'relative'
                      }}
                    >
                      {isPopular && !active && (
                        <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, var(--accent), var(--accent-light))', color: 'white', padding: '0.15rem 0.7rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                          Most Popular
                        </div>
                      )}
                      {active && (
                        <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: 'white', padding: '0.15rem 0.7rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle size={11} /> Current Plan
                        </div>
                      )}
                      <h3 style={{ margin: '0 0 0.2rem', fontWeight: 800 }}>{plan.displayName}</h3>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>${(plan.priceMonthly / 100).toFixed(0)}</span>
                        <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>/mo</span>
                      </div>
                      <ul style={{ margin: '0 0 1.2rem', padding: 0, listStyle: 'none', display: 'grid', gap: '0.45rem' }}>
                        {features.map(f => (
                          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}>
                            <CheckCircle size={13} color="var(--accent)" style={{ flexShrink: 0 }} />{f}
                          </li>
                        ))}
                      </ul>
                      <button
                        className={`btn ${active ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={() => !active && choosePlan(plan.id)}
                        disabled={active || processingId === plan.id}
                      >
                        {processingId === plan.id ? 'Processing...' : active ? 'Current Plan' : <><Zap size={14} /> Choose Plan</>}
                      </button>
                    </article>
                  );
                })}
              </div>
              {message && (
                <p style={{ color: message.includes('success') ? 'var(--success)' : 'var(--danger)', margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>
                  {message}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { CheckCircle, Zap } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Perfect for getting started',
    cta: 'Get Started',
    href: '/register',
    features: [
      '1 resume',
      '5 application slots',
      'Basic ATS scoring',
      'Job search feed',
      'Email support'
    ],
    popular: false
  },
  {
    name: 'Starter',
    price: '$19',
    period: '/month',
    desc: 'For active job seekers',
    cta: 'Start with Starter',
    href: '/register',
    features: [
      '5 resumes',
      'Unlimited applications',
      'Full ATS optimization',
      'AI cover letter generator',
      'Interview session prep',
      'Priority email support'
    ],
    popular: true
  },
  {
    name: 'Pro',
    price: '$39',
    period: '/month',
    desc: 'Maximum job-hunting velocity',
    cta: 'Go Pro',
    href: '/register',
    features: [
      'Unlimited resumes',
      'Auto-apply engine',
      'AI interview copilot',
      'Mock interview sessions',
      'Real-time coaching',
      'Stealth mode overlay',
      'Slack/email reminders',
      'Priority 24/7 support'
    ],
    popular: false
  }
];

export default function Page() {
  return (
    <main className="container" style={{ padding: '3rem 0 5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'var(--accent-muted)',
          color: 'var(--accent)',
          padding: '0.3rem 0.8rem',
          borderRadius: '999px',
          fontSize: '0.8rem',
          fontWeight: 600,
          marginBottom: '1rem'
        }}>
          <Zap size={13} />
          Simple, transparent pricing
        </div>
        <h1 className="title-display" style={{ margin: '0 0 0.75rem', fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
          Invest in your career
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1rem', margin: 0 }}>
          Start free, upgrade when you&apos;re ready. Cancel anytime.
        </p>
      </div>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem', maxWidth: 900, margin: '0 auto' }}>
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`panel ${plan.popular ? 'pricing-popular' : ''}`}
            style={{ padding: '1.8rem', position: 'relative' }}
          >
            {plan.popular && (
              <div className="pricing-popular-badge">Most Popular</div>
            )}
            <h3 style={{ margin: '0 0 0.25rem', fontWeight: 800, fontSize: '1.1rem' }}>{plan.name}</h3>
            <p style={{ margin: '0 0 1rem', color: 'var(--muted)', fontSize: '0.85rem' }}>{plan.desc}</p>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{plan.price}</span>
              <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{plan.period}</span>
            </div>

            <Link
              href={plan.href}
              className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
              style={{ width: '100%', justifyContent: 'center', marginBottom: '1.5rem' }}
            >
              {plan.cta}
            </Link>

            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.6rem' }}>
              {plan.features.map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <CheckCircle size={15} color="var(--accent)" style={{ flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <div style={{ textAlign: 'center', marginTop: '2.5rem', color: 'var(--muted)', fontSize: '0.875rem' }}>
        <p>All plans include a 14-day free trial. No credit card required to start.</p>
        <p>Need a custom enterprise plan? <a href="mailto:hello@careeros.app" style={{ color: 'var(--accent)', fontWeight: 600 }}>Contact us</a></p>
      </div>
    </main>
  );
}

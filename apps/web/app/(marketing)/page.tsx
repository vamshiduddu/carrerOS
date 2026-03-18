import Link from 'next/link';
import { Sparkles, Zap, Target, Mic, BarChart3, CheckCircle } from 'lucide-react';

const features = [
  {
    icon: Target,
    color: '#12785a',
    bg: 'rgba(18,120,90,0.1)',
    title: 'Smart Resume Builder',
    desc: 'Create ATS-optimized resumes tailored for each role. AI rewrites bullets to match job descriptions and score your fit before you apply.'
  },
  {
    icon: BarChart3,
    color: '#0ea5e9',
    bg: 'rgba(14,165,233,0.1)',
    title: 'Application Pipeline',
    desc: 'Track every opportunity on a visual kanban board. Add notes, set reminders, and never lose track of where you stand.'
  },
  {
    icon: Zap,
    color: '#f4a63c',
    bg: 'rgba(244,166,60,0.12)',
    title: 'AI Job Matching',
    desc: 'Our engine scrapes thousands of listings and surfaces the best matches for your profile. Auto-apply to your top picks.'
  },
  {
    icon: Mic,
    color: '#9333ea',
    bg: 'rgba(147,51,234,0.1)',
    title: 'Interview Copilot',
    desc: 'Real-time AI assistance during interviews. Get instant suggestions, STAR-method coaching, and stealth overlay mode.'
  }
];

const stats = [
  { value: '2.4×', label: 'more interviews with AI-tailored resumes' },
  { value: '68%', label: 'of users land a role within 60 days' },
  { value: '10k+', label: 'job listings scraped daily' }
];

const testimonials = [
  { name: 'Alex M.', role: 'Software Engineer', quote: 'CareerOS cut my job search from 4 months to 6 weeks. The resume tailoring alone is worth it.' },
  { name: 'Priya K.', role: 'Product Manager', quote: 'The interview copilot gave me confidence I never had before. Landed my dream job at a Series B startup.' },
  { name: 'Jordan T.', role: 'UX Designer', quote: 'I went from scattered spreadsheets to a clear pipeline. The kanban view is exactly what I needed.' }
];

export default function Page() {
  return (
    <main>
      {/* Hero */}
      <section className="container" style={{ padding: '4rem 0 2.5rem' }}>
        <div className="panel fade-in" style={{ padding: 'clamp(2rem, 5vw, 3.5rem)', maxWidth: 780, margin: '0 auto', textAlign: 'center' }}>
          <div className="hero-badge">
            <Sparkles size={13} />
            AI-powered career acceleration
          </div>
          <h1 className="title-display title-lg" style={{ margin: '0 0 1rem' }}>
            Build your career<br />at full speed.
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--muted)', maxWidth: 560, margin: '0 auto 2rem', lineHeight: 1.7 }}>
            One intelligent platform for smarter resumes, organized applications, and AI-guided interview prep. Go from searching to signed in record time.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-primary" style={{ padding: '0.8rem 1.6rem', fontSize: '1rem' }}>
              Start Free Today
            </Link>
            <Link href="/pricing" className="btn btn-secondary" style={{ padding: '0.8rem 1.6rem', fontSize: '1rem' }}>
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container" style={{ padding: '1rem 0 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="panel fade-in"
              style={{ padding: '1.2rem', textAlign: 'center', animationDelay: `${i * 80}ms` }}
            >
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent)' }}>{stat.value}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '0.25rem' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container" style={{ padding: '2rem 0 3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 className="title-display" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', margin: '0 0 0.5rem' }}>
            Everything your job search needs
          </h2>
          <p style={{ color: 'var(--muted)', margin: 0, fontSize: '1rem' }}>
            From first application to offer letter — all in one place.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <article key={f.title} className="panel fade-in" style={{ padding: '1.4rem', animationDelay: `${i * 70}ms` }}>
                <div className="feature-icon" style={{ background: f.bg, color: f.color }}>
                  <Icon size={20} />
                </div>
                <h3 style={{ margin: '0 0 0.5rem', fontWeight: 700, fontSize: '1rem' }}>{f.title}</h3>
                <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.65, fontSize: '0.9rem' }}>{f.desc}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container" style={{ padding: '1rem 0 3rem' }}>
        <h2 className="title-display" style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', margin: '0 0 1.5rem', textAlign: 'center' }}>
          Real results from real job seekers
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {testimonials.map((t, i) => (
            <article key={t.name} className="panel fade-in" style={{ padding: '1.4rem', animationDelay: `${i * 70}ms` }}>
              <p style={{ margin: '0 0 1rem', color: 'var(--ink)', lineHeight: 1.65, fontSize: '0.92rem', fontStyle: 'italic' }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  flexShrink: 0
                }}>
                  {t.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{t.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{t.role}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container" style={{ padding: '1rem 0 4rem' }}>
        <div className="panel" style={{ padding: 'clamp(2rem, 4vw, 3rem)', textAlign: 'center', background: 'linear-gradient(135deg, rgba(18,120,90,0.06), rgba(244,166,60,0.06))' }}>
          <h2 className="title-display" style={{ margin: '0 0 0.75rem', fontSize: 'clamp(1.4rem, 3vw, 2.2rem)' }}>
            Ready to accelerate your search?
          </h2>
          <p style={{ color: 'var(--muted)', margin: '0 0 1.5rem', fontSize: '1rem' }}>
            Free to start. No credit card required.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
              Create Free Account
            </Link>
            <Link href="/features" className="btn btn-secondary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
              See All Features
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', justifyContent: 'center', marginTop: '1.2rem', flexWrap: 'wrap' }}>
            {['No credit card', 'Cancel anytime', 'ATS-optimized'].map((text) => (
              <span key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
                <CheckCircle size={14} color="var(--accent)" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

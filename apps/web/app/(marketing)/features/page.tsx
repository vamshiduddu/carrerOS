import Link from 'next/link';
import { FileText, Briefcase, Search, Mic, MessageSquare, Bell, CreditCard, Sparkles } from 'lucide-react';

const features = [
  {
    icon: FileText,
    color: '#12785a',
    bg: 'rgba(18,120,90,0.1)',
    title: 'Resume Intelligence',
    items: [
      'Section-based drag & drop editor',
      'AI bullet rewriter with job context',
      'ATS keyword scoring per listing',
      'Multiple resume versions per role',
      'PDF export with clean templates',
      'Cover letter generator'
    ]
  },
  {
    icon: Briefcase,
    color: '#0ea5e9',
    bg: 'rgba(14,165,233,0.1)',
    title: 'Application Pipeline',
    items: [
      'Visual kanban board (Saved → Offer)',
      'Timeline with activity log',
      'Notes and follow-up reminders',
      'Status tracking across all roles',
      'Company research assistant',
      'Response rate analytics'
    ]
  },
  {
    icon: Search,
    color: '#f4a63c',
    bg: 'rgba(244,166,60,0.12)',
    title: 'Job Discovery',
    items: [
      'Aggregated feed from top job boards',
      'AI match scoring vs your profile',
      'Save and filter by preferences',
      'Auto-apply engine for top matches',
      'Remote / hybrid / in-office filters',
      'Salary range visibility'
    ]
  },
  {
    icon: Mic,
    color: '#9333ea',
    bg: 'rgba(147,51,234,0.1)',
    title: 'Interview Copilot',
    items: [
      'Real-time AI suggestion panel',
      'Stealth overlay mode for live calls',
      'Audio transcription & analysis',
      'Company & role context loaded',
      'Session history & review',
      'Custom system prompts'
    ]
  },
  {
    icon: MessageSquare,
    color: '#e11d48',
    bg: 'rgba(225,29,72,0.08)',
    title: 'Mock Interview Engine',
    items: [
      'STAR-method question library',
      'Behavioral & technical categories',
      'AI feedback on each answer',
      'Score + strengths/improvements report',
      'Practice by company/role type',
      'Session replay and history'
    ]
  },
  {
    icon: Bell,
    color: '#0891b2',
    bg: 'rgba(8,145,178,0.1)',
    title: 'Smart Notifications',
    items: [
      'Application follow-up reminders',
      'Interview countdown alerts',
      'Job match alerts',
      'Offer deadline warnings',
      'Email and in-app channels',
      'Custom notification preferences'
    ]
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
          <Sparkles size={13} />
          Full feature breakdown
        </div>
        <h1 className="title-display" style={{ margin: '0 0 0.75rem', fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
          Built for every stage of your search
        </h1>
        <p style={{ color: 'var(--muted)', margin: 0, fontSize: '1rem', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
          CareerOS covers everything — from tailoring your resume to acing the final round.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.2rem' }}>
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <article key={f.title} className="panel fade-in" style={{ padding: '1.6rem', animationDelay: `${i * 60}ms` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.1rem' }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '11px',
                  background: f.bg,
                  color: f.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={20} />
                </div>
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>{f.title}</h3>
              </div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.5rem' }}>
                {f.items.map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                    <span style={{ color: f.color, marginTop: '3px', flexShrink: 0 }}>•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      <div className="panel" style={{ padding: '2rem', textAlign: 'center', marginTop: '2.5rem', background: 'linear-gradient(135deg, rgba(18,120,90,0.06), rgba(244,166,60,0.06))' }}>
        <h2 className="title-display" style={{ margin: '0 0 0.5rem', fontSize: '1.8rem' }}>Everything you need to land faster</h2>
        <p style={{ color: 'var(--muted)', margin: '0 0 1.5rem' }}>Free to start. Upgrade when it&#39;s working.</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" className="btn btn-primary" style={{ padding: '0.75rem 1.8rem' }}>Get Started Free</Link>
          <Link href="/pricing" className="btn btn-secondary" style={{ padding: '0.75rem 1.8rem' }}>See Pricing</Link>
        </div>
      </div>
    </main>
  );
}

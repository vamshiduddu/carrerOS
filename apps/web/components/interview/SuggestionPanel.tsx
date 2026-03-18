import { Lightbulb, Star, Target, Users, TrendingUp } from 'lucide-react';

interface SuggestionPanelProps {
  sessionId: string;
}

const TIPS = [
  {
    icon: Star,
    color: 'var(--accent-2)',
    bg: 'var(--accent-2-muted)',
    title: 'Use the STAR Method',
    tip: 'Structure every answer: Situation → Task → Action → Result. Keep each section concise and specific.',
  },
  {
    icon: Target,
    color: 'var(--accent)',
    bg: 'var(--accent-muted)',
    title: 'Quantify Your Impact',
    tip: 'Use numbers whenever possible. "Improved performance by 40%" is more compelling than "made it faster."',
  },
  {
    icon: Users,
    color: '#9333ea',
    bg: 'rgba(147,51,234,0.08)',
    title: 'Show Leadership & Collaboration',
    tip: 'Even if the role is individual contributor, highlight times you mentored others or drove cross-team alignment.',
  },
  {
    icon: TrendingUp,
    color: '#0ea5e9',
    bg: 'rgba(14,165,233,0.1)',
    title: 'Demonstrate Growth Mindset',
    tip: 'End behavioral answers by sharing what you learned. Interviewers value self-awareness and continuous improvement.',
  },
  {
    icon: Lightbulb,
    color: 'var(--warning)',
    bg: 'var(--warning-muted)',
    title: 'Pause & Clarify',
    tip: 'For ambiguous questions, ask one clarifying question before answering. It shows structured thinking.',
  },
];

export default function SuggestionPanel({ sessionId: _ }: SuggestionPanelProps) {
  return (
    <div className="panel" style={{ padding: '1.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Lightbulb size={16} style={{ color: 'var(--accent-2)' }} />
        <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Interview Tips</h3>
      </div>

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {TIPS.map((tip, i) => {
          const Icon = tip.icon;
          return (
            <div key={i} style={{
              display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
              padding: '0.8rem', borderRadius: 'var(--radius-sm)',
              background: tip.bg, border: `1px solid ${tip.color}20`,
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={14} style={{ color: tip.color }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.2rem', color: 'var(--ink)' }}>
                  {tip.title}
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                  {tip.tip}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

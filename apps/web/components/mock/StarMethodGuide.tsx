'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Star } from 'lucide-react';

const STAR_STEPS = [
  {
    letter: 'S',
    label: 'Situation',
    color: '#0ea5e9',
    bg: 'rgba(14,165,233,0.1)',
    description: 'Set the context. Describe the situation you were in or the task you needed to accomplish.',
    tip: 'Be specific. When? Where? What was happening? Keep it brief — 1-2 sentences max.',
    example: '"In my previous role at Acme, our customer churn rate had risen 15% over Q3 due to poor onboarding."',
  },
  {
    letter: 'T',
    label: 'Task',
    color: '#9333ea',
    bg: 'rgba(147,51,234,0.1)',
    description: 'Explain your specific responsibility. What was expected of you in that situation?',
    tip: 'Distinguish your role from the team\'s role. Use "I" not "we" here.',
    example: '"I was tasked with redesigning the onboarding flow to reduce time-to-value for new users."',
  },
  {
    letter: 'A',
    label: 'Action',
    color: 'var(--accent)',
    bg: 'var(--accent-muted)',
    description: 'Describe the specific steps you took. This is the most important part — show your thinking.',
    tip: 'Use action verbs. Describe your decision-making process. Quantify your effort where possible.',
    example: '"I conducted user interviews, prototyped 3 designs, ran A/B tests, and shipped a new flow with 5 engineers."',
  },
  {
    letter: 'R',
    label: 'Result',
    color: 'var(--success)',
    bg: 'var(--success-muted)',
    description: 'Share the outcome. What happened as a result of your actions? Quantify if possible.',
    tip: 'Numbers make results compelling: "reduced by 40%", "saved 200 hours/month", "generated $500k ARR".',
    example: '"Churn dropped 23% in 60 days. The redesign became the company template for all new products."',
  },
];

interface StarMethodGuideProps {
  highlightSection?: 'S' | 'T' | 'A' | 'R';
}

export default function StarMethodGuide({ highlightSection }: StarMethodGuideProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="panel" style={{ padding: '1.1rem' }}>
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'inherit', padding: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Star size={15} style={{ color: 'var(--accent-2)' }} />
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>STAR Method Guide</span>
        </div>
        {expanded ? <ChevronUp size={15} style={{ color: 'var(--muted)' }} /> : <ChevronDown size={15} style={{ color: 'var(--muted)' }} />}
      </button>

      {expanded && (
        <div style={{ marginTop: '0.9rem', display: 'grid', gap: '0.6rem' }}>
          {STAR_STEPS.map(step => {
            const isHighlighted = highlightSection === step.letter;
            return (
              <div
                key={step.letter}
                style={{
                  border: `1.5px solid ${isHighlighted ? step.color : 'var(--line-solid)'}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem',
                  background: isHighlighted ? step.bg : 'transparent',
                  transition: 'border-color 0.15s ease, background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: 8,
                    background: step.bg, color: step.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.85rem', flexShrink: 0,
                  }}>
                    {step.letter}
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: step.color }}>{step.label}</span>
                </div>
                <p style={{ margin: '0 0 0.3rem', fontSize: '0.82rem', color: 'var(--ink)', lineHeight: 1.5 }}>
                  {step.description}
                </p>
                <p style={{ margin: '0 0 0.3rem', fontSize: '0.78rem', color: 'var(--muted)', fontStyle: 'italic', lineHeight: 1.4 }}>
                  Tip: {step.tip}
                </p>
                <p style={{ margin: 0, fontSize: '0.78rem', color: step.color, background: step.bg, padding: '0.3rem 0.6rem', borderRadius: 6, lineHeight: 1.5 }}>
                  {step.example}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

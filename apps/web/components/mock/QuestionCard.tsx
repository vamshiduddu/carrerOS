'use client';

import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';

interface QuestionCardProps {
  question: string;
  index: number;
  total: number;
  onAnswer: (answer: string) => void;
}

export default function QuestionCard({ question, index, total, onAnswer }: QuestionCardProps) {
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!answer.trim()) return;
    setSubmitting(true);
    await onAnswer(answer);
    setSubmitting(false);
  }

  const progress = ((index) / total) * 100;

  return (
    <div className="panel" style={{ padding: '1.5rem' }}>
      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Question {index + 1} of {total}
        </span>
        <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600 }}>
          {Math.round(progress)}% complete
        </span>
      </div>
      <div className="progress-track" style={{ marginBottom: '1.2rem' }}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
        background: 'var(--accent-muted)',
        border: '1px solid rgba(18,120,90,0.15)',
        borderRadius: 'var(--radius-sm)',
        padding: '1rem 1.1rem',
        marginBottom: '1.2rem',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: 'var(--accent)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <MessageSquare size={15} />
        </div>
        <p style={{ margin: 0, fontWeight: 600, fontSize: '1rem', lineHeight: 1.5 }}>
          {question}
        </p>
      </div>

      {/* Answer */}
      <div className="field-group" style={{ marginBottom: '0.9rem' }}>
        <label className="field-label">Your Answer</label>
        <textarea
          className="textarea"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="Use the STAR method: describe the Situation, Task, Action you took, and the Result..."
          rows={6}
          style={{ minHeight: 140 }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{answer.length} characters</span>
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={submitting || !answer.trim()}
        style={{ gap: '0.4rem' }}
      >
        <Send size={14} />
        {submitting ? 'Submitting...' : 'Submit Answer'}
      </button>
    </div>
  );
}

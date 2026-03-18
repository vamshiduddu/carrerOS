'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '../../../../lib/api';
import { ArrowLeft, MessageSquare, CheckCircle, ChevronRight, Sparkles, Send, AlertCircle } from 'lucide-react';

type Question = { id: string; question: string; category?: string };
type MockSession = { id: string; status: string; questions: Question[] };
type FeedbackResult = { feedback: string; score?: number; strengths?: string[]; improvements?: string[] };

export default function Page() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<MockSession | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.get<MockSession>(`/v1/mock/${params.id}`)
      .then(setSession)
      .catch(() => {});
  }, [params.id]);

  async function submitAnswer(questionId: string) {
    if (!answer.trim()) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const result = await api.post<FeedbackResult>(`/v1/mock/${params.id}/questions/${questionId}/answer`, { answer });
      setFeedback(result);
      setAnsweredIds(prev => new Set([...prev, questionId]));
      setAnswer('');
    } catch (e) {
      setFeedback({ feedback: e instanceof Error ? e.message : 'Failed to get feedback' });
    } finally { setSubmitting(false); }
  }

  async function complete() {
    setCompleting(true);
    try {
      await api.post(`/v1/mock/${params.id}/complete`, {});
      router.push(`/mock/${params.id}/report`);
    } catch { setCompleting(false); }
  }

  if (!session) return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {[1,2].map(n => <div key={n} className="skeleton" style={{ height: 120, borderRadius: 18 }} />)}
    </div>
  );

  const questions = session.questions ?? [];
  const current = questions[currentIdx];
  const allAnswered = questions.length > 0 && questions.every(q => answeredIds.has(q.id));

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/mock" className="btn btn-ghost btn-icon"><ArrowLeft size={18} /></Link>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.4rem' }}>Mock Interview</h1>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--muted)', fontSize: '0.85rem' }}>
              {questions.length > 0 ? `Question ${currentIdx + 1} of ${questions.length}` : 'Loading questions...'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {allAnswered && (
            <button className="btn btn-primary" onClick={complete} disabled={completing}>
              <CheckCircle size={15} /> {completing ? 'Finishing...' : 'Complete & Get Report'}
            </button>
          )}
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <MessageSquare size={32} color="var(--accent)" style={{ marginBottom: '0.75rem' }} />
          <p style={{ margin: 0, color: 'var(--muted)' }}>No questions in this session.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.2rem', alignItems: 'start' }}>
          {/* Question List */}
          <div className="panel" style={{ padding: '0.9rem' }}>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>Questions</h3>
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => { setCurrentIdx(i); setFeedback(null); setAnswer(''); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  width: '100%', padding: '0.5rem 0.6rem', borderRadius: 10,
                  border: i === currentIdx ? '2px solid var(--accent)' : '1px solid transparent',
                  background: i === currentIdx ? 'var(--accent-muted)' : 'transparent',
                  cursor: 'pointer', textAlign: 'left', marginBottom: '0.3rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: answeredIds.has(q.id) ? 'var(--success-muted)' : i === currentIdx ? 'var(--accent-muted)' : 'var(--line-solid)',
                  color: answeredIds.has(q.id) ? 'var(--success)' : i === currentIdx ? 'var(--accent)' : 'var(--muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700
                }}>
                  {answeredIds.has(q.id) ? <CheckCircle size={12} /> : i + 1}
                </div>
                <span style={{ fontSize: '0.78rem', color: i === currentIdx ? 'var(--accent)' : 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, fontWeight: i === currentIdx ? 600 : 400 }}>
                  Q{i + 1}
                </span>
              </button>
            ))}
          </div>

          {/* Current Question */}
          <div style={{ display: 'grid', gap: '1rem' }}>
            {current && (
              <>
                <div className="panel" style={{ padding: '1.4rem' }}>
                  {current.category && (
                    <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600, background: 'var(--accent-muted)', color: 'var(--accent)', marginBottom: '0.75rem' }}>
                      {current.category}
                    </span>
                  )}
                  <h2 style={{ margin: '0 0 1.2rem', fontSize: '1.05rem', lineHeight: 1.5, fontWeight: 600 }}>
                    {current.question}
                  </h2>

                  <div className="field-group">
                    <label className="field-label">Your Answer</label>
                    <textarea
                      className="textarea"
                      value={answer}
                      onChange={e => setAnswer(e.target.value)}
                      placeholder="Use the STAR method: Situation, Task, Action, Result..."
                      rows={6}
                      disabled={answeredIds.has(current.id)}
                    />
                  </div>

                  {!answeredIds.has(current.id) ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                        Tip: Aim for 200–400 words using STAR format
                      </div>
                      <button
                        className="btn btn-primary"
                        onClick={() => submitAnswer(current.id)}
                        disabled={submitting || !answer.trim()}
                      >
                        {submitting ? 'Getting feedback...' : <><Sparkles size={14} /> Submit for AI Feedback</>}
                      </button>
                    </div>
                  ) : (
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                      {currentIdx < questions.length - 1 && (
                        <button className="btn btn-primary btn-sm" onClick={() => { setCurrentIdx(currentIdx + 1); setFeedback(null); setAnswer(''); }}>
                          Next Question <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Feedback */}
                {feedback && (
                  <div className="panel" style={{ padding: '1.3rem', background: 'linear-gradient(135deg, rgba(18,120,90,0.04), rgba(244,166,60,0.04))' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.9rem' }}>
                      <Sparkles size={16} color="var(--accent)" />
                      <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>AI Feedback</h3>
                      {feedback.score != null && (
                        <span style={{ marginLeft: 'auto', fontWeight: 700, color: feedback.score >= 75 ? 'var(--success)' : 'var(--warning)', fontSize: '0.9rem' }}>
                          {feedback.score}/100
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '0 0 0.8rem', color: 'var(--ink)', lineHeight: 1.7, fontSize: '0.9rem' }}>{feedback.feedback}</p>
                    {feedback.strengths && feedback.strengths.length > 0 && (
                      <div style={{ marginBottom: '0.6rem' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--success)', marginBottom: '0.3rem' }}>Strengths</div>
                        {feedback.strengths.map(s => (
                          <div key={s} style={{ display: 'flex', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>
                            <CheckCircle size={13} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />{s}
                          </div>
                        ))}
                      </div>
                    )}
                    {feedback.improvements && feedback.improvements.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--warning)', marginBottom: '0.3rem' }}>To Improve</div>
                        {feedback.improvements.map(s => (
                          <div key={s} style={{ display: 'flex', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>
                            <AlertCircle size={13} color="var(--warning)" style={{ flexShrink: 0, marginTop: 2 }} />{s}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

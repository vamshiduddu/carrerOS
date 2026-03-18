'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Loader, CheckCircle, RotateCcw } from 'lucide-react';
import QuestionCard from './QuestionCard';
import FeedbackPanel from './FeedbackPanel';
import ScoreReport from './ScoreReport';

interface MockSessionInterfaceProps {
  sessionId: string;
}

interface Question {
  id: string;
  text?: string;
  question?: string;
  content?: string;
}

interface AnswerResult {
  feedback?: {
    strengths?: string[];
    improvements?: string[];
    score?: number;
  };
  strengths?: string[];
  improvements?: string[];
  score?: number;
}

export default function MockSessionInterface({ sessionId }: MockSessionInterfaceProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastFeedback, setLastFeedback] = useState<AnswerResult | null>(null);
  const [allAnswers, setAllAnswers] = useState<any[]>([]);
  const [finished, setFinished] = useState(false);
  const [finalReport, setFinalReport] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<any>(`/v1/interviews/sessions/${sessionId}`);
        const qs: Question[] = data.questions ?? data.turns?.filter((t: any) => t.role === 'assistant') ?? [];
        setQuestions(qs);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load session');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sessionId]);

  async function handleAnswer(answer: string) {
    const q = questions[currentIndex];
    try {
      const result = await api.post<AnswerResult>(`/v1/interviews/sessions/${sessionId}/answers`, {
        questionId: q.id,
        answer,
      });
      setLastFeedback(result);
      setAllAnswers(prev => [...prev, { question: q, answer, feedback: result }]);
    } catch {
      // Continue anyway with empty feedback
      setLastFeedback(null);
      setAllAnswers(prev => [...prev, { question: q, answer }]);
    }
  }

  function goNext() {
    setLastFeedback(null);
    if (currentIndex + 1 >= questions.length) {
      // Finished
      setFinished(true);
      api.get<any>(`/v1/interviews/sessions/${sessionId}/report`)
        .then(report => setFinalReport(report))
        .catch(() => {
          // Build a basic report from collected data
          const scores = allAnswers.map(a => a.feedback?.score ?? a.feedback?.feedback?.score ?? 0).filter(s => s > 0);
          const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
          setFinalReport({ score: avgScore, strengths: [], improvements: [] });
        });
    } else {
      setCurrentIndex(i => i + 1);
    }
  }

  function restart() {
    setCurrentIndex(0);
    setLastFeedback(null);
    setAllAnswers([]);
    setFinished(false);
    setFinalReport(null);
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.75rem', color: 'var(--muted)' }}>
        <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading session...
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)', margin: 0 }}>No questions available for this session.</p>
      </div>
    );
  }

  if (finished) {
    if (!finalReport) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.75rem', color: 'var(--muted)' }}>
          <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> Generating report...
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      );
    }
    return (
      <div style={{ display: 'grid', gap: '1rem' }}>
        <ScoreReport
          score={finalReport.score ?? 0}
          strengths={finalReport.strengths ?? []}
          improvements={finalReport.improvements ?? []}
          questions={allAnswers.map((a, i) => ({
            question: a.question.text ?? a.question.question ?? `Question ${i + 1}`,
            score: a.feedback?.score ?? a.feedback?.feedback?.score,
            feedback: a.feedback?.feedback?.text,
          }))}
        />
        <button
          className="btn btn-secondary"
          onClick={restart}
          style={{ justifySelf: 'center', gap: '0.4rem' }}
        >
          <RotateCcw size={14} /> Restart Session
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const questionText = currentQuestion.text ?? currentQuestion.question ?? currentQuestion.content ?? `Question ${currentIndex + 1}`;

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <QuestionCard
        question={questionText}
        index={currentIndex}
        total={questions.length}
        onAnswer={handleAnswer}
      />

      {lastFeedback && (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <FeedbackPanel
            strengths={lastFeedback.feedback?.strengths ?? lastFeedback.strengths ?? []}
            improvements={lastFeedback.feedback?.improvements ?? lastFeedback.improvements ?? []}
            score={lastFeedback.feedback?.score ?? lastFeedback.score}
          />
          <button
            className="btn btn-primary"
            onClick={goNext}
            style={{ justifySelf: 'start', gap: '0.4rem' }}
          >
            <CheckCircle size={14} />
            {currentIndex + 1 >= questions.length ? 'View Final Report' : 'Next Question'}
          </button>
        </div>
      )}
    </div>
  );
}

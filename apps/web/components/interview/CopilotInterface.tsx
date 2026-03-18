'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '../../lib/api';
import { Send, Loader } from 'lucide-react';

interface Turn {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

interface CopilotInterfaceProps {
  sessionId: string;
}

export default function CopilotInterface({ sessionId }: CopilotInterfaceProps) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get<Turn[]>(`/v1/interviews/sessions/${sessionId}/turns`)
      .then(data => setTurns(Array.isArray(data) ? data : []))
      .catch(() => setTurns([]))
      .finally(() => setLoading(false));
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns]);

  async function send() {
    const content = input.trim();
    if (!content || sending) return;
    setInput('');
    setSending(true);

    const userTurn: Turn = { role: 'user', content, createdAt: new Date().toISOString() };
    setTurns(prev => [...prev, userTurn]);

    try {
      const res = await api.post<{ turn: Turn; reply: Turn }>(`/v1/interviews/sessions/${sessionId}/turns`, {
        role: 'user',
        content,
      });
      if (res.reply) {
        setTurns(prev => [...prev, res.reply]);
      } else if (res.turn) {
        // Try to get latest turns
        const latest = await api.get<Turn[]>(`/v1/interviews/sessions/${sessionId}/turns`).catch(() => null);
        if (latest) setTurns(latest);
      }
    } catch {
      setTurns(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        createdAt: new Date().toISOString(),
      }]);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 500, padding: 0, overflow: 'hidden' }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--muted)', gap: '0.5rem' }}>
            <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Loading session...
          </div>
        ) : turns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Interview copilot is ready.</p>
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.82rem' }}>Type a message or your answer to start.</p>
          </div>
        ) : (
          turns.map((turn, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: turn.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {turn.role === 'user' ? 'You' : 'AI Copilot'}
              </span>
              <div className={`chat-bubble ${turn.role}`} style={{ whiteSpace: 'pre-wrap' }}>
                {turn.content}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '0.9rem 1.2rem', borderTop: '1px solid var(--line-solid)', display: 'flex', gap: '0.6rem', alignItems: 'flex-end' }}>
        <textarea
          className="textarea"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your response... (Enter to send, Shift+Enter for new line)"
          rows={2}
          style={{ flex: 1, minHeight: 60, resize: 'none' }}
        />
        <button
          className="btn btn-primary"
          onClick={send}
          disabled={!input.trim() || sending}
          style={{ padding: '0.65rem 0.9rem', alignSelf: 'flex-end' }}
        >
          {sending ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
        </button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

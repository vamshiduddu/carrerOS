'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { api } from '../../../../../lib/api';
import { X, Send, Sparkles, Minimize2, Maximize2 } from 'lucide-react';

type Turn = { id: string; role: string; content: string };

export default function Page() {
  const params = useParams<{ id: string }>();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [opacity, setOpacity] = useState(85);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get<Turn[]>(`/v1/interviews/${params.id}/turns`)
      .then(data => setTurns(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [params.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [turns]);

  async function send() {
    if (!input.trim()) return;
    const t: Turn = { id: `t-${Date.now()}`, role: 'user', content: input };
    setTurns(prev => [...prev, t]);
    setInput('');
    setLoading(true);
    try {
      await api.post(`/v1/interviews/${params.id}/turns`, { content: t.content });
      const updated = await api.get<Turn[]>(`/v1/interviews/${params.id}/turns`);
      setTurns(Array.isArray(updated) ? updated : []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      width: minimized ? 48 : 380,
      maxHeight: minimized ? 48 : '70vh',
      background: `rgba(20, 32, 24, ${opacity / 100})`,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: minimized ? '50%' : 18,
      zIndex: 9999,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.25s ease, max-height 0.25s ease, border-radius 0.25s ease',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
    }}>
      {minimized ? (
        <button
          onClick={() => setMinimized(false)}
          style={{ width: '100%', height: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#a3c9b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Sparkles size={20} />
        </button>
      ) : (
        <>
          {/* Header */}
          <div style={{ padding: '0.7rem 0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#a3c9b8', fontSize: '0.78rem', fontWeight: 600 }}>
              <Sparkles size={13} color="#4ade80" />
              CareerOS Stealth
            </div>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <input
                type="range"
                min={30}
                max={98}
                value={opacity}
                onChange={e => setOpacity(Number(e.target.value))}
                style={{ width: 50, accentColor: '#4ade80' }}
                title="Opacity"
              />
              <button onClick={() => setMinimized(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a3c9b8', padding: '0.2rem', display: 'flex', alignItems: 'center' }}>
                <Minimize2 size={14} />
              </button>
              <Link href={`/interview/${params.id}`} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a3c9b8', padding: '0.2rem', display: 'flex', alignItems: 'center' }}>
                <X size={14} />
              </Link>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.7rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {turns.length === 0 && (
              <p style={{ color: 'rgba(163,201,184,0.7)', fontSize: '0.78rem', textAlign: 'center', margin: '1rem 0' }}>
                Type a question to get AI coaching
              </p>
            )}
            {turns.map(turn => (
              <div key={turn.id} style={{
                padding: '0.5rem 0.7rem',
                borderRadius: 10,
                fontSize: '0.8rem',
                lineHeight: 1.55,
                background: turn.role === 'user' ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.07)',
                color: turn.role === 'user' ? '#a3c9b8' : '#d1e8dc',
                border: `1px solid ${turn.role === 'user' ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.08)'}`
              }}>
                {turn.content}
              </div>
            ))}
            {loading && (
              <div style={{ color: 'rgba(163,201,184,0.5)', fontSize: '0.75rem', padding: '0.3rem 0' }}>AI is thinking...</div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }}}
              placeholder="Ask anything..."
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                padding: '0.4rem 0.6rem',
                color: '#d1e8dc',
                fontSize: '0.8rem',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              style={{ background: loading ? 'rgba(74,222,128,0.2)' : '#4ade80', border: 'none', borderRadius: 8, padding: '0.4rem 0.6rem', cursor: 'pointer', color: '#142018', display: 'flex', alignItems: 'center', opacity: !input.trim() ? 0.4 : 1 }}
            >
              <Send size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

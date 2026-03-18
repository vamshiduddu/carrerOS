'use client';

import { useState } from 'react';
import { api } from '../../lib/api';
import { Send, X, Loader, GripHorizontal } from 'lucide-react';

interface StealthOverlayProps {
  sessionId: string;
  onClose: () => void;
}

export default function StealthOverlay({ sessionId, onClose }: StealthOverlayProps) {
  const [input, setInput] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const [sending, setSending] = useState(false);
  const [opacity, setOpacity] = useState(90);

  async function send() {
    const content = input.trim();
    if (!content || sending) return;
    setInput('');
    setSending(true);
    try {
      const res = await api.post<any>(`/v1/interviews/sessions/${sessionId}/turns`, {
        role: 'user',
        content,
      });
      setLastResponse(res.reply?.content ?? res.content ?? 'No response');
    } catch {
      setLastResponse('Error: could not get a response.');
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
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        width: 320,
        zIndex: 999,
        opacity: opacity / 100,
        transition: 'opacity 0.15s ease',
      }}
    >
      <div
        className="panel"
        style={{
          padding: '0.9rem',
          background: 'rgba(20,32,24,0.92)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          color: 'white',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <GripHorizontal size={12} style={{ color: 'rgba(255,255,255,0.4)', cursor: 'grab' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              AI Copilot
            </span>
          </div>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', padding: '2px' }}
            onClick={onClose}
          >
            <X size={14} />
          </button>
        </div>

        {/* Last response */}
        {lastResponse && (
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            padding: '0.6rem 0.75rem',
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.5,
            marginBottom: '0.6rem',
            maxHeight: 120,
            overflowY: 'auto',
          }}>
            {lastResponse}
          </div>
        )}

        {!lastResponse && !sending && (
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', textAlign: 'center', padding: '0.5rem 0', marginBottom: '0.6rem' }}>
            Ask anything about the interview...
          </div>
        )}

        {sending && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent)', fontSize: '0.78rem', marginBottom: '0.6rem' }}>
            <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> Thinking...
          </div>
        )}

        {/* Input */}
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI copilot..."
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8,
              padding: '0.45rem 0.65rem',
              fontSize: '0.82rem',
              color: 'white',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || sending}
            style={{
              background: 'var(--accent)',
              border: 'none',
              borderRadius: 8,
              width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              flexShrink: 0,
              opacity: !input.trim() || sending ? 0.5 : 1,
            }}
          >
            <Send size={13} />
          </button>
        </div>

        {/* Opacity slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.6rem' }}>
          <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>Opacity</span>
          <input
            type="range"
            min={20}
            max={100}
            value={opacity}
            onChange={e => setOpacity(Number(e.target.value))}
            style={{ flex: 1, height: 2, accentColor: 'var(--accent)' }}
          />
          <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', minWidth: 28 }}>{opacity}%</span>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

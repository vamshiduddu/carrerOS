'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { api } from '../../../../lib/api';
import { ArrowLeft, Mic, MicOff, Send, Sparkles, Radio, User } from 'lucide-react';

type Session = { id: string; title: string; status: string; interviewType: string };
type Turn = { id: string; role: string; content: string; createdAt?: string };

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function Page() {
  const params = useParams<{ id: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  async function load() {
    const [sessionData, turnsData] = await Promise.all([
      api.get<Session>(`/v1/interviews/${params.id}`).catch(() => null),
      api.get<Turn[]>(`/v1/interviews/${params.id}/turns`).catch(() => [])
    ]);
    if (sessionData) setSession(sessionData);
    setTurns(Array.isArray(turnsData) ? turnsData : []);
  }

  useEffect(() => { load(); }, [params.id]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [turns]);
  useEffect(() => { return () => { recognitionRef.current?.stop(); }; }, []);

  async function start() {
    await api.post(`/v1/interviews/${params.id}/start`, {});
    await load();
  }

  function toggleRecording() {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported. Use Chrome or Edge.'); return; }
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
      }
      if (final.trim()) setInput(prev => prev + (prev ? ' ' : '') + final.trim());
    };
    recognition.onend = () => setRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const content = input.trim();
    const userTurn: Turn = { id: `temp-${Date.now()}`, role: 'user', content };
    setTurns(prev => [...prev, userTurn]);
    setInput('');
    setLoading(true);
    try {
      const result = await api.post<{ turn: Turn; reply: Turn | null }>(`/v1/interviews/${params.id}/turns`, { role: 'user', content });
      if (result.reply) {
        setTurns(prev => [...prev.filter(t => t.id !== userTurn.id), result.turn ?? userTurn, result.reply!]);
      } else {
        await load();
      }
    } catch { await load(); }
    finally { setLoading(false); }
  }

  if (!session) return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {[1,2].map(n => <div key={n} className="skeleton" style={{ height: 100, borderRadius: 18 }} />)}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/interview" className="btn btn-ghost btn-icon"><ArrowLeft size={18} /></Link>
          <div>
            <h1 style={{ margin: 0, fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.3rem', fontWeight: 600 }}>{session.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.15rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{session.interviewType}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.15rem 0.5rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600, background: session.status === 'active' ? 'var(--success-muted)' : 'rgba(79,95,81,0.08)', color: session.status === 'active' ? 'var(--success)' : 'var(--muted)' }}>
                <Radio size={10} /> {session.status}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {session.status !== 'active' && (
            <button className="btn btn-primary btn-sm" onClick={start}><Mic size={14} /> Start</button>
          )}
          <Link href={`/interview/${params.id}/stealth`} className="btn btn-secondary btn-sm">Stealth Mode</Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1rem', flex: 1, minHeight: 0 }}>
        {/* Chat */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {turns.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '0.875rem', textAlign: 'center' }}>
                <div>
                  <Sparkles size={24} color="var(--accent)" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ margin: 0 }}>Start the session to begin your AI-assisted interview prep.</p>
                </div>
              </div>
            ) : (
              turns.map(turn => (
                <div key={turn.id} style={{ display: 'flex', gap: '0.6rem', flexDirection: turn.role === 'user' ? 'row-reverse' : 'row' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: turn.role === 'user' ? 'var(--accent-muted)' : 'rgba(147,51,234,0.1)',
                    color: turn.role === 'user' ? 'var(--accent)' : '#9333ea',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {turn.role === 'user' ? <User size={13} /> : <Sparkles size={13} />}
                  </div>
                  <div className="chat-bubble" style={{ background: turn.role === 'user' ? 'var(--accent-muted)' : 'var(--panel-solid)' }}>
                    {turn.content}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(147,51,234,0.1)', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles size={13} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.7rem 0.9rem', background: 'var(--panel-solid)', border: '1px solid var(--line-solid)', borderRadius: 14 }}>
                  <span className="skeleton" style={{ width: 6, height: 6, borderRadius: '50%', display: 'inline-block' }} />
                  <span className="skeleton" style={{ width: 6, height: 6, borderRadius: '50%', display: 'inline-block', animationDelay: '0.15s' }} />
                  <span className="skeleton" style={{ width: 6, height: 6, borderRadius: '50%', display: 'inline-block', animationDelay: '0.3s' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '0.9rem', borderTop: '1px solid var(--line-solid)', display: 'flex', gap: '0.5rem' }}>
            <button
              className={`btn btn-icon ${recording ? 'btn-danger' : 'btn-secondary'}`}
              onClick={toggleRecording}
              title={recording ? 'Stop recording' : 'Start voice input'}
            >
              {recording ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <textarea
              className="textarea"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
              placeholder="Type your response or question..."
              rows={2}
              style={{ flex: 1, resize: 'none', minHeight: 0 }}
            />
            <button
              className="btn btn-primary btn-icon"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        {/* Tips Panel */}
        <div style={{ display: 'grid', gap: '0.8rem', alignContent: 'start', overflowY: 'auto' }}>
          <div className="panel" style={{ padding: '1.1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
              <Sparkles size={15} color="var(--accent)" />
              <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700 }}>STAR Method</h3>
            </div>
            {[
              { letter: 'S', label: 'Situation', desc: 'Set the context' },
              { letter: 'T', label: 'Task', desc: 'Describe your role' },
              { letter: 'A', label: 'Action', desc: 'What you did' },
              { letter: 'R', label: 'Result', desc: 'Outcome & impact' }
            ].map(item => (
              <div key={item.letter} style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <div style={{ width: 22, height: 22, borderRadius: '6px', background: 'var(--accent-muted)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, flexShrink: 0 }}>
                  {item.letter}
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="panel" style={{ padding: '1.1rem' }}>
            <h3 style={{ margin: '0 0 0.6rem', fontSize: '0.875rem', fontWeight: 700 }}>Quick Tips</h3>
            {['Keep answers to 2 minutes', 'Use specific numbers & data', 'End with the positive result', 'Show what you learned'].map(tip => (
              <p key={tip} style={{ margin: '0 0 0.4rem', fontSize: '0.78rem', color: 'var(--muted)', display: 'flex', alignItems: 'flex-start', gap: '0.4rem', lineHeight: 1.5 }}>
                <span style={{ color: 'var(--accent)', flexShrink: 0 }}>•</span> {tip}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

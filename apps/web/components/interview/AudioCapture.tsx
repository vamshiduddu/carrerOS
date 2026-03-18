'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface AudioCaptureProps {
  onTranscript: (text: string) => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function AudioCapture({ onTranscript }: AudioCaptureProps) {
  const [recording, setRecording] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    return () => { recognitionRef.current?.stop(); };
  }, []);

  function startRecording() {
    setError('');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interimText = '';
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }
      setInterim(interimText);
      if (finalText.trim()) {
        onTranscript(finalText.trim());
        setInterim('');
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone permissions.');
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
      setRecording(false);
    };

    recognition.onend = () => {
      setRecording(false);
      setInterim('');
    };

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }

  function stopRecording() {
    recognitionRef.current?.stop();
    setRecording(false);
    setInterim('');
  }

  return (
    <div className="panel" style={{ padding: '1.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: (error || interim) ? '0.75rem' : 0 }}>
        <button
          className={`btn ${recording ? 'btn-danger' : 'btn-secondary'}`}
          onClick={recording ? stopRecording : startRecording}
          style={{ gap: '0.4rem', minWidth: 140 }}
        >
          {recording ? (
            <>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', background: 'white',
                animation: 'pulse 1s ease-in-out infinite',
              }} />
              Stop Recording
            </>
          ) : (
            <>
              <Mic size={14} /> Start Recording
            </>
          )}
        </button>

        {recording && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger)', fontSize: '0.82rem', fontWeight: 600 }}>
            <MicOff size={14} /> Listening...
          </span>
        )}
      </div>

      {interim && (
        <div style={{ padding: '0.6rem 0.8rem', background: 'var(--surface-2)', borderRadius: 6, fontSize: '0.85rem', color: 'var(--muted)', fontStyle: 'italic' }}>
          {interim}
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ marginTop: '0.75rem' }}>
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <p style={{ margin: '0.75rem 0 0', fontSize: '0.78rem', color: 'var(--muted)' }}>
        Speak your answer — it will be sent automatically when you pause.
      </p>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

import { Clock } from 'lucide-react';

interface Turn {
  role: string;
  content: string;
  createdAt: string;
}

interface TranscriptPanelProps {
  turns: Turn[];
}

export default function TranscriptPanel({ turns }: TranscriptPanelProps) {
  if (turns.length === 0) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.875rem' }}>
        No transcript yet.
      </div>
    );
  }

  return (
    <div style={{ overflowY: 'auto', maxHeight: 480, display: 'flex', flexDirection: 'column', gap: '0.9rem', padding: '0.25rem' }}>
      {turns.map((turn, i) => {
        const isUser = turn.role === 'user';
        const time = new Date(turn.createdAt).toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit',
        });

        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isUser ? 'Candidate' : 'AI'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.68rem', color: 'var(--muted)' }}>
                <Clock size={9} /> {time}
              </span>
            </div>
            <div
              className={`chat-bubble ${isUser ? 'user' : 'assistant'}`}
              style={{ whiteSpace: 'pre-wrap', maxWidth: '85%' }}
            >
              {turn.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}

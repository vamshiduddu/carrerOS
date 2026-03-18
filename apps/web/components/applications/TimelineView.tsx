import { Briefcase, Mail, Phone, Star, Calendar, MessageSquare, CheckCircle, Clock } from 'lucide-react';

interface TimelineEvent {
  id: string;
  eventType: string;
  title: string;
  createdAt: string;
}

interface TimelineViewProps {
  events: TimelineEvent[];
}

const EVENT_ICONS: Record<string, React.ComponentType<any>> = {
  application:  Briefcase,
  email:        Mail,
  call:         Phone,
  interview:    Star,
  offer:        CheckCircle,
  follow_up:    MessageSquare,
  scheduled:    Calendar,
};

const EVENT_COLORS: Record<string, string> = {
  application:  '#0ea5e9',
  email:        'var(--muted)',
  call:         '#9333ea',
  interview:    'var(--accent-2)',
  offer:        'var(--success)',
  follow_up:    'var(--accent)',
  scheduled:    '#8b4513',
};

export default function TimelineView({ events }: TimelineViewProps) {
  if (events.length === 0) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.875rem' }}>
        No timeline events yet.
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
      {/* Vertical line */}
      <div style={{
        position: 'absolute', left: '11px', top: 8, bottom: 8,
        width: 2, background: 'var(--line-solid)', borderRadius: 2,
      }} />

      <div style={{ display: 'grid', gap: '1rem' }}>
        {events.map((event, i) => {
          const Icon = EVENT_ICONS[event.eventType] ?? Clock;
          const color = EVENT_COLORS[event.eventType] ?? 'var(--muted)';
          const date = new Date(event.createdAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          });

          return (
            <div key={event.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              {/* Dot */}
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: `${color}18`, border: `2px solid ${color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginLeft: '-1.5rem', zIndex: 1,
                position: 'relative',
              }}>
                <Icon size={11} style={{ color }} />
              </div>

              <div style={{ flex: 1, paddingTop: '0.1rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{event.title}</div>
                <div style={{ color: 'var(--muted)', fontSize: '0.75rem', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={10} />
                  {date}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

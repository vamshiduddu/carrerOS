import { Inbox } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: { label: string; href: string };
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Inbox size={24} />
      </div>
      <h3 style={{ margin: '0 0 0.4rem', fontWeight: 700, fontSize: '1rem' }}>{title}</h3>
      <p style={{ margin: '0 0 1rem', color: 'var(--muted)', fontSize: '0.875rem' }}>{description}</p>
      {action && (
        <Link href={action.href} className="btn btn-primary btn-sm">
          {action.label}
        </Link>
      )}
    </div>
  );
}

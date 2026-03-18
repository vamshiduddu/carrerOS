'use client';

import Link from 'next/link';
import { FileText, Edit2, CheckSquare, Trash2, Clock } from 'lucide-react';

interface Resume {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface ResumeCardProps {
  resume: Resume;
  onDelete: (id: string) => void;
}

export default function ResumeCard({ resume, onDelete }: ResumeCardProps) {
  const updated = new Date(resume.updatedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="panel" style={{ padding: '1.1rem 1.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.9rem' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'var(--accent-muted)', color: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <FileText size={18} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {resume.title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--muted)', fontSize: '0.78rem' }}>
            <Clock size={11} />
            Updated {updated}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Link href={`/resume/${resume.id}`} className="btn btn-primary btn-sm" style={{ gap: '0.35rem' }}>
          <Edit2 size={13} /> Edit
        </Link>
        <Link href={`/resume/${resume.id}/ats`} className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
          <CheckSquare size={13} /> ATS Check
        </Link>
        <button
          className="btn btn-sm"
          style={{ background: 'var(--danger-muted)', color: 'var(--danger)', marginLeft: 'auto', gap: '0.35rem' }}
          onClick={() => onDelete(resume.id)}
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  );
}

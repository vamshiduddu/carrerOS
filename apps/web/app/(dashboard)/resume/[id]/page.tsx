'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import {
  ArrowLeft, Save, Sparkles, ExternalLink, FileText,
  Plus, Trash2, GripVertical, ChevronDown, ChevronUp
} from 'lucide-react';

type Section = {
  id: string;
  type: string;
  title: string;
  content: string;
  order: number;
};

type Resume = {
  id: string;
  title: string;
  sections: Section[];
  updatedAt: string;
};

const SECTION_TYPES = [
  { value: 'summary', label: 'Professional Summary' },
  { value: 'experience', label: 'Work Experience' },
  { value: 'education', label: 'Education' },
  { value: 'skills', label: 'Skills' },
  { value: 'projects', label: 'Projects' },
  { value: 'certifications', label: 'Certifications' },
  { value: 'custom', label: 'Custom Section' }
];

export default function Page() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [resume, setResume] = useState<Resume | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');

  useEffect(() => {
    api.get<Resume>(`/v1/resumes/${params.id}`)
      .then((data) => {
        setResume(data);
        setTitleValue(data.title);
        setSections(Array.isArray(data.sections) ? [...data.sections].sort((a, b) => a.order - b.order) : []);
      })
      .catch(() => setError('Failed to load resume'));
  }, [params.id]);

  async function saveSection(section: Section) {
    setSaving(true);
    try {
      await api.patch(`/v1/resumes/${params.id}/sections/${section.id}`, {
        title: section.title,
        content: section.content
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function addSection(type: string) {
    try {
      const newSection = await api.post<Section>(`/v1/resumes/${params.id}/sections`, {
        type,
        title: SECTION_TYPES.find(s => s.value === type)?.label ?? 'New Section',
        content: '',
        order: sections.length
      });
      setSections(prev => [...prev, newSection]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add section');
    }
  }

  async function deleteSection(sectionId: string) {
    if (!confirm('Remove this section?')) return;
    try {
      await api.delete(`/v1/resumes/${params.id}/sections/${sectionId}`);
      setSections(prev => prev.filter(s => s.id !== sectionId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete section');
    }
  }

  async function improveWithAI(section: Section) {
    setAiLoading(section.id);
    try {
      const result = await api.post<{ improved: string }>(`/v1/resumes/${params.id}/ai/improve`, {
        text: section.content,
        instruction: `Improve this ${section.type} section`
      });
      if (result.improved) {
        const updated = sections.map(s => s.id === section.id ? { ...s, content: result.improved } : s);
        setSections(updated);
        await saveSection({ ...section, content: result.improved });
      }
    } catch (e) {
      setError('AI improvement failed. Check your API keys.');
    } finally {
      setAiLoading(null);
    }
  }

  async function saveTitle() {
    if (!titleValue.trim() || !resume) return;
    try {
      await api.patch(`/v1/resumes/${params.id}`, { title: titleValue });
      setResume({ ...resume, title: titleValue });
      setEditingTitle(false);
    } catch {
      setEditingTitle(false);
    }
  }

  function toggleCollapse(sectionId: string) {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }

  function updateSection(id: string, field: 'title' | 'content', value: string) {
    setSections(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  }

  if (error && !resume) {
    return (
      <div className="panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--danger)', margin: '0 0 1rem' }}>{error}</p>
        <button className="btn btn-secondary" onClick={() => router.push('/resume')}>
          <ArrowLeft size={15} /> Back to Resumes
        </button>
      </div>
    );
  }

  if (!resume) {
    return (
      <div style={{ display: 'grid', gap: '1rem' }}>
        {[1,2,3].map(n => <div key={n} className="skeleton" style={{ height: 120, borderRadius: 18 }} />)}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
          <Link href="/resume" className="btn btn-ghost btn-icon">
            <ArrowLeft size={18} />
          </Link>
          {editingTitle ? (
            <input
              className="input"
              value={titleValue}
              onChange={e => setTitleValue(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
              autoFocus
              style={{ maxWidth: 360, fontSize: '1.1rem', fontWeight: 700 }}
            />
          ) : (
            <h1 className="page-title" onClick={() => setEditingTitle(true)} style={{ cursor: 'pointer', maxWidth: 400 }} title="Click to rename">
              {resume.title}
            </h1>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link href={`/resume/${params.id}/ats`} className="btn btn-secondary btn-sm">ATS Score</Link>
          <Link href={`/resume/${params.id}/cover-letter`} className="btn btn-secondary btn-sm">Cover Letter</Link>
          <button
            className="btn btn-secondary btn-sm"
            onClick={async () => {
              setSaving(true);
              try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('careeros_access_token') : null;
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/v1/resumes/${params.id}/pdf`, {
                  method: 'GET',
                  headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('PDF export failed');
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${resume?.title ?? 'resume'}.pdf`;
                a.click();
                URL.revokeObjectURL(url);
              } catch { setError('PDF export failed'); }
              finally { setSaving(false); }
            }}
          >
            <ExternalLink size={13} /> Export PDF
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
      {saving && <div style={{ padding: '0.4rem 0', color: 'var(--muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Save size={13} /> Saving...</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.2rem', alignItems: 'start' }}>
        {/* Sections */}
        <div style={{ display: 'grid', gap: '0.8rem' }}>
          {sections.length === 0 && (
            <div className="panel" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--accent-muted)', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.8rem' }}>
                <FileText size={22} />
              </div>
              <p style={{ margin: '0 0 0.5rem', fontWeight: 600 }}>Start building your resume</p>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.875rem' }}>Add sections from the panel on the right.</p>
            </div>
          )}

          {sections.map((section) => {
            const collapsed = collapsedSections.has(section.id);
            return (
              <div key={section.id} className="panel" style={{ padding: '1.1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: collapsed ? 0 : '0.8rem' }}>
                  <GripVertical size={14} color="var(--muted)" style={{ flexShrink: 0, cursor: 'grab' }} />
                  <input
                    className="input"
                    value={section.title}
                    onChange={e => updateSection(section.id, 'title', e.target.value)}
                    onBlur={() => saveSection(section)}
                    style={{ flex: 1, border: 'none', background: 'transparent', padding: '0.2rem 0.4rem', fontWeight: 700, fontSize: '0.9rem' }}
                  />
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => improveWithAI(section)}
                    disabled={aiLoading === section.id}
                    title="Improve with AI"
                  >
                    {aiLoading === section.id ? '...' : <Sparkles size={14} />}
                  </button>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => toggleCollapse(section.id)}>
                    {collapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
                  </button>
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => deleteSection(section.id)}
                    style={{ color: 'var(--danger)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {!collapsed && (
                  <textarea
                    className="textarea"
                    value={section.content}
                    onChange={e => updateSection(section.id, 'content', e.target.value)}
                    onBlur={() => saveSection(section)}
                    placeholder={`Write your ${section.title.toLowerCase()} here...`}
                    rows={6}
                    style={{ minHeight: 120 }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Add Section Panel */}
        <div style={{ position: 'sticky', top: 80, display: 'grid', gap: '0.8rem' }}>
          <div className="panel" style={{ padding: '1.1rem' }}>
            <h3 style={{ margin: '0 0 0.8rem', fontSize: '0.875rem', fontWeight: 700 }}>Add Section</h3>
            <div style={{ display: 'grid', gap: '0.4rem' }}>
              {SECTION_TYPES.map((st) => (
                <button
                  key={st.value}
                  className="btn btn-secondary btn-sm"
                  onClick={() => addSection(st.value)}
                  style={{ justifyContent: 'flex-start', gap: '0.5rem', textAlign: 'left' }}
                >
                  <Plus size={13} /> {st.label}
                </button>
              ))}
            </div>
          </div>

          <div className="panel" style={{ padding: '1.1rem', background: 'linear-gradient(135deg, rgba(18,120,90,0.05), rgba(244,166,60,0.05))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Sparkles size={15} color="var(--accent)" />
              <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700 }}>AI Tools</h3>
            </div>
            <p style={{ margin: '0 0 0.8rem', color: 'var(--muted)', fontSize: '0.8rem', lineHeight: 1.5 }}>
              Click the sparkle icon on any section to improve it with AI.
            </p>
            <Link href={`/resume/${params.id}/ats`} className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
              <ExternalLink size={13} /> Check ATS Score
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

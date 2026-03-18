'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Plus, Save, Loader } from 'lucide-react';
import ExperienceSection from './sections/ExperienceSection';
import EducationSection from './sections/EducationSection';
import SkillsSection from './sections/SkillsSection';
import SummarySection from './sections/SummarySection';
import CustomSection from './sections/CustomSection';

interface ResumeEditorProps {
  resumeId: string;
}

const SECTION_TYPES = [
  { type: 'summary', label: 'Summary' },
  { type: 'experience', label: 'Experience' },
  { type: 'education', label: 'Education' },
  { type: 'skills', label: 'Skills' },
  { type: 'custom', label: 'Custom Section' },
];

export default function ResumeEditor({ resumeId }: ResumeEditorProps) {
  const [resume, setResume] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [resumeData, sectionsData] = await Promise.all([
          api.get<any>(`/v1/resumes/${resumeId}`),
          api.get<any[]>(`/v1/resumes/${resumeId}/sections`).catch(() => []),
        ]);
        setResume(resumeData);
        setSections(Array.isArray(sectionsData) ? sectionsData : []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load resume');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [resumeId]);

  async function saveSection(sectionId: string, data: any) {
    setSaving(true);
    try {
      await api.patch(`/v1/resumes/${resumeId}/sections/${sectionId}`, { content: data });
    } catch (e) {
      console.error('Failed to save section', e);
    } finally {
      setSaving(false);
    }
  }

  function updateSection(index: number, content: any) {
    const updated = sections.map((s, i) => i === index ? { ...s, content } : s);
    setSections(updated);
    if (sections[index]?.id) {
      saveSection(sections[index].id, content);
    }
  }

  async function addSection(type: string) {
    setShowAddMenu(false);
    const defaultContent: Record<string, any> = {
      summary: '',
      experience: [],
      education: [],
      skills: [],
      custom: [],
    };
    try {
      const newSection = await api.post<any>(`/v1/resumes/${resumeId}/sections`, {
        type,
        title: SECTION_TYPES.find(t => t.type === type)?.label ?? type,
        content: defaultContent[type] ?? [],
      });
      setSections(prev => [...prev, newSection]);
    } catch {
      // Optimistically add
      setSections(prev => [...prev, {
        id: `temp-${Date.now()}`,
        type,
        title: SECTION_TYPES.find(t => t.type === type)?.label ?? type,
        content: defaultContent[type] ?? [],
      }]);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.75rem', color: 'var(--muted)' }}>
        <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
        Loading resume...
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div style={{ display: 'grid', gap: '1.2rem' }}>
      {/* Resume title bar */}
      {resume && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.3rem', fontWeight: 600 }}>
            {resume.title}
          </h2>
          {saving && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--muted)', fontSize: '0.82rem' }}>
              <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving...
            </span>
          )}
        </div>
      )}

      {/* Sections */}
      {sections.map((section, i) => (
        <div key={section.id ?? i} className="panel" style={{ padding: '1.2rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>
            {section.title || section.type}
          </h3>

          {section.type === 'summary' && (
            <SummarySection
              value={section.content ?? ''}
              onChange={v => updateSection(i, v)}
            />
          )}

          {section.type === 'experience' && (
            <ExperienceSection
              items={section.content ?? []}
              onChange={items => updateSection(i, items)}
            />
          )}

          {section.type === 'education' && (
            <EducationSection
              items={section.content ?? []}
              onChange={items => updateSection(i, items)}
            />
          )}

          {section.type === 'skills' && (
            <SkillsSection
              items={section.content ?? []}
              onChange={items => updateSection(i, items)}
            />
          )}

          {section.type === 'custom' && (
            <CustomSection
              title={section.title ?? 'Item'}
              items={section.content ?? []}
              onChange={items => updateSection(i, items)}
            />
          )}
        </div>
      ))}

      {/* Add Section */}
      <div style={{ position: 'relative', justifySelf: 'start' }}>
        <button
          className="btn btn-secondary"
          style={{ gap: '0.4rem' }}
          onClick={() => setShowAddMenu(m => !m)}
        >
          <Plus size={15} /> Add Section
        </button>

        {showAddMenu && (
          <div className="panel" style={{
            position: 'absolute', top: '100%', left: 0, marginTop: '0.4rem',
            padding: '0.5rem', zIndex: 20, minWidth: 180,
          }}>
            {SECTION_TYPES.map(st => (
              <button
                key={st.type}
                className="btn btn-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 8 }}
                onClick={() => addSection(st.type)}
              >
                {st.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

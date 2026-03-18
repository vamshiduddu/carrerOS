'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { api } from '../../../../../lib/api';
import { ArrowLeft, Sparkles, Copy, CheckCircle, FileText } from 'lucide-react';

export default function Page() {
  const params = useParams<{ id: string }>();
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!jobDescription.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await api.post<{ coverLetter: string }>(`/v1/resumes/${params.id}/cover-letter`, {
        jobDescription: jobDescription.trim(),
        companyName: companyName.trim(),
        role: role.trim()
      });
      setCoverLetter(result.coverLetter);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href={`/resume/${params.id}`} className="btn btn-ghost btn-icon">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="page-title">Cover Letter Generator</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', alignItems: 'start' }}>
        <div className="panel" style={{ padding: '1.3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Sparkles size={18} color="var(--accent)" />
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Job Details</h2>
          </div>
          <div style={{ display: 'grid', gap: '0.8rem' }}>
            <div className="field-group">
              <label className="field-label">Company name</label>
              <input className="input" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Google" />
            </div>
            <div className="field-group">
              <label className="field-label">Role title</label>
              <input className="input" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Senior Software Engineer" />
            </div>
            <div className="field-group">
              <label className="field-label">Job description</label>
              <textarea className="textarea" value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Paste the full job description..." rows={10} />
            </div>
          </div>
          {error && <div className="alert alert-error" style={{ marginTop: '0.75rem' }}>{error}</div>}
          <button className="btn btn-primary" onClick={generate} disabled={loading || !jobDescription.trim()} style={{ marginTop: '0.9rem', width: '100%', justifyContent: 'center' }}>
            {loading ? 'Generating...' : <><Sparkles size={15} /> Generate Cover Letter</>}
          </button>
        </div>

        <div style={{ display: 'grid', gap: '0.8rem', alignContent: 'start' }}>
          {coverLetter ? (
            <div className="panel" style={{ padding: '1.3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={16} color="var(--accent)" />
                  <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Generated Letter</h2>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={copyToClipboard}>
                  {copied ? <><CheckCircle size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
                </button>
              </div>
              <textarea className="textarea" value={coverLetter} onChange={e => setCoverLetter(e.target.value)} rows={20} style={{ fontFamily: 'Georgia, serif', fontSize: '0.875rem', lineHeight: 1.8 }} />
            </div>
          ) : (
            <div className="panel" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--accent-muted)', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.8rem' }}>
                <FileText size={24} />
              </div>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>Fill in the job details and generate your personalized cover letter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

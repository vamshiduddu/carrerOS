interface ResumePreviewProps {
  resume: any;
  sections: any[];
}

export default function ResumePreview({ resume, sections }: ResumePreviewProps) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--line-solid)',
      borderRadius: 'var(--radius-md)',
      padding: '2.5rem',
      fontFamily: 'Georgia, serif',
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#111',
      maxWidth: 680,
      margin: '0 auto',
      boxShadow: 'var(--shadow-md)',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: '2px solid #111', paddingBottom: '1rem', marginBottom: '1.2rem' }}>
        <h1 style={{ margin: '0 0 0.3rem', fontFamily: 'inherit', fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
          {resume?.name || resume?.title || 'Your Name'}
        </h1>
        {resume?.contact && (
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#444' }}>{resume.contact}</p>
        )}
        {resume?.email && (
          <p style={{ margin: '0.1rem 0 0', fontSize: '0.8rem', color: '#444' }}>{resume.email}</p>
        )}
      </div>

      {/* Sections */}
      {sections.map((section: any, i: number) => (
        <div key={section.id ?? i} style={{ marginBottom: '1.2rem' }}>
          <h2 style={{
            margin: '0 0 0.5rem',
            fontFamily: 'inherit',
            fontSize: '0.95rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            borderBottom: '1px solid #ccc',
            paddingBottom: '0.25rem',
          }}>
            {section.title || section.type}
          </h2>

          {section.type === 'summary' && (
            <p style={{ margin: 0 }}>{section.content || section.value || ''}</p>
          )}

          {section.type === 'experience' && Array.isArray(section.items) && section.items.map((item: any, j: number) => (
            <div key={j} style={{ marginBottom: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong>{item.title}</strong>
                <span style={{ fontSize: '0.78rem', color: '#555' }}>{item.dates}</span>
              </div>
              <div style={{ color: '#555', fontSize: '0.82rem', marginBottom: '0.3rem' }}>{item.company}</div>
              {Array.isArray(item.bullets) && (
                <ul style={{ margin: '0.3rem 0 0 1rem', padding: 0 }}>
                  {item.bullets.map((b: string, k: number) => (
                    <li key={k} style={{ marginBottom: '0.15rem' }}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {section.type === 'education' && Array.isArray(section.items) && section.items.map((item: any, j: number) => (
            <div key={j} style={{ marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{item.school}</strong>
                <span style={{ fontSize: '0.78rem', color: '#555' }}>{item.year}</span>
              </div>
              <div style={{ color: '#555', fontSize: '0.82rem' }}>{item.degree}</div>
            </div>
          ))}

          {section.type === 'skills' && Array.isArray(section.items) && (
            <p style={{ margin: 0 }}>{section.items.join(' · ')}</p>
          )}

          {section.type === 'custom' && Array.isArray(section.items) && section.items.map((item: any, j: number) => (
            <div key={j} style={{ marginBottom: '0.4rem' }}>
              {typeof item === 'string' ? <span>{item}</span> : (
                <div>
                  {item.title && <strong>{item.title}</strong>}
                  {item.description && <p style={{ margin: '0.15rem 0 0', color: '#444' }}>{item.description}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {sections.length === 0 && (
        <p style={{ color: '#888', textAlign: 'center', fontStyle: 'italic' }}>
          No sections yet. Start editing your resume to see a preview.
        </p>
      )}
    </div>
  );
}

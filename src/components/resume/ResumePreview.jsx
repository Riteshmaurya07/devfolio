import { forwardRef } from 'react'
import { Mail, Phone, MapPin, Globe, Github, Linkedin } from 'lucide-react'

const ResumePreview = forwardRef(function ResumePreview({ data }, ref) {
  const skills = data.skills
    ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  return (
    <div
      ref={ref}
      className="bg-white text-gray-900 print:text-black"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '20mm 18mm',
        fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
        fontSize: '10pt',
        lineHeight: '1.5',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '16px', borderBottom: '2px solid #7C3AED', paddingBottom: '12px' }}>
        <h1 style={{ fontSize: '22pt', fontWeight: 700, color: '#111', margin: '0 0 4px' }}>
          {data.name || 'Your Name'}
        </h1>
        <p style={{ fontSize: '11pt', color: '#7C3AED', fontWeight: 500, margin: '0 0 8px' }}>
          {data.title || 'Software Engineer'}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '8.5pt', color: '#555' }}>
          {data.email && <span>✉ {data.email}</span>}
          {data.phone && <span>📞 {data.phone}</span>}
          {data.location && <span>📍 {data.location}</span>}
          {data.github && <span>⌥ {data.github}</span>}
          {data.linkedin && <span>in {data.linkedin}</span>}
          {data.portfolio && <span>🌐 {data.portfolio}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <Section title="Summary">
          <p style={{ color: '#374151', margin: 0 }}>{data.summary}</p>
        </Section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <Section title="Skills">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {skills.map((skill, i) => (
              <span
                key={i}
                style={{
                  background: '#F3F0FF',
                  color: '#6D28D9',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '8.5pt',
                  fontWeight: 500,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Experience */}
      {data.experience?.length > 0 && (
        <Section title="Experience">
          {data.experience.map((exp, i) => (
            <div key={exp.id || i} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <strong style={{ fontSize: '10.5pt' }}>{exp.role || 'Role'}</strong>
                  <span style={{ color: '#6D28D9', fontWeight: 500 }}> · {exp.company || 'Company'}</span>
                </div>
                <span style={{ color: '#9CA3AF', fontSize: '8.5pt' }}>
                  {exp.start} {exp.end ? `— ${exp.end}` : '— Present'}
                </span>
              </div>
              {exp.highlights && (
                <div style={{ marginTop: '4px' }}>
                  {exp.highlights.split('\n').filter(Boolean).map((line, j) => (
                    <p key={j} style={{ margin: '2px 0', color: '#374151', fontSize: '9pt' }}>
                      {line.startsWith('•') ? line : `• ${line}`}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Projects */}
      {data.projects?.length > 0 && (
        <Section title="Projects">
          {data.projects.map((proj, i) => (
            <div key={proj.id || i} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '10pt' }}>{proj.name || 'Project Name'}</strong>
                {proj.tech && <span style={{ color: '#9CA3AF', fontSize: '8.5pt' }}>{proj.tech}</span>}
              </div>
              {proj.description && (
                <p style={{ margin: '3px 0 0', color: '#374151', fontSize: '9pt' }}>{proj.description}</p>
              )}
              {proj.link && (
                <a href={proj.link} style={{ color: '#7C3AED', fontSize: '8.5pt' }}>{proj.link}</a>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Education */}
      {data.education?.length > 0 && (
        <Section title="Education">
          {data.education.map((edu, i) => (
            <div key={edu.id || i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div>
                <strong>{edu.degree || 'Degree'}</strong>
                <span style={{ color: '#555' }}> · {edu.institution || 'Institution'}</span>
                {edu.gpa && <span style={{ color: '#9CA3AF' }}> · GPA: {edu.gpa}</span>}
              </div>
              <span style={{ color: '#9CA3AF', fontSize: '8.5pt' }}>{edu.year}</span>
            </div>
          ))}
        </Section>
      )}
    </div>
  )
})

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <h2 style={{
        fontSize: '10pt',
        fontWeight: 700,
        color: '#111',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: '8px',
        borderBottom: '1px solid #E5E7EB',
        paddingBottom: '3px',
      }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

export default ResumePreview

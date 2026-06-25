import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import Button from '@/components/ui/Button'

function SectionBlock({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-surface hover:bg-white/5 transition-colors"
      >
        <span className="text-sm font-semibold text-text-primary">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
      </button>
      {open && <div className="px-4 py-4 space-y-4 bg-card">{children}</div>}
    </div>
  )
}

function Field({ label, id, value, onChange, placeholder, type = 'text', multiline = false }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="input resize-none"
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="input"
        />
      )}
    </div>
  )
}

export default function ResumeForm({ data, onChange, githubRepos = [] }) {
  const update = (section, val) => onChange({ ...data, [section]: val })
  const updateField = (field, val) => onChange({ ...data, [field]: val })

  const addItem = (section, template) => {
    update(section, [...(data[section] || []), { id: Date.now(), ...template }])
  }

  const removeItem = (section, id) => {
    update(section, data[section].filter((i) => i.id !== id))
  }

  const updateItem = (section, id, field, val) => {
    update(section, data[section].map((i) => (i.id === id ? { ...i, [field]: val } : i)))
  }

  const importFromGitHub = () => {
    const projects = githubRepos.slice(0, 4).map((repo) => ({
      id: Date.now() + Math.random(),
      name: repo.name,
      description: repo.description || '',
      tech: repo.language || '',
      link: repo.html_url,
      highlights: `Stars: ${repo.stargazers_count} | Forks: ${repo.forks_count}`,
    }))
    update('projects', [...(data.projects || []), ...projects])
  }

  return (
    <div className="space-y-3 overflow-y-auto no-scrollbar">
      {/* Personal Info */}
      <SectionBlock title="Personal Info">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full Name" id="name" value={data.name || ''} onChange={(v) => updateField('name', v)} placeholder="Alex Developer" />
          <Field label="Title" id="title" value={data.title || ''} onChange={(v) => updateField('title', v)} placeholder="Full Stack Engineer" />
          <Field label="Email" id="email" value={data.email || ''} onChange={(v) => updateField('email', v)} placeholder="alex@example.com" type="email" />
          <Field label="Phone" id="phone" value={data.phone || ''} onChange={(v) => updateField('phone', v)} placeholder="+1 (555) 000-0000" />
          <Field label="Location" id="location" value={data.location || ''} onChange={(v) => updateField('location', v)} placeholder="San Francisco, CA" />
          <Field label="GitHub" id="github" value={data.github || ''} onChange={(v) => updateField('github', v)} placeholder="github.com/alexdev" />
          <Field label="LinkedIn" id="linkedin" value={data.linkedin || ''} onChange={(v) => updateField('linkedin', v)} placeholder="linkedin.com/in/alexdev" />
          <Field label="Portfolio" id="portfolio" value={data.portfolio || ''} onChange={(v) => updateField('portfolio', v)} placeholder="alexdev.io" />
        </div>
        <Field label="Summary" id="summary" value={data.summary || ''} onChange={(v) => updateField('summary', v)} placeholder="2-3 sentence professional summary..." multiline />
      </SectionBlock>

      {/* Skills */}
      <SectionBlock title="Skills">
        <Field
          label="Skills (comma separated)"
          id="skills"
          value={data.skills || ''}
          onChange={(v) => updateField('skills', v)}
          placeholder="React, TypeScript, Node.js, PostgreSQL, Docker..."
          multiline
        />
      </SectionBlock>

      {/* Experience */}
      <SectionBlock title="Experience">
        {(data.experience || []).map((exp) => (
          <div key={exp.id} className="relative border border-border rounded-lg p-3 space-y-2 bg-surface">
            <button onClick={() => removeItem('experience', exp.id)} className="absolute top-2 right-2 text-text-muted hover:text-danger transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Company" id={`exp-co-${exp.id}`} value={exp.company || ''} onChange={(v) => updateItem('experience', exp.id, 'company', v)} placeholder="Google" />
              <Field label="Role" id={`exp-role-${exp.id}`} value={exp.role || ''} onChange={(v) => updateItem('experience', exp.id, 'role', v)} placeholder="Software Engineer" />
              <Field label="Start" id={`exp-start-${exp.id}`} value={exp.start || ''} onChange={(v) => updateItem('experience', exp.id, 'start', v)} placeholder="Jan 2022" />
              <Field label="End" id={`exp-end-${exp.id}`} value={exp.end || ''} onChange={(v) => updateItem('experience', exp.id, 'end', v)} placeholder="Present" />
            </div>
            <Field label="Highlights (one per line)" id={`exp-hi-${exp.id}`} value={exp.highlights || ''} onChange={(v) => updateItem('experience', exp.id, 'highlights', v)} placeholder="• Built X that improved Y by Z%" multiline />
          </div>
        ))}
        <Button variant="outline" size="sm" icon={Plus} onClick={() => addItem('experience', { company: '', role: '', start: '', end: '', highlights: '' })}>
          Add Experience
        </Button>
      </SectionBlock>

      {/* Projects */}
      <SectionBlock title="Projects">
        {(data.projects || []).map((proj) => (
          <div key={proj.id} className="relative border border-border rounded-lg p-3 space-y-2 bg-surface">
            <button onClick={() => removeItem('projects', proj.id)} className="absolute top-2 right-2 text-text-muted hover:text-danger transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Project Name" id={`proj-name-${proj.id}`} value={proj.name || ''} onChange={(v) => updateItem('projects', proj.id, 'name', v)} placeholder="DevFolio OS" />
              <Field label="Tech Stack" id={`proj-tech-${proj.id}`} value={proj.tech || ''} onChange={(v) => updateItem('projects', proj.id, 'tech', v)} placeholder="React, Node.js" />
              <Field label="Link" id={`proj-link-${proj.id}`} value={proj.link || ''} onChange={(v) => updateItem('projects', proj.id, 'link', v)} placeholder="github.com/..." />
            </div>
            <Field label="Description" id={`proj-desc-${proj.id}`} value={proj.description || ''} onChange={(v) => updateItem('projects', proj.id, 'description', v)} placeholder="Brief project description..." multiline />
          </div>
        ))}
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" icon={Plus} onClick={() => addItem('projects', { name: '', tech: '', link: '', description: '' })}>
            Add Project
          </Button>
          {githubRepos.length > 0 && (
            <Button variant="ghost" size="sm" onClick={importFromGitHub}>
              📦 Import from GitHub
            </Button>
          )}
        </div>
      </SectionBlock>

      {/* Education */}
      <SectionBlock title="Education">
        {(data.education || []).map((edu) => (
          <div key={edu.id} className="relative border border-border rounded-lg p-3 space-y-2 bg-surface">
            <button onClick={() => removeItem('education', edu.id)} className="absolute top-2 right-2 text-text-muted hover:text-danger transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Institution" id={`edu-inst-${edu.id}`} value={edu.institution || ''} onChange={(v) => updateItem('education', edu.id, 'institution', v)} placeholder="MIT" />
              <Field label="Degree" id={`edu-deg-${edu.id}`} value={edu.degree || ''} onChange={(v) => updateItem('education', edu.id, 'degree', v)} placeholder="B.S. Computer Science" />
              <Field label="Year" id={`edu-year-${edu.id}`} value={edu.year || ''} onChange={(v) => updateItem('education', edu.id, 'year', v)} placeholder="2018 - 2022" />
              <Field label="GPA" id={`edu-gpa-${edu.id}`} value={edu.gpa || ''} onChange={(v) => updateItem('education', edu.id, 'gpa', v)} placeholder="3.8/4.0" />
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" icon={Plus} onClick={() => addItem('education', { institution: '', degree: '', year: '', gpa: '' })}>
          Add Education
        </Button>
      </SectionBlock>
    </div>
  )
}

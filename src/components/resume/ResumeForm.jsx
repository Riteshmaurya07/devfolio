import { Plus, Trash2, Sparkles } from 'lucide-react'
import Button from '@/components/ui/Button'
import ResumeSectionCard from './ResumeSectionCard'

function Field({ label, id, value, onChange, placeholder, type = 'text', multiline = false }) {
  return (
    <div className="space-y-1.5 text-left">
      <label htmlFor={id} className="text-2xs font-semibold text-text-secondary uppercase tracking-wider block">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="input w-full min-h-[80px] text-xs resize-none"
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="input w-full text-xs h-9"
        />
      )}
    </div>
  )
}

export default function ResumeForm({ data, onChange, githubRepos = [] }) {
  const update = (section, val) => onChange({ ...data, [section]: val })
  const updateField = (field, val) => onChange({ ...data, [field]: val })

  const addItem = (section, template) => {
    update(section, [...(data[section] || []), { id: Date.now() + Math.random(), ...template }])
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
    }))
    update('projects', [...(data.projects || []), ...projects])
  }

  return (
    <div className="space-y-4">
      {/* Personal Info */}
      <ResumeSectionCard title="Personal Information" defaultOpen={true}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
      </ResumeSectionCard>

      {/* Skills */}
      <ResumeSectionCard title="Skills">
        <Field
          label="Skills (comma separated)"
          id="skills"
          value={data.skills || ''}
          onChange={(v) => updateField('skills', v)}
          placeholder="React, TypeScript, Node.js, PostgreSQL, Docker..."
          multiline
        />
      </ResumeSectionCard>

      {/* Experience */}
      <ResumeSectionCard title="Work Experience">
        <div className="space-y-4">
          {(data.experience || []).map((exp) => (
            <div key={exp.id} className="relative border border-border/40 hover:border-violet-light/25 bg-background/30 hover:bg-background/60 rounded-xl p-4.5 space-y-3.5 transition-all">
              <button
                onClick={() => removeItem('experience', exp.id)}
                className="absolute top-3.5 right-3.5 text-text-muted hover:text-danger transition-colors p-1.5 rounded-lg hover:bg-surface/50"
                type="button"
                title="Remove Entry"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Company" id={`exp-co-${exp.id}`} value={exp.company || ''} onChange={(v) => updateItem('experience', exp.id, 'company', v)} placeholder="Google" />
                <Field label="Role" id={`exp-role-${exp.id}`} value={exp.role || ''} onChange={(v) => updateItem('experience', exp.id, 'role', v)} placeholder="Software Engineer" />
                <Field label="Start Date" id={`exp-start-${exp.id}`} value={exp.start || ''} onChange={(v) => updateItem('experience', exp.id, 'start', v)} placeholder="Jan 2022" />
                <Field label="End Date" id={`exp-end-${exp.id}`} value={exp.end || ''} onChange={(v) => updateItem('experience', exp.id, 'end', v)} placeholder="Present" />
              </div>
              <Field label="Highlights (one per line)" id={`exp-hi-${exp.id}`} value={exp.highlights || ''} onChange={(v) => updateItem('experience', exp.id, 'highlights', v)} placeholder="• Built X that improved Y by Z%" multiline />
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={() => addItem('experience', { company: '', role: '', start: '', end: '', highlights: '' })}
            className="w-full justify-center text-xs"
          >
            Add Experience
          </Button>
        </div>
      </ResumeSectionCard>

      {/* Projects */}
      <ResumeSectionCard title="Projects">
        <div className="space-y-4">
          {(data.projects || []).map((proj) => (
            <div key={proj.id} className="relative border border-border/40 hover:border-violet-light/25 bg-background/30 hover:bg-background/60 rounded-xl p-4.5 space-y-3.5 transition-all">
              <button
                onClick={() => removeItem('projects', proj.id)}
                className="absolute top-3.5 right-3.5 text-text-muted hover:text-danger transition-colors p-1.5 rounded-lg hover:bg-surface/50"
                type="button"
                title="Remove Entry"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Project Name" id={`proj-name-${proj.id}`} value={proj.name || ''} onChange={(v) => updateItem('projects', proj.id, 'name', v)} placeholder="DevFolio OS" />
                <Field label="Tech Stack" id={`proj-tech-${proj.id}`} value={proj.tech || ''} onChange={(v) => updateItem('projects', proj.id, 'tech', v)} placeholder="React, Node.js" />
                <div className="sm:col-span-2">
                  <Field label="Link" id={`proj-link-${proj.id}`} value={proj.link || ''} onChange={(v) => updateItem('projects', proj.id, 'link', v)} placeholder="github.com/..." />
                </div>
              </div>
              <Field label="Description" id={`proj-desc-${proj.id}`} value={proj.description || ''} onChange={(v) => updateItem('projects', proj.id, 'description', v)} placeholder="Brief project description..." multiline />
            </div>
          ))}
          <div className="flex gap-2 flex-col sm:flex-row">
            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={() => addItem('projects', { name: '', tech: '', link: '', description: '' })}
              className="flex-1 justify-center text-xs"
            >
              Add Project
            </Button>
            {githubRepos.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                icon={Sparkles}
                onClick={importFromGitHub}
                className="flex-1 justify-center text-xs text-text-secondary hover:text-text-primary"
              >
                Import from GitHub
              </Button>
            )}
          </div>
        </div>
      </ResumeSectionCard>

      {/* Education */}
      <ResumeSectionCard title="Education">
        <div className="space-y-4">
          {(data.education || []).map((edu) => (
            <div key={edu.id} className="relative border border-border/40 hover:border-violet-light/25 bg-background/30 hover:bg-background/60 rounded-xl p-4.5 space-y-3.5 transition-all">
              <button
                onClick={() => removeItem('education', edu.id)}
                className="absolute top-3.5 right-3.5 text-text-muted hover:text-danger transition-colors p-1.5 rounded-lg hover:bg-surface/50"
                type="button"
                title="Remove Entry"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Institution" id={`edu-inst-${edu.id}`} value={edu.institution || ''} onChange={(v) => updateItem('education', edu.id, 'institution', v)} placeholder="MIT" />
                <Field label="Degree" id={`edu-deg-${edu.id}`} value={edu.degree || ''} onChange={(v) => updateItem('education', edu.id, 'degree', v)} placeholder="B.S. Computer Science" />
                <Field label="Year" id={`edu-year-${edu.id}`} value={edu.year || ''} onChange={(v) => updateItem('education', edu.id, 'year', v)} placeholder="2018 - 2022" />
                <Field label="GPA" id={`edu-gpa-${edu.id}`} value={edu.gpa || ''} onChange={(v) => updateItem('education', edu.id, 'gpa', v)} placeholder="3.8/4.0" />
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={() => addItem('education', { institution: '', degree: '', year: '', gpa: '' })}
            className="w-full justify-center text-xs"
          >
            Add Education
          </Button>
        </div>
      </ResumeSectionCard>
    </div>
  )
}

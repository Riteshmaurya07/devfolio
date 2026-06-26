import { useState } from 'react'
import { Plus, ExternalLink, Github, Trash2 } from 'lucide-react'
import PageWrapper from '@/components/layout/PageWrapper'
import KanbanBoard from '@/components/kanban/KanbanBoard'
import TaskCard from '@/components/kanban/TaskCard'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import useStreakStore from '@/store/streakStore'
import toast from 'react-hot-toast'

const COLUMNS = ['Idea', 'Building', 'Deployed']

function ProjectCardContent({ project, onDelete }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-1">
        <h4 className="text-sm font-semibold text-text-primary truncate">{project.name}</h4>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(project.id) }}
          className="text-text-muted hover:text-danger transition-colors flex-shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {project.description && (
        <p className="text-xs text-text-secondary line-clamp-2">{project.description}</p>
      )}

      {project.techStack?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {project.techStack.slice(0, 3).map((tech) => (
            <span key={tech} className="text-2xs bg-surface px-1.5 py-0.5 rounded text-text-muted border border-border">
              {tech}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        {project.githubUrl && (
          <a href={project.githubUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-2xs text-text-muted hover:text-text-primary transition-colors">
            <Github className="w-3 h-3" /> GitHub
          </a>
        )}
        {project.demoUrl && (
          <a href={project.demoUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-2xs text-text-muted hover:text-teal-light transition-colors">
            <ExternalLink className="w-3 h-3" /> Demo
          </a>
        )}
      </div>
    </div>
  )
}

export default function Projects() {
  const { projects, addProject, moveProject, deleteProject } = useStreakStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [targetColumn, setTargetColumn] = useState('Idea')
  const [form, setForm] = useState({ name: '', description: '', techStack: '', githubUrl: '', demoUrl: '' })

  const handleAdd = (col) => {
    setTargetColumn(col)
    setModalOpen(true)
  }

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error('Project name required'); return }
    addProject(targetColumn, {
      ...form,
      techStack: form.techStack.split(',').map((t) => t.trim()).filter(Boolean),
    })
    toast.success('Project added!')
    setModalOpen(false)
    setForm({ name: '', description: '', techStack: '', githubUrl: '', demoUrl: '' })
  }

  const handleDelete = (projectId) => {
    for (const col of COLUMNS) {
      if (projects[col]?.some((p) => p.id === projectId)) {
        deleteProject(projectId, col)
        toast.success('Project removed')
        return
      }
    }
  }

  const totalProjects = COLUMNS.reduce((sum, col) => sum + (projects[col]?.length || 0), 0)

  return (
    <PageWrapper>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Project Tracker</h2>
          <p className="text-sm text-text-muted">{totalProjects} projects tracked</p>
        </div>
        <Button icon={Plus} onClick={() => handleAdd('Idea')}>New Project</Button>
      </div>

      <KanbanBoard
        columns={COLUMNS}
        items={projects}
        onMove={(id, from, to) => { moveProject(id, from, to); toast.success(`Moved to ${to}`) }}
        onAddItem={handleAdd}
        renderCard={(project) => (
          <TaskCard key={project.id} item={project}>
            <ProjectCardContent project={project} onDelete={handleDelete} />
          </TaskCard>
        )}
      />

      {/* Add Project Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Add Project to "${targetColumn}"`}>
        <div className="space-y-4">
          <div>
            <label className="label">Project Name *</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="DevFolio OS" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." />
          </div>
          <div>
            <label className="label">Tech Stack (comma separated)</label>
            <input className="input" value={form.techStack} onChange={(e) => setForm({ ...form, techStack: e.target.value })} placeholder="React, Node.js, PostgreSQL" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">GitHub URL</label>
              <input className="input" value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} placeholder="https://github.com/..." />
            </div>
            <div>
              <label className="label">Demo URL</label>
              <input className="input" value={form.demoUrl} onChange={(e) => setForm({ ...form, demoUrl: e.target.value })} placeholder="https://..." />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Add Project</Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  )
}

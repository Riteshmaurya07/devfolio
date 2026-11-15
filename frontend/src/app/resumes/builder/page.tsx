'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  FileText,
  Download,
  Upload,
  Sparkles,
  CheckCircle,
  Layers,
  Layout,
  GripVertical,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  Input,
  Textarea,
  Select,
} from '@/components/ui';

const TEMPLATES = [
  { name: 'modern', label: 'Modern Editorial' },
  { name: 'professional', label: 'Clean Monospace' },
  { name: 'minimal', label: 'Minimal Architectural' },
  { name: 'corporate', label: 'Standard ATS' },
  { name: 'creative', label: 'Technical Showcase' },
];

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ExperienceItem {
  _id: string;
  company: string;
  position: string;
  start_date?: string;
  end_date?: string;
  highlights?: string[];
  [key: string]: unknown;
}

interface ProjectItem {
  _id: string;
  title: string;
  description: string;
  link?: string;
  highlights?: string[];
  [key: string]: unknown;
}

const SortableExperienceItem = ({
  id,
  exp,
  onUpdate,
  onRemove,
}: {
  id: string;
  exp: ExperienceItem;
  onUpdate: (data: ExperienceItem) => void;
  onRemove: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 bg-[var(--surface-hover)] border border-[var(--border-subtle)] rounded-lg mb-3 flex gap-3 group"
    >
      <div {...attributes} {...listeners} className="cursor-grab text-[var(--text-muted)] hover:text-[#d9541e] pt-2">
        <GripVertical size={16} />
      </div>
      <div className="flex-1 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Position"
            value={exp.position || ''}
            onChange={(e) => onUpdate({ ...exp, position: e.target.value })}
            className="w-full px-3 py-1.5 border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-canvas)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#d9541e]"
          />
          <input
            type="text"
            placeholder="Company"
            value={exp.company || ''}
            onChange={(e) => onUpdate({ ...exp, company: e.target.value })}
            className="w-full px-3 py-1.5 border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-canvas)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#d9541e]"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Start Date"
            value={exp.start_date || ''}
            onChange={(e) => onUpdate({ ...exp, start_date: e.target.value })}
            className="w-full px-3 py-1.5 border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-canvas)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#d9541e]"
          />
          <input
            type="text"
            placeholder="End Date"
            value={exp.end_date || ''}
            onChange={(e) => onUpdate({ ...exp, end_date: e.target.value })}
            className="w-full px-3 py-1.5 border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-canvas)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#d9541e]"
          />
        </div>
      </div>
      <button
        onClick={onRemove}
        className="text-[var(--text-muted)] hover:text-red-500 p-2 transition-colors"
        aria-label="Remove Experience"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

const SortableProjectItem = ({
  id,
  proj,
  onUpdate,
  onRemove,
}: {
  id: string;
  proj: ProjectItem;
  onUpdate: (data: ProjectItem) => void;
  onRemove: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 bg-[var(--surface-hover)] border border-[var(--border-subtle)] rounded-lg mb-3 flex gap-3 group"
    >
      <div {...attributes} {...listeners} className="cursor-grab text-[var(--text-muted)] hover:text-[#d9541e] pt-2">
        <GripVertical size={16} />
      </div>
      <div className="flex-1 space-y-3">
        <div className="grid grid-cols-1 gap-2.5">
          <input
            type="text"
            placeholder="Project Title"
            value={proj.title || ''}
            onChange={(e) => onUpdate({ ...proj, title: e.target.value })}
            className="w-full px-3 py-1.5 border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-canvas)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#d9541e]"
          />
          <textarea
            placeholder="Description and impact metrics..."
            rows={2}
            value={proj.description || ''}
            onChange={(e) => onUpdate({ ...proj, description: e.target.value })}
            className="w-full px-3 py-1.5 border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-canvas)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#d9541e]"
          />
        </div>
      </div>
      <button
        onClick={onRemove}
        className="text-[var(--text-muted)] hover:text-red-500 p-2 transition-colors"
        aria-label="Remove Project"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export default function ResumeBuilderPage() {
  const [resumes, setResumes] = useState<unknown[]>([]);
  const [activeResume, setActiveResume] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Editable Form Content State
  const [title, setTitle] = useState('Master Resume');
  const [templateName, setTemplateName] = useState('modern');
  const [summary, setSummary] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ATS Review State
  const [atsReview, setAtsReview] = useState<Record<string, any> | null>(null);
  const [reviewingAts, setReviewingAts] = useState(false);
  const [targetRole, setTargetRole] = useState('fullstack');

  useEffect(() => {
    fetchResumes();
  }, []);

  async function fetchResumes() {
    try {
      const res = await api.get('/resumes/me');
      const list = Array.isArray(res.data) ? res.data : [];
      setResumes(list);

      const active = list.find((r: Record<string, any>) => r.is_active) || list[0];
      if (active) {
        loadResumeIntoState(active);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  }

  const loadResumeIntoState = (r: Record<string, any>) => {
    setActiveResume(r);
    setTitle(r.title);
    setTemplateName((r.template_name as string) || 'modern');
    const content = (r.content || r.resume_data) as Record<string, any> | undefined;
    const summaryVal = (content?.summary as string) || (content?.basics?.summary as string) || '';
    setSummary(summaryVal);
    const skills = content?.skills as string[] | undefined;
    setSkillsInput(skills ? skills.join(', ') : '');
    const contact = (content?.contact || content?.basics) as Record<string, any> | undefined;
    setName((contact?.name as string) || '');
    setEmail((contact?.email as string) || '');
    setPhone((contact?.phone as string) || '');

    const safeExp = (content?.experience || []) as ExperienceItem[];
    const safeProj = (content?.projects || []) as ProjectItem[];
    setExperience(
      safeExp.map((e, i) => ({
        ...e,
        position: e.position || (e as any).title || '',
        company: e.company || '',
        _id: e._id || `exp-${i}-${Date.now()}`,
      }))
    );
    setProjects(safeProj.map((p, i) => ({ ...p, _id: p._id || `proj-${i}-${Date.now()}` })));
  };

  const handleGenerateFromProfile = async () => {
    try {
      const res = await api.post('/resumes/generate-from-profile');
      const generatedContent = res.data;
      setSummary(generatedContent.summary || '');
      setSkillsInput(generatedContent.skills ? generatedContent.skills.join(', ') : '');
      setName(generatedContent.contact?.name || '');
      setEmail(generatedContent.contact?.email || '');
      setPhone(generatedContent.contact?.phone || '');
      setMessage('Resume sections pre-filled from your unified developer profile!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUploadAndParse = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await api.post('/resumes/upload-and-parse', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const parsed = res.data;
        setName(parsed.contact?.name || name);
        setEmail(parsed.contact?.email || email);
        setPhone(parsed.contact?.phone || phone);
        if (parsed.summary) setSummary(parsed.summary);
        if (parsed.skills) setSkillsInput(parsed.skills.join(', '));
        if (parsed.experience) {
          setExperience(
            (parsed.experience as ExperienceItem[]).map((e, i) => ({
              ...e,
              _id: `exp-${i}-${Date.now()}`,
            }))
          );
        }
        if (parsed.projects) {
          setProjects(
            (parsed.projects as ProjectItem[]).map((p, i) => ({
              ...p,
              _id: `proj-${i}-${Date.now()}`,
            }))
          );
        }
        setMessage('Resume parsed successfully! Review extracted content before saving.');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSaveVersion = async () => {
    setSaving(true);
    setMessage('');
    const skills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title,
      template_name: templateName,
      content: {
        contact: { name, email, phone, location: '', website: '', linkedin: '', github: '' },
        summary,
        skills,
        experience: experience.map((e) => {
          const rest = { ...e };
          delete (rest as any)._id;
          return rest;
        }),
        education: (activeResume?.content as Record<string, any>)?.education || [],
        projects: projects.map((p) => {
          const rest = { ...p };
          delete (rest as any)._id;
          return rest;
        }),
        certifications: [],
      },
    };

    try {
      await api.post('/resumes', payload);
      setMessage('New active resume version saved!');
      fetchResumes();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDragEndExp = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setExperience((items) => {
        const oldIndex = items.findIndex((i) => i._id === active.id);
        const newIndex = items.findIndex((i) => i._id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDragEndProj = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setProjects((items) => {
        const oldIndex = items.findIndex((i) => i._id === active.id);
        const newIndex = items.findIndex((i) => i._id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const updateExp = (id: string, updated: ExperienceItem) => {
    setExperience((prev) => prev.map((e) => (e._id === id ? updated : e)));
  };

  const removeExp = (id: string) => {
    setExperience((prev) => prev.filter((e) => e._id !== id));
  };

  const addExp = () => {
    setExperience([
      ...experience,
      {
        _id: `exp-new-${Date.now()}`,
        company: '',
        position: '',
        start_date: '',
        end_date: '',
        highlights: [],
      },
    ]);
  };

  const updateProj = (id: string, updated: ProjectItem) => {
    setProjects((prev) => prev.map((p) => (p._id === id ? updated : p)));
  };

  const removeProj = (id: string) => {
    setProjects((prev) => prev.filter((p) => p._id !== id));
  };

  const addProj = () => {
    setProjects([
      ...projects,
      {
        _id: `proj-new-${Date.now()}`,
        title: '',
        description: '',
        link: '',
        highlights: [],
      },
    ]);
  };

  const handleRunAtsReview = async () => {
    if (!activeResume) return;
    setReviewingAts(true);
    try {
      const res = await api.post(`/resumes/${activeResume.id}/review-ats`, {
        target_role: targetRole,
      });
      setAtsReview(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setReviewingAts(false);
    }
  };

  const handleActivate = async (versionId: string) => {
    try {
      await api.post(`/resumes/${versionId}/activate`);
      fetchResumes();
      setMessage('Resume version activated!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                Smart Resume Builder
              </h1>
              <Badge variant="burnt" size="sm">
                ATS Optimizer
              </Badge>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              JSON-backed developer resumes, drag-and-drop section compiler, PDF export, and keyword analyzer.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleGenerateFromProfile}
              leftIcon={<Sparkles size={13} />}
            >
              Sync Profile Data
            </Button>

            {activeResume && (
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/resumes/${activeResume.id}/export/pdf`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="primary" size="sm" leftIcon={<Download size={13} />}>
                  Export PDF
                </Button>
              </a>
            )}
          </div>
        </div>

        {message && (
          <div className="p-3 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] flex items-center justify-between">
            <span>{message}</span>
            <button
              onClick={() => setMessage('')}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-mono"
            >
              dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Template Selector & Upload */}
            <Card className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Layout size={18} className="text-[#d9541e]" />
                  <h2 className="text-base font-bold text-[var(--text-primary)]">
                    Typography & ATS Layout
                  </h2>
                </div>

                <label className="px-3 py-1.5 bg-[var(--surface-hover)] hover:bg-[var(--surface)] text-[var(--text-primary)] text-xs font-semibold rounded-lg border border-[var(--border-subtle)] cursor-pointer flex items-center gap-1.5 transition-colors">
                  <Upload size={13} className="text-[#d9541e]" /> Upload PDF/DOCX
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileUploadAndParse}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {TEMPLATES.map((t) => {
                  const isCurrent = templateName === t.name;
                  return (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => setTemplateName(t.name)}
                      className={`p-3 rounded-lg border text-left text-xs font-semibold transition-all duration-150 ${
                        isCurrent
                          ? 'border-[#d9541e] bg-[#d9541e]/5 text-[#d9541e] ring-1 ring-[#d9541e]'
                          : 'border-[var(--border-subtle)] bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* General Info & Summary */}
            <Card className="p-6 space-y-5">
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Contact & Core Narrative
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ada Lovelace"
                />
                <Input
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ada@domain.com"
                />
                <Input
                  label="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2831"
                />
              </div>

              <div>
                <Textarea
                  label="Professional Summary"
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Senior software engineer specializing in low-latency distributed systems..."
                />
              </div>

              <div>
                <Input
                  label="Technical Skills (Comma separated)"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="Python, FastAPI, TypeScript, PostgreSQL, Redis, Docker, Celery"
                />
              </div>

              {/* Experience Section */}
              <div className="pt-4 border-t border-[var(--border-subtle)]">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Work Experience
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addExp}
                    leftIcon={<Plus size={13} />}
                  >
                    Add Position
                  </Button>
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEndExp}
                >
                  <SortableContext
                    items={experience.map((e) => e._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {experience.map((exp) => (
                      <SortableExperienceItem
                        key={exp._id}
                        id={exp._id}
                        exp={exp}
                        onUpdate={(d) => updateExp(exp._id, d)}
                        onRemove={() => removeExp(exp._id)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
                {experience.length === 0 && (
                  <p className="text-xs text-[var(--text-muted)] italic py-2">
                    No positions logged. Add your work history above.
                  </p>
                )}
              </div>

              {/* Projects Section */}
              <div className="pt-4 border-t border-[var(--border-subtle)]">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Projects & Systems Built
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addProj}
                    leftIcon={<Plus size={13} />}
                  >
                    Add Project
                  </Button>
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEndProj}
                >
                  <SortableContext
                    items={projects.map((p) => p._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {projects.map((proj) => (
                      <SortableProjectItem
                        key={proj._id}
                        id={proj._id}
                        proj={proj}
                        onUpdate={(d) => updateProj(proj._id, d)}
                        onRemove={() => removeProj(proj._id)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
                {projects.length === 0 && (
                  <p className="text-xs text-[var(--text-muted)] italic py-2">
                    No projects logged. Add your key technical accomplishments above.
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-[var(--border-subtle)]">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveVersion}
                  isLoading={saving}
                >
                  Save Active Resume Version
                </Button>
              </div>
            </Card>
          </div>

          {/* ATS Review & Version History Sidebar */}
          <div className="space-y-6">
            {/* ATS Analyzer Card */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#d9541e]" />
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  ATS Score Engine
                </h2>
              </div>

              <div className="space-y-2.5">
                <Select
                  label="Target Role"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  options={[
                    { value: 'fullstack', label: 'Fullstack Engineer' },
                    { value: 'backend', label: 'Backend Engineer' },
                    { value: 'frontend', label: 'Frontend Engineer' },
                  ]}
                />

                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={handleRunAtsReview}
                  isLoading={reviewingAts}
                  disabled={!activeResume}
                >
                  Analyze ATS Score
                </Button>
              </div>

              {atsReview && (
                <div className="space-y-3 pt-2">
                  <div className="p-4 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-center">
                    <span className="text-3xl font-extrabold font-mono text-[#d9541e]">
                      {atsReview.score}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] block mt-0.5">
                      ATS Score / 100
                    </span>
                  </div>

                  {atsReview.missing_skills && atsReview.missing_skills.length > 0 && (
                    <div className="p-3 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-xs">
                      <p className="font-semibold text-amber-600 dark:text-amber-400 mb-1">
                        Missing Keywords:
                      </p>
                      <p className="text-[var(--text-secondary)]">{atsReview.missing_skills.join(', ')}</p>
                    </div>
                  )}

                  {atsReview.action_verb_feedback && (
                    <div className="p-3 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-xs">
                      <p className="font-semibold text-[var(--text-primary)] mb-1">Action Verbs:</p>
                      <p className="text-[var(--text-secondary)]">{atsReview.action_verb_feedback.join(' ')}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Version History Drawer */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-[#d9541e]" />
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  Version Archive
                </h2>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {resumes.map((r: any) => {
                  const isCurrent = r.id === activeResume?.id;
                  return (
                    <div
                      key={r.id}
                      className={`p-3 rounded-lg border text-xs flex justify-between items-center transition-colors ${
                        isCurrent
                          ? 'bg-[var(--surface-hover)] border-[#d9541e]'
                          : 'bg-[var(--surface)] border-[var(--border-subtle)]'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-[var(--text-primary)]">
                          v{r.version_number} — {r.title}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] font-mono">
                          {new Date(r.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div>
                        {r.is_active ? (
                          <Badge variant="success" size="sm">
                            Active
                          </Badge>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleActivate(r.id)}
                          >
                            Activate
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

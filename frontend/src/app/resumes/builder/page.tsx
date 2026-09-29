'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { FileText, Download, Upload, Sparkles, CheckCircle, Layers, Layout, GripVertical, Plus, Trash2 } from 'lucide-react';

const TEMPLATES = [
  { name: 'modern', label: 'Modern Indigo' },
  { name: 'professional', label: 'Professional Slate' },
  { name: 'minimal', label: 'Minimal Black' },
  { name: 'corporate', label: 'Corporate Blue' },
  { name: 'creative', label: 'Creative Purple' }
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

const SortableExperienceItem = ({ id, exp, onUpdate, onRemove }: { id: string; exp: ExperienceItem; onUpdate: (data: ExperienceItem) => void; onRemove: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className="p-4 bg-slate-800 border border-slate-700 rounded-xl mb-3 flex gap-3 group">
      <div {...attributes} {...listeners} className="cursor-grab text-slate-500 hover:text-indigo-400 pt-2">
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="flex-1 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="text" placeholder="Position" value={exp.position || ''} onChange={e => onUpdate({ ...exp, position: e.target.value })} className="w-full px-3 py-1.5 border border-slate-700 rounded-lg bg-slate-900 text-sm text-white" />
          <input type="text" placeholder="Company" value={exp.company || ''} onChange={e => onUpdate({ ...exp, company: e.target.value })} className="w-full px-3 py-1.5 border border-slate-700 rounded-lg bg-slate-900 text-sm text-white" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="text" placeholder="Start Date" value={exp.start_date || ''} onChange={e => onUpdate({ ...exp, start_date: e.target.value })} className="w-full px-3 py-1.5 border border-slate-700 rounded-lg bg-slate-900 text-sm text-white" />
          <input type="text" placeholder="End Date" value={exp.end_date || ''} onChange={e => onUpdate({ ...exp, end_date: e.target.value })} className="w-full px-3 py-1.5 border border-slate-700 rounded-lg bg-slate-900 text-sm text-white" />
        </div>
      </div>
      <button onClick={onRemove} className="text-slate-500 hover:text-red-400 p-2">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

const SortableProjectItem = ({ id, proj, onUpdate, onRemove }: { id: string; proj: ProjectItem; onUpdate: (data: ProjectItem) => void; onRemove: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className="p-4 bg-slate-800 border border-slate-700 rounded-xl mb-3 flex gap-3 group">
      <div {...attributes} {...listeners} className="cursor-grab text-slate-500 hover:text-indigo-400 pt-2">
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="flex-1 space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <input type="text" placeholder="Project Title" value={proj.title || ''} onChange={e => onUpdate({ ...proj, title: e.target.value })} className="w-full px-3 py-1.5 border border-slate-700 rounded-lg bg-slate-900 text-sm text-white" />
          <textarea placeholder="Description" rows={2} value={proj.description || ''} onChange={e => onUpdate({ ...proj, description: e.target.value })} className="w-full px-3 py-1.5 border border-slate-700 rounded-lg bg-slate-900 text-sm text-white" />
        </div>
      </div>
      <button onClick={onRemove} className="text-slate-500 hover:text-red-400 p-2">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
export default function ResumeBuilderPage() {
  const [resumes, setResumes] = useState<unknown[]>([]);
  const [activeResume, setActiveResume] = useState<Record<string, unknown> | null>(null);
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
  const [atsReview, setAtsReview] = useState<Record<string, unknown> | null>(null);
  const [reviewingAts, setReviewingAts] = useState(false);
  const [targetRole, setTargetRole] = useState('fullstack');

  useEffect(() => {
    fetchResumes();
  }, []);

  async function fetchResumes() {
    try {
      const res = await api.get('/resumes/me');
      const list = res.data;
      setResumes(list);

      const active = list.find((r: Record<string, unknown>) => r.is_active) || list[0];
      if (active) {
        loadResumeIntoState(active);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadResumeIntoState = (r: Record<string, unknown>) => {
    setActiveResume(r);
    setTitle(r.title);
    setTemplateName((r.template_name as string) || 'modern');
    const content = r.content as Record<string, unknown> | undefined;
    setSummary((content?.summary as string) || '');
    const skills = content?.skills as string[] | undefined;
    setSkillsInput(skills ? skills.join(', ') : '');
    const contact = content?.contact as Record<string, unknown> | undefined;
    setName((contact?.name as string) || '');
    setEmail((contact?.email as string) || '');
    setPhone((contact?.phone as string) || '');

    const safeExp = (content?.experience || []) as ExperienceItem[];
    const safeProj = (content?.projects || []) as ProjectItem[];
    setExperience(safeExp.map((e, i) => ({ ...e, _id: e._id || `exp-${i}-${Date.now()}` })));
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
      setMessage('Resume sections pre-filled from Profile & Portfolio!');
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
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const parsed = res.data;
        setName(parsed.contact?.name || name);
        setEmail(parsed.contact?.email || email);
        setPhone(parsed.contact?.phone || phone);
        if (parsed.summary) setSummary(parsed.summary);
        if (parsed.skills) setSkillsInput(parsed.skills.join(', '));
        if (parsed.experience) {
          setExperience((parsed.experience as ExperienceItem[]).map((e, i) => ({ ...e, _id: `exp-${i}-${Date.now()}` })));
        }
        if (parsed.projects) {
          setProjects((parsed.projects as ProjectItem[]).map((p, i) => ({ ...p, _id: `proj-${i}-${Date.now()}` })));
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
    const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);

    const payload = {
      title,
      template_name: templateName,
      content: {
        contact: { name, email, phone, location: '', website: '', linkedin: '', github: '' },
        summary,
        skills,
        experience: experience.map(e => { const rest = { ...e }; delete rest._id; return rest; }),
        education: (activeResume?.content as Record<string, unknown>)?.education || [],
        projects: projects.map(p => { const rest = { ...p }; delete rest._id; return rest; }),
        certifications: []
      }
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
        const oldIndex = items.findIndex(i => i._id === active.id);
        const newIndex = items.findIndex(i => i._id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDragEndProj = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setProjects((items) => {
        const oldIndex = items.findIndex(i => i._id === active.id);
        const newIndex = items.findIndex(i => i._id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const updateExp = (id: string, updated: ExperienceItem) => {
    setExperience(prev => prev.map(e => e._id === id ? updated : e));
  };
  
  const removeExp = (id: string) => {
    setExperience(prev => prev.filter(e => e._id !== id));
  };
  
  const addExp = () => {
    setExperience([...experience, { _id: `exp-new-${Date.now()}`, company: '', position: '', start_date: '', end_date: '', highlights: [] }]);
  };

  const updateProj = (id: string, updated: ProjectItem) => {
    setProjects(prev => prev.map(p => p._id === id ? updated : p));
  };
  
  const removeProj = (id: string) => {
    setProjects(prev => prev.filter(p => p._id !== id));
  };

  const addProj = () => {
    setProjects([...projects, { _id: `proj-new-${Date.now()}`, title: '', description: '', link: '', highlights: [] }]);
  };

  const handleRunAtsReview = async () => {
    if (!activeResume) return;
    setReviewingAts(true);
    try {
      const res = await api.post(`/resumes/${activeResume.id}/review-ats`, { target_role: targetRole });
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

  if (loading) {
    return <DashboardShell><div className="text-white">Loading Resume Builder...</div></DashboardShell>;
  }

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <FileText className="w-8 h-8 text-indigo-400" /> Resume Builder
            </h1>
            <p className="text-slate-400 text-sm mt-1">Multi-template PDF/DOCX compiler, parser, and ATS review engine.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateFromProfile}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" /> Generate from Profile
            </button>

            {activeResume && (
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/resumes/${activeResume.id}/export/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                <Download className="w-4 h-4" /> Export PDF
              </a>
            )}
          </div>
        </div>

        {message && (
          <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-500/50 text-indigo-200 text-sm">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Editor */}
          <div className="lg:col-span-2 space-y-8">
            {/* Template Selector & Upload */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layout className="w-5 h-5 text-indigo-400" /> Template & File Import
                </h2>

                <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 cursor-pointer flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-indigo-400" /> Upload PDF/DOCX
                  <input type="file" accept=".pdf,.docx" onChange={handleFileUploadAndParse} className="hidden" />
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {TEMPLATES.map(t => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => setTemplateName(t.name)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition ${templateName === t.name ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* General Info & Summary */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h2 className="text-lg font-bold text-white">Contact & Professional Summary</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-700 text-white rounded-lg bg-slate-800 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-700 text-white rounded-lg bg-slate-800 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Phone</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 border border-slate-700 text-white rounded-lg bg-slate-800 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Professional Summary</label>
                <textarea rows={3} value={summary} onChange={e => setSummary(e.target.value)} className="w-full px-3 py-2 border border-slate-700 text-white rounded-lg bg-slate-800 text-sm" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Skills (comma separated)</label>
                <input type="text" value={skillsInput} onChange={e => setSkillsInput(e.target.value)} className="w-full px-3 py-2 border border-slate-700 text-white rounded-lg bg-slate-800 text-sm" />
              </div>

              {/* Experience Section */}
              <div className="pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-white">Work Experience</h3>
                  <button type="button" onClick={addExp} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Experience
                  </button>
                </div>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndExp}>
                  <SortableContext items={experience.map(e => e._id)} strategy={verticalListSortingStrategy}>
                    {experience.map(exp => (
                      <SortableExperienceItem key={exp._id} id={exp._id} exp={exp} onUpdate={(d) => updateExp(exp._id, d)} onRemove={() => removeExp(exp._id)} />
                    ))}
                  </SortableContext>
                </DndContext>
                {experience.length === 0 && <p className="text-xs text-slate-500 italic">No experience added yet.</p>}
              </div>

              {/* Projects Section */}
              <div className="pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-white">Projects</h3>
                  <button type="button" onClick={addProj} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Project
                  </button>
                </div>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndProj}>
                  <SortableContext items={projects.map(p => p._id)} strategy={verticalListSortingStrategy}>
                    {projects.map(proj => (
                      <SortableProjectItem key={proj._id} id={proj._id} proj={proj} onUpdate={(d) => updateProj(proj._id, d)} onRemove={() => removeProj(proj._id)} />
                    ))}
                  </SortableContext>
                </DndContext>
                {projects.length === 0 && <p className="text-xs text-slate-500 italic">No projects added yet.</p>}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveVersion}
                  disabled={saving}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
                >
                  {saving ? 'Saving...' : 'Save New Resume Version'}
                </button>
              </div>
            </div>
          </div>

          {/* ATS Review & Version History Sidebar */}
          <div className="space-y-8">
            {/* ATS Analyzer Drawer */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" /> ATS Optimization Analyzer
              </h2>

              <div className="flex items-center gap-2">
                <select
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-700 text-white rounded-lg bg-slate-800 text-xs"
                >
                  <option value="fullstack">Fullstack Engineer</option>
                  <option value="backend">Backend Engineer</option>
                  <option value="frontend">Frontend Engineer</option>
                </select>

                <button
                  type="button"
                  onClick={handleRunAtsReview}
                  disabled={reviewingAts || !activeResume}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
                >
                  {reviewingAts ? 'Analyzing...' : 'Run ATS Review'}
                </button>
              </div>

              {atsReview && (
                <div className="space-y-3 pt-2">
                  <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-center">
                    <span className="text-3xl font-extrabold text-indigo-300">{atsReview.score}</span>
                    <span className="text-xs text-slate-400 block mt-1">ATS Score / 100</span>
                  </div>

                  {atsReview.missing_skills && atsReview.missing_skills.length > 0 && (
                    <div className="p-3 rounded-lg bg-slate-800 border border-slate-700 text-xs">
                      <p className="font-semibold text-amber-400 mb-1">Missing Target Keywords:</p>
                      <p className="text-slate-300">{atsReview.missing_skills.join(', ')}</p>
                    </div>
                  )}

                  {atsReview.action_verb_feedback && (
                    <div className="p-3 rounded-lg bg-slate-800 border border-slate-700 text-xs">
                      <p className="font-semibold text-indigo-300 mb-1">Action Verbs:</p>
                      <p className="text-slate-300">{atsReview.action_verb_feedback.join(' ')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Version History Drawer */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" /> Version History
              </h2>

              <div className="space-y-2">
                {resumes.map(r => (
                  <div
                    key={r.id}
                    className={`p-3 rounded-xl border text-xs flex justify-between items-center transition ${r.id === activeResume?.id ? 'bg-slate-800 border-indigo-500' : 'bg-slate-900 border-slate-800'}`}
                  >
                    <div>
                      <p className="font-semibold text-white">v{r.version_number} — {r.title}</p>
                      <p className="text-[10px] text-slate-400">{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {r.is_active ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <button
                          onClick={() => handleActivate(r.id)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

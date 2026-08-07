'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { FileText, Download, Upload, Sparkles, CheckCircle, RefreshCw, Layers, Layout, ArrowRight } from 'lucide-react';

const TEMPLATES = [
  { name: 'modern', label: 'Modern Indigo' },
  { name: 'professional', label: 'Professional Slate' },
  { name: 'minimal', label: 'Minimal Black' },
  { name: 'corporate', label: 'Corporate Blue' },
  { name: 'creative', label: 'Creative Purple' }
];

export default function ResumeBuilderPage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [activeResume, setActiveResume] = useState<any>(null);
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

  // ATS Review State
  const [atsReview, setAtsReview] = useState<any>(null);
  const [reviewingAts, setReviewingAts] = useState(false);
  const [targetRole, setTargetRole] = useState('fullstack');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes/me');
      const list = res.data;
      setResumes(list);

      const active = list.find((r: any) => r.is_active) || list[0];
      if (active) {
        loadResumeIntoState(active);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadResumeIntoState = (r: any) => {
    setActiveResume(r);
    setTitle(r.title);
    setTemplateName(r.template_name || 'modern');
    setSummary(r.content?.summary || '');
    setSkillsInput(r.content?.skills ? r.content.skills.join(', ') : '');
    setName(r.content?.contact?.name || '');
    setEmail(r.content?.contact?.email || '');
    setPhone(r.content?.contact?.phone || '');
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
        experience: activeResume?.content?.experience || [],
        education: activeResume?.content?.education || [],
        projects: activeResume?.content?.projects || [],
        certifications: []
      }
    };

    try {
      const res = await api.post('/resumes', payload);
      setMessage('New active resume version saved!');
      fetchResumes();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
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

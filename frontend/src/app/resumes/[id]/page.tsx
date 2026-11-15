'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Resume } from '@/types';
import { Trash2, Plus, ArrowLeft, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button, Input, Textarea } from '@/components/ui';

export default function ResumeEditorPage() {
  const params = useParams();
  const router = useRouter();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const isFirstRender = useRef(true);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await api.get(`/resumes/${params.id}`);
        const data = res.data;
        const rawContent = data.resume_data || data.content || {};
        const contact = rawContent.contact || {};
        const rawBasics = rawContent.basics || {};
        const normalized: Resume = {
          ...data,
          resume_data: {
            ...rawContent,
            basics: {
              name: rawBasics.name || contact.name || '',
              email: rawBasics.email || contact.email || '',
              summary: rawBasics.summary || rawContent.summary || '',
            },
            contact: {
              name: rawBasics.name || contact.name || '',
              email: rawBasics.email || contact.email || '',
              phone: contact.phone || '',
              location: contact.location || '',
              website: contact.website || '',
              linkedin: contact.linkedin || '',
              github: contact.github || '',
            },
            summary: rawBasics.summary || rawContent.summary || '',
            experience: (rawContent.experience || []).map((exp: any) => ({
              ...exp,
              title: exp.title || exp.position || '',
              position: exp.position || exp.title || '',
              company: exp.company || '',
              start_date: exp.start_date || '',
              end_date: exp.end_date || '',
              description: exp.description || (Array.isArray(exp.highlights) ? exp.highlights.join('\n') : ''),
            })),
            education: (rawContent.education || []).map((edu: any) => ({
              ...edu,
              institution: edu.institution || '',
              degree: edu.degree || '',
              field_of_study: edu.field_of_study || '',
              start_date: edu.start_date || '',
              end_date: edu.end_date || '',
            })),
          },
        };
        setResume(normalized);
      } catch (err) {
        toast.error('Failed to load resume');
        router.push('/resumes');
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      fetchResume();
    }
  }, [params.id, router]);

  useEffect(() => {
    if (isFirstRender.current) {
      if (resume) isFirstRender.current = false;
      return;
    }
    if (!resume) return;

    setSaveStatus('unsaved');
    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const payloadData = {
          ...resume.resume_data,
          contact: {
            ...(resume.resume_data?.contact || {}),
            name: resume.resume_data?.basics?.name || '',
            email: resume.resume_data?.basics?.email || '',
          },
          summary: resume.resume_data?.basics?.summary || '',
        };
        await api.put(`/resumes/${resume.id}`, {
          title: resume.title,
          resume_data: payloadData,
        });
        setSaveStatus('saved');
      } catch (err) {
        toast.error('Auto-save failed');
        setSaveStatus('unsaved');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [resume]);

  const handleSave = async () => {
    if (!resume) return;
    setSaveStatus('saving');
    try {
      const payloadData = {
        ...resume.resume_data,
        contact: {
          ...(resume.resume_data?.contact || {}),
          name: resume.resume_data?.basics?.name || '',
          email: resume.resume_data?.basics?.email || '',
        },
        summary: resume.resume_data?.basics?.summary || '',
      };
      await api.put(`/resumes/${resume.id}`, {
        title: resume.title,
        resume_data: payloadData,
      });
      setSaveStatus('saved');
    } catch (err) {
      toast.error('Save failed');
      setSaveStatus('unsaved');
    }
  };

  const handleBasicsChange = (field: string, value: string) => {
    if (!resume) return;
    setResume({
      ...resume,
      resume_data: {
        ...(resume.resume_data || {}),
        basics: {
          ...(resume.resume_data?.basics || {}),
          [field]: value,
        },
        contact: {
          ...(resume.resume_data?.contact || {}),
          ...(field === 'name' ? { name: value } : {}),
          ...(field === 'email' ? { email: value } : {}),
        },
        ...(field === 'summary' ? { summary: value } : {}),
      },
    });
  };

  const handleArrayChange = (
    arrayName: 'experience' | 'education',
    index: number,
    field: string,
    value: string
  ) => {
    if (!resume) return;
    const currentArray = resume.resume_data?.[arrayName] || [];
    const newArray = [...currentArray];
    const updatedItem = { ...newArray[index], [field]: value };
    if (arrayName === 'experience') {
      if (field === 'title') updatedItem.position = value;
      if (field === 'position') updatedItem.title = value;
    }
    newArray[index] = updatedItem;

    setResume({
      ...resume,
      resume_data: {
        ...(resume.resume_data || {}),
        [arrayName]: newArray,
      },
    });
  };

  const addArrayItem = (arrayName: 'experience' | 'education') => {
    if (!resume) return;
    const currentArray = resume.resume_data?.[arrayName] || [];
    const newItem =
      arrayName === 'experience'
        ? { title: '', position: '', company: '', start_date: '', end_date: '', description: '', highlights: [] }
        : { institution: '', degree: '', field_of_study: '', start_date: '', end_date: '' };

    setResume({
      ...resume,
      resume_data: {
        ...(resume.resume_data || {}),
        [arrayName]: [...currentArray, newItem],
      },
    });
  };

  const removeArrayItem = (arrayName: 'experience' | 'education', index: number) => {
    if (!resume) return;
    const currentArray = resume.resume_data?.[arrayName] || [];
    const newArray = [...currentArray];
    newArray.splice(index, 1);

    setResume({
      ...resume,
      resume_data: {
        ...(resume.resume_data || {}),
        [arrayName]: newArray,
      },
    });
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="py-12 text-center text-xs text-[var(--text-muted)]">
          Loading resume document...
        </div>
      </DashboardShell>
    );
  }

  if (!resume) return null;

  const exp = resume.resume_data?.experience || [];
  const edu = resume.resume_data?.education || [];

  return (
    <DashboardShell>
      <div className="flex flex-col h-[calc(100vh-120px)] space-y-4 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push('/resumes')}
              leftIcon={<ArrowLeft size={13} />}
            >
              Back
            </Button>
            <input
              type="text"
              value={resume.title}
              onChange={(e) => setResume({ ...resume, title: e.target.value })}
              className="text-lg font-bold bg-transparent border-none text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#d9541e] px-1 rounded"
            />
          </div>
          <div className="flex items-center gap-2.5">
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/resumes/${resume.id}/export/pdf`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" size="sm" leftIcon={<Download size={13} />}>
                Export PDF
              </Button>
            </a>
            <Badge
              variant={saveStatus === 'saved' ? 'success' : saveStatus === 'saving' ? 'burnt' : 'neutral'}
              size="sm"
            >
              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Synced' : 'Unsaved'}
            </Badge>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={saveStatus === 'saved' || saveStatus === 'saving'}
            >
              Save Now
            </Button>
          </div>
        </div>

        {/* Split Pane */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
          {/* Editor (Left Pane) */}
          <Card className="w-full lg:w-1/2 p-6 overflow-y-auto space-y-6">
            <section className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2">
                Basic Contact Info
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Full Name"
                  value={resume.resume_data?.basics?.name || ''}
                  onChange={(e) => handleBasicsChange('name', e.target.value)}
                />
                <Input
                  label="Email"
                  type="email"
                  value={resume.resume_data?.basics?.email || ''}
                  onChange={(e) => handleBasicsChange('email', e.target.value)}
                />
              </div>
              <Textarea
                label="Professional Summary"
                rows={3}
                value={resume.resume_data?.basics?.summary || ''}
                onChange={(e) => handleBasicsChange('summary', e.target.value)}
              />
            </section>

            <section className="space-y-4 border-t border-[var(--border-subtle)] pt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Experience
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addArrayItem('experience')}
                  leftIcon={<Plus size={13} />}
                >
                  Add Job
                </Button>
              </div>

              <div className="space-y-4">
                {exp.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-hover)] relative space-y-3"
                  >
                    <button
                      onClick={() => removeArrayItem('experience', i)}
                      className="absolute top-3 right-3 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                      aria-label="Remove Experience"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="grid grid-cols-2 gap-3 pr-6">
                      <Input
                        label="Job Title"
                        value={item.title || ''}
                        onChange={(e) => handleArrayChange('experience', i, 'title', e.target.value)}
                      />
                      <Input
                        label="Company"
                        value={item.company || ''}
                        onChange={(e) => handleArrayChange('experience', i, 'company', e.target.value)}
                      />
                      <Input
                        label="Start Date"
                        value={item.start_date || ''}
                        onChange={(e) => handleArrayChange('experience', i, 'start_date', e.target.value)}
                        placeholder="2021"
                      />
                      <Input
                        label="End Date"
                        value={item.end_date || ''}
                        onChange={(e) => handleArrayChange('experience', i, 'end_date', e.target.value)}
                        placeholder="Present"
                      />
                    </div>
                    <Textarea
                      label="Description"
                      rows={2}
                      value={item.description || ''}
                      onChange={(e) => handleArrayChange('experience', i, 'description', e.target.value)}
                    />
                  </div>
                ))}
                {exp.length === 0 && (
                  <p className="text-xs text-[var(--text-muted)] italic py-2">
                    No experience records added.
                  </p>
                )}
              </div>
            </section>

            <section className="space-y-4 border-t border-[var(--border-subtle)] pt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Education
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addArrayItem('education')}
                  leftIcon={<Plus size={13} />}
                >
                  Add Education
                </Button>
              </div>

              <div className="space-y-4">
                {edu.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-hover)] relative space-y-3"
                  >
                    <button
                      onClick={() => removeArrayItem('education', i)}
                      className="absolute top-3 right-3 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                      aria-label="Remove Education"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="grid grid-cols-2 gap-3 pr-6">
                      <div className="col-span-2">
                        <Input
                          label="Institution"
                          value={item.institution || ''}
                          onChange={(e) => handleArrayChange('education', i, 'institution', e.target.value)}
                        />
                      </div>
                      <Input
                        label="Degree"
                        value={item.degree || ''}
                        onChange={(e) => handleArrayChange('education', i, 'degree', e.target.value)}
                      />
                      <Input
                        label="Field of Study"
                        value={item.field_of_study || ''}
                        onChange={(e) => handleArrayChange('education', i, 'field_of_study', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                {edu.length === 0 && (
                  <p className="text-xs text-[var(--text-muted)] italic py-2">
                    No education records added.
                  </p>
                )}
              </div>
            </section>
          </Card>

          {/* Preview (Right Pane) */}
          <div className="w-full lg:w-1/2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-8 overflow-y-auto flex justify-center shadow-inner">
            <div className="w-full max-w-[720px] min-h-[960px] bg-white text-slate-900 p-10 shadow-sm border border-slate-200 rounded-sm">
              <header className="text-center border-b border-slate-200 pb-5 mb-5">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {resume.resume_data?.basics?.name || 'Your Full Name'}
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  {resume.resume_data?.basics?.email || 'email@example.com'}
                </p>
              </header>

              <section className="mb-5">
                <h2 className="text-xs font-bold tracking-wider uppercase text-slate-800 border-b border-slate-200 mb-2 pb-0.5">
                  Professional Summary
                </h2>
                <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {resume.resume_data?.basics?.summary || 'Executive summary of skills and track record...'}
                </p>
              </section>

              {exp.length > 0 && (
                <section className="mb-5">
                  <h2 className="text-xs font-bold tracking-wider uppercase text-slate-800 border-b border-slate-200 mb-2 pb-0.5">
                    Experience
                  </h2>
                  <div className="space-y-3">
                    {exp.map((item: any, i: number) => (
                      <div key={i} className="text-xs">
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          <span>{item.title || 'Role'}</span>
                          <span className="text-[11px] font-mono font-normal text-slate-500">
                            {item.start_date} {item.start_date && item.end_date ? '—' : ''} {item.end_date}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#d9541e] font-semibold">{item.company}</div>
                        <p className="text-xs text-slate-700 mt-1 whitespace-pre-wrap leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {edu.length > 0 && (
                <section className="mb-5">
                  <h2 className="text-xs font-bold tracking-wider uppercase text-slate-800 border-b border-slate-200 mb-2 pb-0.5">
                    Education
                  </h2>
                  <div className="space-y-2">
                    {edu.map((item: any, i: number) => (
                      <div key={i} className="text-xs">
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          <span>{item.institution}</span>
                          <span className="text-[11px] font-mono font-normal text-slate-500">
                            {item.start_date} {item.start_date && item.end_date ? '—' : ''} {item.end_date}
                          </span>
                        </div>
                        <div className="text-xs text-slate-700">
                          {item.degree} {item.degree && item.field_of_study ? 'in ' : ''}
                          {item.field_of_study}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

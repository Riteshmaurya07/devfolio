'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Resume } from '@/types';
import { Trash2, Plus } from 'lucide-react';

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
        setResume(res.data);
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

  // Auto-save debounce effect
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
        await api.put(`/resumes/${resume.id}`, {
          title: resume.title,
          resume_data: resume.resume_data
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
      await api.put(`/resumes/${resume.id}`, {
        title: resume.title,
        resume_data: resume.resume_data
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
          [field]: value
        }
      }
    });
  };

  const handleArrayChange = (arrayName: 'experience' | 'education', index: number, field: string, value: string) => {
    if (!resume) return;
    const currentArray = resume.resume_data?.[arrayName] || [];
    const newArray = [...currentArray];
    newArray[index] = { ...newArray[index], [field]: value };

    setResume({
      ...resume,
      resume_data: {
        ...(resume.resume_data || {}),
        [arrayName]: newArray
      }
    });
  };

  const addArrayItem = (arrayName: 'experience' | 'education') => {
    if (!resume) return;
    const currentArray = resume.resume_data?.[arrayName] || [];
    const newItem = arrayName === 'experience' 
      ? { title: '', company: '', start_date: '', end_date: '', description: '' }
      : { institution: '', degree: '', field_of_study: '', start_date: '', end_date: '' };
    
    setResume({
      ...resume,
      resume_data: {
        ...(resume.resume_data || {}),
        [arrayName]: [...currentArray, newItem]
      }
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
        [arrayName]: newArray
      }
    });
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardShell>
    );
  }

  if (!resume) return null;

  const exp = resume.resume_data?.experience || [];
  const edu = resume.resume_data?.education || [];

  return (
    <DashboardShell>
      <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 -m-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/resumes')} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
              &larr; Back
            </button>
            <input 
              type="text" 
              value={resume.title}
              onChange={(e) => setResume({...resume, title: e.target.value})}
              className="text-2xl font-bold bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <button 
              onClick={handleSave}
              disabled={saveStatus === 'saved' || saveStatus === 'saving'}
              className={`px-4 py-2 rounded-lg font-medium transition text-white ${
                saveStatus === 'saved' ? 'bg-green-600 opacity-70 cursor-not-allowed' :
                saveStatus === 'saving' ? 'bg-indigo-600 opacity-70 cursor-not-allowed' :
                'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {saveStatus === 'saving' ? 'Saving...' : 
               saveStatus === 'saved' ? 'Saved' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Split Pane */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
          
          {/* Editor (Left Pane) */}
          <div className="w-full lg:w-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-y-auto p-6 space-y-8">
            <section>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">Basic Info</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={resume.resume_data?.basics?.name || ''}
                    onChange={(e) => handleBasicsChange('name', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={resume.resume_data?.basics?.email || ''}
                    onChange={(e) => handleBasicsChange('email', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Professional Summary</label>
                  <textarea 
                    rows={4}
                    value={resume.resume_data?.basics?.summary || ''}
                    onChange={(e) => handleBasicsChange('summary', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            </section>
            
            <section>
              <div className="flex justify-between items-center border-b pb-2 mb-4 border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Experience</h3>
                <button onClick={() => addArrayItem('experience')} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"><Plus size={16} /> Add Job</button>
              </div>
              <div className="space-y-6">
                {exp.map((item: any, i: number) => (
                  <div key={i} className="p-4 border rounded-xl dark:border-gray-700 relative">
                    <button onClick={() => removeArrayItem('experience', i)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Job Title</label>
                        <input type="text" value={item.title || ''} onChange={(e) => handleArrayChange('experience', i, 'title', e.target.value)} className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Company</label>
                        <input type="text" value={item.company || ''} onChange={(e) => handleArrayChange('experience', i, 'company', e.target.value)} className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                        <input type="text" value={item.start_date || ''} onChange={(e) => handleArrayChange('experience', i, 'start_date', e.target.value)} placeholder="e.g. 2020" className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">End Date</label>
                        <input type="text" value={item.end_date || ''} onChange={(e) => handleArrayChange('experience', i, 'end_date', e.target.value)} placeholder="e.g. Present" className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Description</label>
                      <textarea rows={3} value={item.description || ''} onChange={(e) => handleArrayChange('experience', i, 'description', e.target.value)} className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"></textarea>
                    </div>
                  </div>
                ))}
                {exp.length === 0 && <div className="text-gray-500 text-sm text-center py-4">No experience added.</div>}
              </div>
            </section>

            <section>
              <div className="flex justify-between items-center border-b pb-2 mb-4 border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Education</h3>
                <button onClick={() => addArrayItem('education')} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"><Plus size={16} /> Add Education</button>
              </div>
              <div className="space-y-6">
                {edu.map((item: any, i: number) => (
                  <div key={i} className="p-4 border rounded-xl dark:border-gray-700 relative">
                    <button onClick={() => removeArrayItem('education', i)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">Institution</label>
                        <input type="text" value={item.institution || ''} onChange={(e) => handleArrayChange('education', i, 'institution', e.target.value)} className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Degree</label>
                        <input type="text" value={item.degree || ''} onChange={(e) => handleArrayChange('education', i, 'degree', e.target.value)} className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Field of Study</label>
                        <input type="text" value={item.field_of_study || ''} onChange={(e) => handleArrayChange('education', i, 'field_of_study', e.target.value)} className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                        <input type="text" value={item.start_date || ''} onChange={(e) => handleArrayChange('education', i, 'start_date', e.target.value)} className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">End Date</label>
                        <input type="text" value={item.end_date || ''} onChange={(e) => handleArrayChange('education', i, 'end_date', e.target.value)} className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600" />
                      </div>
                    </div>
                  </div>
                ))}
                {edu.length === 0 && <div className="text-gray-500 text-sm text-center py-4">No education added.</div>}
              </div>
            </section>
          </div>

          {/* Preview (Right Pane) */}
          <div className="w-full lg:w-1/2 bg-gray-200 dark:bg-gray-950 rounded-xl border border-gray-300 dark:border-gray-800 p-8 overflow-y-auto flex justify-center">
            {/* The "Paper" */}
            <div className="w-full max-w-[800px] min-h-[1056px] bg-white p-12 shadow-md">
              <header className="text-center border-b pb-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {resume.resume_data?.basics?.name || 'Your Name'}
                </h1>
                <p className="text-gray-600">
                  {resume.resume_data?.basics?.email || 'email@example.com'}
                </p>
              </header>
              <section className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-gray-300 mb-3 pb-1">Professional Summary</h2>
                <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                  {resume.resume_data?.basics?.summary || 'Write a brief summary of your background...'}
                </p>
              </section>
              
              {exp.length > 0 && (
                <section className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-gray-300 mb-3 pb-1">Experience</h2>
                  <div className="space-y-4">
                    {exp.map((item: any, i: number) => (
                      <div key={i}>
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-gray-900">{item.title || 'Job Title'}</h3>
                          <span className="text-sm text-gray-600">{item.start_date} {item.start_date || item.end_date ? '-' : ''} {item.end_date}</span>
                        </div>
                        <div className="text-sm text-indigo-700 font-medium mb-2">{item.company || 'Company Name'}</div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {edu.length > 0 && (
                <section className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-gray-300 mb-3 pb-1">Education</h2>
                  <div className="space-y-4">
                    {edu.map((item: any, i: number) => (
                      <div key={i}>
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-gray-900">{item.institution || 'Institution Name'}</h3>
                          <span className="text-sm text-gray-600">{item.start_date} {item.start_date || item.end_date ? '-' : ''} {item.end_date}</span>
                        </div>
                        <div className="text-sm text-gray-800">{item.degree} {item.degree && item.field_of_study ? 'in' : ''} {item.field_of_study}</div>
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

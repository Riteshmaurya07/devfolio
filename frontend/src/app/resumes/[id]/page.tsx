'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Resume } from '@/types';

export default function ResumeEditorPage() {
  const params = useParams();
  const router = useRouter();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const handleSave = async () => {
    if (!resume) return;
    setSaving(true);
    try {
      await api.put(`/resumes/${resume.id}`, {
        title: resume.title,
        resume_data: resume.resume_data
      });
      toast.success('Resume saved successfully');
    } catch (err) {
      toast.error('Failed to save resume');
    } finally {
      setSaving(false);
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
          <button 
            onClick={handleSave}
            disabled={saving}
            className={`bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
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
                    value={resume.resume_data.basics?.name || ''}
                    onChange={(e) => handleBasicsChange('name', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={resume.resume_data.basics?.email || ''}
                    onChange={(e) => handleBasicsChange('email', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Professional Summary</label>
                  <textarea 
                    rows={4}
                    value={resume.resume_data.basics?.summary || ''}
                    onChange={(e) => handleBasicsChange('summary', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            </section>
            
            {/* Note: Experience and Education forms would go here */}
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-700 dark:text-indigo-300 text-sm">
              More fields (Experience, Education) can be added here dynamically.
            </div>
          </div>

          {/* Preview (Right Pane) */}
          <div className="w-full lg:w-1/2 bg-gray-200 dark:bg-gray-950 rounded-xl border border-gray-300 dark:border-gray-800 p-8 overflow-y-auto flex justify-center">
            {/* The "Paper" */}
            <div className="w-full max-w-[800px] min-h-[1056px] bg-white p-12 shadow-md">
              <header className="text-center border-b pb-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {resume.resume_data.basics?.name || 'Your Name'}
                </h1>
                <p className="text-gray-600">
                  {resume.resume_data.basics?.email || 'email@example.com'}
                </p>
              </header>
              <section className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-gray-300 mb-3 pb-1">Professional Summary</h2>
                <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                  {resume.resume_data.basics?.summary || 'Write a brief summary of your background...'}
                </p>
              </section>
            </div>
          </div>

        </div>
      </div>
    </DashboardShell>
  );
}

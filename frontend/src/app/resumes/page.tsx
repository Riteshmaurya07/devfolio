'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Resume } from '@/types';

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes');
      setResumes(res.data);
    } catch (err) {
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const createNewResume = async () => {
    setIsCreating(true);
    try {
      await api.post('/resumes', {
        title: 'Untitled Resume',
        resume_data: { 
          basics: { name: '', email: '', summary: '' },
          experience: [],
          education: []
        }
      });
      toast.success('Resume created successfully');
      fetchResumes();
    } catch (err) {
      toast.error('Failed to create resume');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <DashboardShell>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Resumes</h1>
        <button 
          onClick={createNewResume}
          disabled={isCreating}
          className={`bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition ${isCreating ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isCreating ? 'Creating...' : '+ Create New'}
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading resumes...</div>
      ) : resumes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm text-center border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-gray-500 mb-4">You haven't created any resumes yet.</p>
          <button 
            onClick={createNewResume}
            disabled={isCreating}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {isCreating ? 'Creating...' : 'Create your first resume'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map(r => (
            <Link href={`/resumes/${r.id}`} key={r.id}>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-300 transition cursor-pointer h-full flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{r.title}</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Last updated: {new Date(r.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xs font-medium px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded">
                    Version history saved
                  </span>
                  <span className="text-sm text-indigo-600 hover:underline">Edit</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}

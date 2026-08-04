'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';

export default function ResumesPage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes');
      setResumes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const createNewResume = async () => {
    try {
      await api.post('/resumes', {
        title: 'Untitled Resume',
        resume_data: { 
          basics: { name: '', email: '', summary: '' },
          experience: [],
          education: []
        }
      });
      fetchResumes();
    } catch (err) {
      console.error('Failed to create resume');
    }
  };

  return (
    <DashboardShell>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Resumes</h1>
        <button 
          onClick={createNewResume}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          + Create New
        </button>
      </div>

      {loading ? (
        <div>Loading resumes...</div>
      ) : resumes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm text-center border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-gray-500 mb-4">You haven't created any resumes yet.</p>
          <button 
            onClick={createNewResume}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Create your first resume
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map(r => (
            <div key={r.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-300 transition cursor-pointer">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{r.title}</h3>
              <p className="text-sm text-gray-500 mt-2">
                Last updated: {new Date(r.updated_at).toLocaleDateString()}
              </p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs font-medium px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded">
                  Version history saved
                </span>
                <button className="text-sm text-indigo-600 hover:underline">Edit</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}

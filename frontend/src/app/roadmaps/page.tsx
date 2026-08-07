'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Roadmap, Task } from '@/types';

export default function RoadmapsPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<Roadmap | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [goalInput, setGoalInput] = useState('');

  const fetchRoadmaps = async () => {
    try {
      const res = await api.get('/roadmaps');
      setRoadmaps(res.data);
    } catch (err) {
      toast.error('Failed to load roadmaps');
    }
  };

  const loadRoadmap = async (id: string) => {
    try {
      const res = await api.get(`/roadmaps/${id}`);
      setActiveRoadmap(res.data);
    } catch (err) {
      toast.error('Failed to load roadmap details');
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const generateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalInput.trim()) return;
    
    setIsGenerating(true);
    try {
      const res = await api.post('/roadmaps', { goal: goalInput });
      toast.success('Roadmap generated successfully');
      setShowModal(false);
      setGoalInput('');
      fetchRoadmaps();
      loadRoadmap(res.data.id);
    } catch (err) {
      toast.error('Failed to generate roadmap');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    if (!activeRoadmap) return;

    // Optimistic UI update
    const newStatus = !currentStatus;
    setActiveRoadmap((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        weeks: prev.weeks.map(week => ({
          ...week,
          tasks: week.tasks.map(task => 
            task.id === taskId ? { ...task, is_completed: newStatus } : task
          )
        }))
      };
    });

    try {
      await api.post(`/roadmaps/${activeRoadmap.id}/tasks/${taskId}/toggle`, { is_completed: newStatus });
    } catch (err) {
      toast.error('Failed to update task status');
      // Revert on failure by reloading
      loadRoadmap(activeRoadmap.id);
    }
  };

  return (
    <DashboardShell>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Learning Roadmaps</h1>
        <button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition">
          + Generate New
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-1/3 space-y-4">
          {roadmaps.length === 0 && (
            <div className="text-gray-500 text-sm text-center py-4 border rounded-xl dark:border-gray-700">
              No roadmaps generated yet.
            </div>
          )}
          {roadmaps.map(rm => (
            <div 
              key={rm.id} 
              onClick={() => loadRoadmap(rm.id)}
              className={`p-4 rounded-xl border cursor-pointer transition ${activeRoadmap?.id === rm.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300'}`}
            >
              <h3 className="font-bold text-gray-900 dark:text-white">{rm.goal}</h3>
              <p className="text-xs text-gray-500 mt-2">Generated: {new Date(rm.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="w-full md:w-2/3 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 min-h-[400px]">
          {activeRoadmap ? (
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{activeRoadmap.goal}</h2>
              <div className="space-y-6">
                {activeRoadmap.weeks.map((week) => (
                  <div key={week.id} className="border-l-2 border-indigo-200 dark:border-indigo-800 pl-4">
                    <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">Week {week.week_number}: {week.title}</h3>
                    <ul className="space-y-2">
                      {week.tasks.map((task) => (
                        <li key={task.id} className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            checked={task.is_completed}
                            onChange={() => toggleTask(task.id, task.is_completed)}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                          <span className={`${task.is_completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                            {task.description}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              Select a roadmap to view details or generate a new one.
            </div>
          )}
        </div>
      </div>

      {/* Generation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Generate Roadmap</h3>
            <form onSubmit={generateNew}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  What is your learning goal?
                </label>
                <input 
                  type="text"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  placeholder="e.g. Become a Senior Backend Engineer"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                  disabled={isGenerating}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  disabled={isGenerating}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isGenerating}
                  className={`bg-indigo-600 text-white px-4 py-2 rounded-md transition ${isGenerating ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
                >
                  {isGenerating ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

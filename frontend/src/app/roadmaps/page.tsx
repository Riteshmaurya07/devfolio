'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';

export default function RoadmapsPage() {
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<any>(null);

  const fetchRoadmaps = async () => {
    const res = await api.get('/roadmaps');
    setRoadmaps(res.data);
  };

  const loadRoadmap = async (id: string) => {
    const res = await api.get(`/roadmaps/${id}`);
    setActiveRoadmap(res.data);
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const generateNew = async () => {
    const goal = prompt("What is your learning goal? (e.g. Become a Senior Backend Engineer)");
    if (!goal) return;
    
    const res = await api.post('/roadmaps', { goal });
    fetchRoadmaps();
    loadRoadmap(res.data.id);
  };

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    await api.post(`/roadmaps/${activeRoadmap.id}/tasks/${taskId}/toggle`, { is_completed: !currentStatus });
    // Reload active roadmap to see changes
    loadRoadmap(activeRoadmap.id);
  };

  return (
    <DashboardShell>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Learning Roadmaps</h1>
        <button onClick={generateNew} className="bg-indigo-600 text-white px-4 py-2 rounded">
          + Generate New
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-1/3 space-y-4">
          {roadmaps.map(rm => (
            <div 
              key={rm.id} 
              onClick={() => loadRoadmap(rm.id)}
              className={`p-4 rounded-xl border cursor-pointer ${activeRoadmap?.id === rm.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
            >
              <h3 className="font-bold dark:text-white">{rm.goal}</h3>
              <p className="text-xs text-gray-500 mt-2">Generated: {new Date(rm.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="w-2/3 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          {activeRoadmap ? (
            <div>
              <h2 className="text-xl font-bold mb-4 dark:text-white">{activeRoadmap.goal}</h2>
              <div className="space-y-6">
                {activeRoadmap.weeks.map((week: any) => (
                  <div key={week.id} className="border-l-2 border-indigo-200 pl-4">
                    <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">Week {week.week_number}: {week.title}</h3>
                    <ul className="space-y-2">
                      {week.tasks.map((task: any) => (
                        <li key={task.id} className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            checked={task.is_completed}
                            onChange={() => toggleTask(task.id, task.is_completed)}
                            className="w-4 h-4 text-indigo-600"
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
            <div className="text-center text-gray-500">Select a roadmap to view details.</div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

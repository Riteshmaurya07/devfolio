'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { Compass, BookOpen, ChevronRight, Layers, Award } from 'lucide-react';

export default function RoadmapsBrowsePage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/roadmaps/templates');
      setTemplates(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];

  const filteredTemplates = selectedCategory === 'All'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  if (loading) {
    return <DashboardShell><div className="text-white">Loading Learning Roadmaps...</div></DashboardShell>;
  }

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto space-y-8 pb-16">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Compass className="w-8 h-8 text-indigo-400" /> Learning Roadmaps
          </h1>
          <p className="text-slate-400 text-sm mt-1">Structured career paths and skill milestones for modern software engineers.</p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(t => (
            <a
              key={t.id}
              href={`/roadmaps/${t.slug}`}
              className="group p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition flex flex-col justify-between space-y-4 shadow-xl"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {t.category}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{t.milestones?.length || 0} Milestones</span>
                </div>
                <h2 className="text-xl font-bold text-white group-hover:text-indigo-400 transition">{t.title}</h2>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{t.description}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold pt-2 border-t border-slate-800/80">
                <span>View Roadmap</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}

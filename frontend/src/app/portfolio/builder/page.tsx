'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { Sparkles, Move, Palette, Layers, Globe, Eye, Plus, Trash2 } from 'lucide-react';

const THEMES = [
  { name: 'minimal', label: 'Minimal', bg: 'bg-white text-slate-900 border-slate-200' },
  { name: 'modern', label: 'Modern', bg: 'bg-slate-900 text-white border-slate-700' },
  { name: 'glass', label: 'Glassmorphism', bg: 'bg-slate-950 text-indigo-300 border-indigo-500/30' },
  { name: 'dark', label: 'Dark Monochrome', bg: 'bg-black text-white border-zinc-800' },
  { name: 'gradient', label: 'Indigo Gradient', bg: 'bg-gradient-to-br from-indigo-950 to-slate-900 text-white border-indigo-500/40' },
  { name: 'neon', label: 'Neon Cyber', bg: 'bg-black text-emerald-400 border-emerald-500' }
];

export default function PortfolioBuilderPage() {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Config State
  const [slug, setSlug] = useState('');
  const [themeName, setThemeName] = useState('modern');
  const [primaryColor, setPrimaryColor] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);

  // GitHub Import State
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const res = await api.get('/portfolio/me');
      const data = res.data;
      setPortfolio(data);
      setSlug(data.slug);
      setThemeName(data.theme_name || 'modern');
      setPrimaryColor(data.primary_color || '');
      setIsPublished(data.is_published);
      setSeoTitle(data.seo_title || '');
      setSeoDescription(data.seo_description || '');
      setSectionOrder(data.section_order || ["about", "skills", "projects", "experience", "education", "certifications", "achievements"]);

      // Fetch user github repos for import
      try {
        const ghRes = await api.get(`/github/stats/${data.slug}`);
        setGithubRepos(ghRes.data.repositories || []);
      } catch (err) {}
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await api.put('/portfolio/me', {
        slug,
        theme_name: themeName,
        primary_color: primaryColor || null,
        is_published: isPublished,
        seo_title: seoTitle,
        seo_description: seoDescription,
        section_order: sectionOrder
      });
      setPortfolio(res.data);
      setMessage('Portfolio settings saved successfully!');
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to save portfolio settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleImportGitHub = async () => {
    if (selectedRepos.length === 0) return;
    try {
      await api.post('/portfolio/import-github', { repository_ids: selectedRepos });
      setMessage('Selected GitHub repositories imported into Projects section!');
      fetchPortfolio();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleRepoSelection = (repoId: string) => {
    setSelectedRepos(prev => 
      prev.includes(repoId) ? prev.filter(id => id !== repoId) : [...prev, repoId]
    );
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...sectionOrder];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIdx];
    newOrder[targetIdx] = temp;
    setSectionOrder(newOrder);
  };

  if (loading) {
    return <DashboardShell><div className="text-white">Loading Portfolio Builder...</div></DashboardShell>;
  }

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto space-y-8 pb-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-indigo-400" /> Portfolio Builder
            </h1>
            <p className="text-slate-400 text-sm mt-1">Configure your personal portfolio theme, sections, and custom URL.</p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`/p/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2"
            >
              <Eye className="w-4 h-4 text-indigo-400" /> Preview as Visitor
            </a>
            <button
              onClick={handleSaveConfig}
              disabled={saving}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30"
            >
              {saving ? 'Saving...' : 'Save Portfolio'}
            </button>
          </div>
        </div>

        {message && (
          <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-500/50 text-indigo-200 text-sm">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Controls Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Slug & Visibility */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400" /> Public URL & Metadata
              </h2>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Custom Slug (Unique URL)</label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-slate-800 border border-r-0 border-slate-700 rounded-l-lg text-slate-400 text-xs font-mono">
                    devfolio.com/p/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-700 text-white rounded-r-lg bg-slate-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">SEO Title</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={e => setSeoTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-700 text-white rounded-lg bg-slate-800 text-sm"
                    placeholder="John Doe — Senior Fullstack Developer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">SEO Description</label>
                  <input
                    type="text"
                    value={seoDescription}
                    onChange={e => setSeoDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-700 text-white rounded-lg bg-slate-800 text-sm"
                    placeholder="Fullstack engineer portfolio showcasing projects..."
                  />
                </div>
              </div>
            </div>

            {/* Theme Picker */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-indigo-400" /> CSS Token Theme System
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {THEMES.map(t => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => setThemeName(t.name)}
                    className={`p-4 rounded-xl border text-left transition-all ${t.bg} ${themeName === t.name ? 'ring-2 ring-indigo-500 shadow-xl scale-105' : 'opacity-70 hover:opacity-100'}`}
                  >
                    <p className="font-bold text-xs">{t.label}</p>
                    <p className="text-[10px] mt-1 opacity-70">CSS Custom Properties</p>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Custom Accent Color (Hex Code)</label>
                <input
                  type="text"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="w-48 px-3 py-2 border border-slate-700 text-white rounded-lg bg-slate-800 text-sm"
                  placeholder="#6366f1"
                />
              </div>
            </div>

            {/* Section Ordering */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" /> Reorder Portfolio Sections
              </h2>
              <p className="text-xs text-slate-400">Rearrange the order of sections as they appear on your public portfolio page.</p>

              <div className="space-y-2">
                {sectionOrder.map((section, idx) => (
                  <div key={section} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white">
                    <span className="capitalize font-medium text-sm flex items-center gap-2">
                      <Move className="w-4 h-4 text-slate-500" /> {section}
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => moveSection(idx, 'up')}
                        disabled={idx === 0}
                        className="px-2 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 rounded text-xs"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(idx, 'down')}
                        disabled={idx === sectionOrder.length - 1}
                        className="px-2 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 rounded text-xs"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* GitHub Import Column */}
          <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h2 className="text-lg font-bold text-white">Import GitHub Repos</h2>
              <p className="text-xs text-slate-400">Select synced GitHub repositories to auto-create projects with pre-filled tech stack and URLs.</p>

              {githubRepos.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No synced GitHub repositories found. Connect GitHub first.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {githubRepos.map(repo => (
                    <label key={repo.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRepos.includes(repo.id)}
                        onChange={() => toggleRepoSelection(repo.id)}
                        className="rounded border-slate-700 text-indigo-600"
                      />
                      <div className="truncate">
                        <p className="font-semibold text-white truncate">{repo.name}</p>
                        <p className="text-[10px] text-slate-400">{repo.language || 'Code'} • ★ {repo.stars_count}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleImportGitHub}
                disabled={selectedRepos.length === 0}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold rounded-xl"
              >
                Import Selected Repositories
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

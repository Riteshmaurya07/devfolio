'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { Sparkles, Move, Palette, Layers, Globe, Eye, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button, Input } from '@/components/ui';

const THEMES = [
  { name: 'minimal', label: 'Minimal Studio', desc: 'Light/Dark clean monochrome' },
  { name: 'modern', label: 'Editorial Amber', desc: 'Cream, deep black & burnt orange' },
  { name: 'glass', label: 'Translucent Glass', desc: 'Subtle frosted borders' },
  { name: 'dark', label: 'Pure Obsidian', desc: 'Deep black and silver tokens' },
  { name: 'gradient', label: 'Warm Terra', desc: 'Rich earthen tones' },
  { name: 'neon', label: 'Terminal Code', desc: 'High-contrast monospace accents' },
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
      setSlug(data.slug || '');
      setThemeName(data.theme_name || 'modern');
      setPrimaryColor(data.primary_color || '');
      setIsPublished(data.is_published ?? true);
      setSeoTitle(data.seo_title || '');
      setSeoDescription(data.seo_description || '');
      setSectionOrder(
        data.section_order || [
          'about',
          'skills',
          'projects',
          'experience',
          'education',
          'certifications',
          'achievements',
        ]
      );

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
        section_order: sectionOrder,
      });
      setPortfolio(res.data);
      setMessage('Portfolio configurations saved successfully!');
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
    setSelectedRepos((prev) =>
      prev.includes(repoId) ? prev.filter((id) => id !== repoId) : [...prev, repoId]
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

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                Portfolio CMS Builder
              </h1>
              <Badge variant="burnt" size="sm">
                Custom Domain
              </Badge>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Personalize themes, rearrange sections, import verified GitHub projects, and publish your URL.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {slug && (
              <a href={`/p/${slug}`} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="sm" leftIcon={<Eye size={13} />}>
                  Live Preview
                </Button>
              </a>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveConfig}
              isLoading={saving}
            >
              Save Changes
            </Button>
          </div>
        </div>

        {message && (
          <div className="p-3 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] flex items-center justify-between">
            <span>{message}</span>
            <button
              onClick={() => setMessage('')}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-mono"
            >
              dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Controls Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Slug & Visibility */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-[#d9541e]" />
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  Public URL & SEO Metadata
                </h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Public Portfolio URL Slug
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-[var(--surface-hover)] border border-r-0 border-[var(--border-subtle)] rounded-l-lg text-[var(--text-muted)] text-xs font-mono">
                    devfolio.com/p/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="flex-1 px-3 py-2 border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-r-lg bg-[var(--bg-canvas)] font-mono text-xs focus:outline-none focus:border-[#d9541e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="SEO Meta Title"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Ada Lovelace — Senior Backend Architect"
                />
                <Input
                  label="SEO Description"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Verified portfolio featuring distributed systems projects..."
                />
              </div>
            </Card>

            {/* Theme Picker */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Palette size={18} className="text-[#d9541e]" />
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  CSS Design Tokens
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {THEMES.map((t) => {
                  const isCurrent = themeName === t.name;
                  return (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => setThemeName(t.name)}
                      className={`p-3.5 rounded-lg border text-left transition-all duration-150 ${
                        isCurrent
                          ? 'border-[#d9541e] bg-[#d9541e]/5 ring-1 ring-[#d9541e]'
                          : 'border-[var(--border-subtle)] bg-[var(--surface-hover)] hover:border-[var(--border-strong)]'
                      }`}
                    >
                      <p className="font-bold text-xs text-[var(--text-primary)]">{t.label}</p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">{t.desc}</p>
                    </button>
                  );
                })}
              </div>

              <div>
                <Input
                  label="Custom Accent Color Hex (Optional)"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#d9541e"
                />
              </div>
            </Card>

            {/* Section Ordering */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-[#d9541e]" />
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  Section Layout Hierarchy
                </h2>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Reorder the presentation sequence of sections rendered on your public profile.
              </p>

              <div className="space-y-2">
                {sectionOrder.map((section, idx) => (
                  <div
                    key={section}
                    className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  >
                    <span className="capitalize font-semibold text-xs flex items-center gap-2">
                      <Move size={14} className="text-[var(--text-muted)]" />
                      {section}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => moveSection(idx, 'up')}
                        disabled={idx === 0}
                      >
                        <ArrowUp size={12} />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => moveSection(idx, 'down')}
                        disabled={idx === sectionOrder.length - 1}
                      >
                        <ArrowDown size={12} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* GitHub Import Column */}
          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Import GitHub Repos
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Select repositories from your connected account to auto-populate the Projects section.
              </p>

              {githubRepos.length === 0 ? (
                <div className="py-6 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-lg">
                  No synced repositories found. Ensure GitHub is connected in Profile Settings.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {githubRepos.map((repo) => (
                    <label
                      key={repo.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] cursor-pointer hover:border-[var(--border-strong)]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRepos.includes(repo.id)}
                        onChange={() => toggleRepoSelection(repo.id)}
                        className="rounded border-[var(--border-subtle)] text-[#d9541e] focus:ring-[#d9541e]"
                      />
                      <div className="truncate">
                        <p className="font-semibold text-xs text-[var(--text-primary)] truncate">
                          {repo.name}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] font-mono">
                          {repo.language || 'Code'} • ★ {repo.stars_count}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <Button
                variant="primary"
                fullWidth
                size="sm"
                onClick={handleImportGitHub}
                disabled={selectedRepos.length === 0}
              >
                Import {selectedRepos.length > 0 ? `(${selectedRepos.length})` : ''} Selected
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

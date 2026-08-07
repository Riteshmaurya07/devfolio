'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Globe, ShieldAlert, Star, GitFork, ExternalLink } from 'lucide-react';

export default function PublicPortfolioPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPortfolio();
  }, [slug]);

  const fetchPortfolio = async () => {
    try {
      const res = await api.get(`/portfolio/p/${slug}`);
      setPortfolio(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Portfolio not found or is private.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading portfolio...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="w-16 h-16 text-amber-500 mb-4" />
        <h1 className="text-3xl font-bold mb-2">{error}</h1>
        <p className="text-slate-400">The requested portfolio slug is invalid or set to unpublished.</p>
      </div>
    );
  }

  const tokens = portfolio.theme_tokens || {};

  // Inject Theme CSS Custom Properties
  const themeStyle = {
    '--bg-primary': tokens['--bg-primary'] || '#0f172a',
    '--bg-card': tokens['--bg-card'] || '#1e293b',
    '--text-primary': tokens['--text-primary'] || '#f8fafc',
    '--text-secondary': tokens['--text-secondary'] || '#94a3b8',
    '--accent-color': tokens['--accent-color'] || '#6366f1',
    '--border-color': tokens['--border-color'] || '#334155',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    minHeight: '100vh'
  } as React.CSSProperties;

  return (
    <div style={themeStyle} className="font-sans pb-24 transition-colors duration-300">
      <header className="max-w-5xl mx-auto px-6 py-12 border-b border-[var(--border-color)]">
        <h1 className="text-4xl font-extrabold tracking-tight">{portfolio.seo_title || `${slug.toUpperCase()} Portfolio`}</h1>
        <p className="text-[var(--text-secondary)] mt-2 text-base max-w-2xl">{portfolio.seo_description || 'Developer Showcase & Engineering Projects'}</p>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        {/* Render projects section */}
        {portfolio.projects && portfolio.projects.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold border-b border-[var(--border-color)] pb-3">Featured Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {portfolio.projects.map((proj: any) => (
                <div key={proj.id} style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }} className="p-6 rounded-2xl border space-y-4 shadow-xl">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold">{proj.title}</h3>
                    {proj.repo_url && (
                      <a href={proj.repo_url} target="_blank" rel="noopener noreferrer" className="text-[var(--accent-color)] hover:underline flex items-center gap-1 text-xs">
                        Repo <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{proj.description}</p>

                  {proj.tech_stack && proj.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {proj.tech_stack.map((tech: string, i: number) => (
                        <span key={i} style={{ borderColor: 'var(--border-color)', color: 'var(--accent-color)' }} className="px-2.5 py-1 rounded-md text-[10px] font-mono border bg-slate-900/40">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

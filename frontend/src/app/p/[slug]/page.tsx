'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { ShieldAlert, ExternalLink, ArrowLeft, Code2, Settings, LayoutDashboard } from 'lucide-react';
import { Badge, Button, ThemeToggle } from '@/components/ui';

export default function PublicPortfolioPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user: currentUser } = useAuthStore();

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
      setError(err.response?.data?.detail || 'Portfolio not found or set to private.');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = Boolean(
    currentUser &&
      (currentUser.username === slug ||
        currentUser.id === portfolio?.user_id ||
        currentUser.username === portfolio?.slug)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col font-sans">
        <header className="sticky top-0 z-50 h-16 bg-[var(--surface)] backdrop-blur-md border-b border-[var(--border-subtle)] px-4 sm:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#d9541e] flex items-center justify-center text-white">
              <Code2 size={16} />
            </div>
            <span className="font-bold text-base tracking-tight text-[var(--text-primary)]">
              Devfolio
            </span>
          </Link>
          <ThemeToggle />
        </header>
        <div className="flex-1 flex items-center justify-center text-xs text-[var(--text-muted)] font-mono">
          Loading developer portfolio...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col font-sans">
        <header className="sticky top-0 z-50 h-16 bg-[var(--surface)] backdrop-blur-md border-b border-[var(--border-subtle)] px-4 sm:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#d9541e] flex items-center justify-center text-white">
              <Code2 size={16} />
            </div>
            <span className="font-bold text-base tracking-tight text-[var(--text-primary)]">
              Devfolio
            </span>
          </Link>
          <ThemeToggle />
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <ShieldAlert size={40} className="text-[#d9541e] mb-3" />
          <h1 className="text-xl font-bold tracking-tight mb-1">{error}</h1>
          <p className="text-xs text-[var(--text-secondary)] mb-4">
            The requested portfolio slug is unpublished or does not exist.
          </p>
          <Link href="/">
            <Button variant="secondary" size="sm" leftIcon={<ArrowLeft size={13} />}>
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const tokens = portfolio.theme_tokens || {};

  const themeStyle = {
    '--bg-primary': tokens['--bg-primary'] || 'var(--bg-canvas)',
    '--bg-card': tokens['--bg-card'] || 'var(--surface)',
    '--text-primary': tokens['--text-primary'] || 'var(--text-primary)',
    '--text-secondary': tokens['--text-secondary'] || 'var(--text-secondary)',
    '--accent-color': tokens['--accent-color'] || '#d9541e',
    '--border-color': tokens['--border-color'] || 'var(--border-subtle)',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    minHeight: '100vh',
  } as React.CSSProperties;

  return (
    <div style={themeStyle} className="font-sans pb-24 transition-colors duration-200">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 h-16 bg-[var(--surface)] backdrop-blur-md border-b border-[var(--border-subtle)] px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={currentUser ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#d9541e] flex items-center justify-center text-white transition-transform group-hover:scale-105">
              <Code2 size={16} />
            </div>
            <span className="font-bold text-base tracking-tight text-[var(--text-primary)]">
              Devfolio <span className="text-[#d9541e]">OS</span>
            </span>
          </Link>
          {currentUser && (
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[#d9541e] transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Dashboard</span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {currentUser ? (
            <>
              {isOwner && (
                <Link href="/portfolio/builder">
                  <Button variant="primary" size="sm" leftIcon={<Settings size={13} />}>
                    <span>Edit Portfolio</span>
                  </Button>
                </Link>
              )}
              <Link href="/dashboard">
                <Button variant="secondary" size="sm" leftIcon={<LayoutDashboard size={13} />}>
                  <span>Dashboard</span>
                </Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Portfolio Header */}
      <div className="max-w-5xl mx-auto px-6 py-12 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-[#d9541e]" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">
            Verified Developer Portfolio
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          {portfolio.seo_title || `${slug.toUpperCase()} Portfolio`}
        </h1>
        <p className="text-[var(--text-secondary)] mt-2 text-xs max-w-2xl leading-relaxed">
          {portfolio.seo_description || 'Engineering portfolio, system architectures, and verified contributions.'}
        </p>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        {portfolio.projects && portfolio.projects.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-lg font-bold border-b border-[var(--border-color)] pb-3">
              Featured Systems & Repositories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {portfolio.projects.map((proj: any) => (
                <div
                  key={proj.id}
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                  className="p-6 rounded-lg border space-y-3 shadow-sm hover:border-[var(--accent-color)] transition-all"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">{proj.title}</h3>
                    {proj.repo_url && (
                      <a
                        href={proj.repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#d9541e] hover:underline flex items-center gap-1 text-xs font-semibold"
                      >
                        Code <ExternalLink size={12} />
                      </a>
                    )}
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {proj.description}
                  </p>

                  {proj.tech_stack && proj.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {proj.tech_stack.map((tech: string, i: number) => (
                        <span
                          key={i}
                          style={{ borderColor: 'var(--border-color)' }}
                          className="px-2 py-0.5 rounded text-[10px] font-mono border bg-[var(--surface-hover)] text-[var(--text-primary)]"
                        >
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

      <footer className="max-w-5xl mx-auto px-6 pt-12 border-t border-[var(--border-color)] text-center text-xs text-[var(--text-secondary)]">
        Powered by Devfolio Engineering Telemetry OS
      </footer>
    </div>
  );
}

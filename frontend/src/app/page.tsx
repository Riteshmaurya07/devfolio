'use client';

import React from 'react';
import Link from 'next/link';
import {
  Code2,
  ArrowRight,
  Sparkles,
  Trophy,
  FileText,
  Globe,
  Compass,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { Button, Badge, Card, ThemeToggle } from '@/components/ui';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-200">
      {/* Editorial Top Navigation */}
      <header className="border-b border-[var(--border-subtle)] bg-[var(--surface)]/90 backdrop-blur-md sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#d9541e] text-white flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-105">
              <Code2 size={18} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-[var(--text-primary)] leading-tight">
                Devfolio
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)]">
                Developer OS
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight size={14} />}>
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#d9541e]/30 bg-[#d9541e]/10 text-[#d9541e] text-xs font-semibold mb-6">
            <Sparkles size={13} />
            <span>Built for Modern Software Engineers</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] max-w-4xl mx-auto leading-tight">
            Your engineering trajectory,{' '}
            <span className="text-[#d9541e]">unified & visualized.</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Synchronize coding stats across LeetCode, Codeforces, CodeChef & GitHub. Craft verified AI roadmaps, build interactive developer portfolios, and track career progress with calm clarity.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight size={16} />}>
                Claim Your Developer Profile
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary" size="lg">
                Explore Dashboard
              </Button>
            </Link>
          </div>

          {/* Interactive Metric Preview Banner */}
          <div className="mt-14 p-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] text-left shadow-sm max-w-4xl mx-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d9541e]" />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Live Dashboard Telemetry
                </span>
              </div>
              <Badge variant="success" size="sm">Active Sync</Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-md bg-[var(--surface-hover)] border border-[var(--border-subtle)]">
                <div className="text-[11px] font-semibold uppercase text-[var(--text-muted)]">Total Solved</div>
                <div className="text-xl font-bold font-mono text-[var(--text-primary)] mt-1">1,482</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">4 Platforms Synced</div>
              </div>

              <div className="p-3.5 rounded-md bg-[var(--surface-hover)] border border-[var(--border-subtle)]">
                <div className="text-[11px] font-semibold uppercase text-[var(--text-muted)]">GitHub Repos</div>
                <div className="text-xl font-bold font-mono text-[var(--text-primary)] mt-1">34</div>
                <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">★ 280 Stars Total</div>
              </div>

              <div className="p-3.5 rounded-md bg-[var(--surface-hover)] border border-[var(--border-subtle)]">
                <div className="text-[11px] font-semibold uppercase text-[var(--text-muted)]">Developer Score</div>
                <div className="text-xl font-bold font-mono text-[#d9541e] mt-1">1,890</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Top 5% Globally</div>
              </div>

              <div className="p-3.5 rounded-md bg-[var(--surface-hover)] border border-[var(--border-subtle)]">
                <div className="text-[11px] font-semibold uppercase text-[var(--text-muted)]">Active Roadmaps</div>
                <div className="text-xl font-bold font-mono text-[var(--text-primary)] mt-1">3 Tracks</div>
                <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">78% Milestone Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Pillars Feature Grid */}
        <section className="max-w-6xl mx-auto px-6 py-16 border-t border-[var(--border-subtle)]">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Architected for Engineering Discipline
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Every tool you need to substantiate your engineering capability, free from clutter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#d9541e]/10 text-[#d9541e] flex items-center justify-center font-bold">
                <Globe size={20} />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Automated Platform Sync
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Background workers periodically fetch and verify contest ratings, solved problems, and submission records across LeetCode, CodeChef, Codeforces, and GeeksforGeeks.
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#d9541e]/10 text-[#d9541e] flex items-center justify-center font-bold">
                <Compass size={20} />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Curated Skill Roadmaps
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Step-by-step milestones spanning Backend Systems, Distributed Architecture, Full Stack, and System Design with bookmarking and progress tracking.
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#d9541e]/10 text-[#d9541e] flex items-center justify-center font-bold">
                <Trophy size={20} />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Global Normalized Leaderboard
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Fair, transparent developer rankings powered by our weighted scoring model combining solved problem difficulty, GitHub activity, and roadmap completions.
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#d9541e]/10 text-[#d9541e] flex items-center justify-center font-bold">
                <FileText size={20} />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Smart Resume Builder
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Version-controlled JSON resume builder with drag-and-drop section ordering, ATS-friendly typography, and one-click PDF generation.
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#d9541e]/10 text-[#d9541e] flex items-center justify-center font-bold">
                <TrendingUp size={20} />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Job Application Tracker
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Clean Kanban pipeline to track wishlist, applications, technical interviews, offers, and follow-ups with salary and timeline metadata.
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#d9541e]/10 text-[#d9541e] flex items-center justify-center font-bold">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Verified Public Portfolios
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Shareable custom URL showcasing your verified achievements, pinned repositories, skills graph, and coding journey without third-party fluff.
              </p>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-8 bg-[var(--surface)] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)]">Devfolio</span>
            <span>—</span>
            <span>Calm developer telemetry & career operations.</span>
          </div>
          <div>© {new Date().getFullYear()} Devfolio. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

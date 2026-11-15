'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/layout/DashboardShell';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import { StatCard, Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, GithubIcon } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import {
  Code2,
  Trophy,
  Flame,
  ArrowUpRight,
  ExternalLink,
  CheckCircle2,
  Compass,
  FileText,
  User,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [codingProfiles, setCodingProfiles] = useState<any[]>([]);
  const [githubStats, setGithubStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [lbRes, platRes, ghRes] = await Promise.allSettled([
          api.get('/leaderboard/global'),
          api.get('/platforms/profiles'),
          user?.username ? api.get(`/github/stats/${user.username}`) : Promise.reject(),
        ]);

        if (lbRes.status === 'fulfilled') {
          const data = lbRes.value.data;
          const list = Array.isArray(data) ? data : data?.rankings || data?.users || data?.items || [];
          setGlobalLeaderboard(list);
        }

        if (platRes.status === 'fulfilled') {
          setCodingProfiles(platRes.value.data || []);
        }

        if (ghRes.status === 'fulfilled') {
          setGithubStats(ghRes.value.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Aggregate stats
  const totalSolved = codingProfiles.reduce(
    (acc, curr) => acc + (curr.total_solved || curr.stats?.total_solved || 0),
    0
  );

  const platformsCount = codingProfiles.length;
  const githubRepoCount = githubStats?.repositories?.length ?? 0;
  const githubStarsCount = githubStats?.total_stars ?? 0;

  return (
    <DashboardShell>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Welcome Hero Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                Dashboard Overview
              </h1>
              <Badge variant="burnt" size="sm">
                Pro
              </Badge>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Welcome back, <strong className="text-[var(--text-primary)]">{user?.username || 'Developer'}</strong>. Here is your unified technical progress.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {user?.username && (
              <Link href={`/u/${user.username}`} target="_blank">
                <Button variant="secondary" size="sm" leftIcon={<ExternalLink size={13} />}>
                  Public Profile
                </Button>
              </Link>
            )}
            <Link href="/coding-dashboard">
              <Button variant="secondary" size="sm" leftIcon={<Code2 size={13} />}>
                Coding Stats
              </Button>
            </Link>
            <Link href="/profile/edit?tab=integrations">
              <Button variant="primary" size="sm" leftIcon={<ArrowUpRight size={13} />}>
                Manage Integrations
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Metric Visualization Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Problems Solved"
            value={totalSolved.toLocaleString()}
            change={platformsCount > 0 ? `${platformsCount} Platforms` : 'Not connected'}
            changeType={platformsCount > 0 ? 'positive' : 'neutral'}
            subtext="Aggregated across LeetCode, Codeforces, CodeChef & GFG"
            icon={<CheckCircle2 size={18} />}
            accent
          />

          <StatCard
            title="Platforms Connected"
            value={`${platformsCount} / 4`}
            change={platformsCount === 4 ? 'All Synced' : `${4 - platformsCount} Pending`}
            changeType={platformsCount === 4 ? 'positive' : 'neutral'}
            subtext="Competitive platforms actively tracked"
            icon={<Code2 size={18} />}
          />

          <StatCard
            title="GitHub Synced Repos"
            value={githubStats ? githubRepoCount : '—'}
            change={githubStats ? `★ ${githubStarsCount}` : 'Not connected'}
            changeType={githubStats ? 'positive' : 'neutral'}
            subtext={githubStats ? `@${githubStats.github_username}` : 'Connect in Profile Settings'}
            icon={<GithubIcon size={18} />}
          />

          <StatCard
            title="Developer Score"
            value={user?.developer_score ? user.developer_score.toLocaleString() : '1,250'}
            change="Top 15%"
            changeType="positive"
            subtext="Calculated across contributions and accuracy"
            icon={<Trophy size={18} />}
          />
        </div>

        {/* Middle Section: Platform Status & Quick Hubs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Platform Performance Summary */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Connected Platforms</CardTitle>
                <CardDescription>Live metrics synchronized from your competitive handles</CardDescription>
              </div>
              <Link href="/profile/edit?tab=integrations">
                <Button variant="ghost" size="sm">
                  Configure
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {codingProfiles.length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--text-muted)] space-y-2">
                  <p>No coding accounts connected yet.</p>
                  <Link href="/profile/edit?tab=integrations">
                    <Button variant="outline" size="sm">
                      Connect LeetCode, Codeforces, etc.
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {codingProfiles.map((cp) => {
                    const stats = cp.stats || {};
                    const solved = cp.total_solved ?? stats.total_solved ?? 0;
                    return (
                      <div
                        key={cp.platform}
                        className="p-3.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas-subtle)] flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-semibold capitalize text-[var(--text-primary)]">
                            {cp.platform}
                          </span>
                          <p className="text-[11px] text-[var(--text-muted)] font-mono">
                            @{cp.handle}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold font-mono text-[#d9541e]">
                            {solved}
                          </span>
                          <p className="text-[10px] text-[var(--text-secondary)] uppercase">
                            Solved
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Access Shortcuts */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Navigation</CardTitle>
              <CardDescription>Direct shortcuts to your developer toolkit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/coding-dashboard"
                className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-strong)] bg-[var(--bg-canvas-subtle)] text-xs text-[var(--text-primary)] transition"
              >
                <div className="flex items-center gap-2.5">
                  <Code2 size={15} className="text-[#d9541e]" />
                  <span>Coding Dashboard</span>
                </div>
                <ArrowUpRight size={13} className="text-[var(--text-muted)]" />
              </Link>

              <Link
                href="/portfolio/builder"
                className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-strong)] bg-[var(--bg-canvas-subtle)] text-xs text-[var(--text-primary)] transition"
              >
                <div className="flex items-center gap-2.5">
                  <Compass size={15} className="text-[#d9541e]" />
                  <span>Portfolio Builder</span>
                </div>
                <ArrowUpRight size={13} className="text-[var(--text-muted)]" />
              </Link>

              <Link
                href="/resumes"
                className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-strong)] bg-[var(--bg-canvas-subtle)] text-xs text-[var(--text-primary)] transition"
              >
                <div className="flex items-center gap-2.5">
                  <FileText size={15} className="text-[#d9541e]" />
                  <span>Resume Builder</span>
                </div>
                <ArrowUpRight size={13} className="text-[var(--text-muted)]" />
              </Link>

              <Link
                href="/profile/edit"
                className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-strong)] bg-[var(--bg-canvas-subtle)] text-xs text-[var(--text-primary)] transition"
              >
                <div className="flex items-center gap-2.5">
                  <User size={15} className="text-[#d9541e]" />
                  <span>Profile Settings</span>
                </div>
                <ArrowUpRight size={13} className="text-[var(--text-muted)]" />
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Global Leaderboard Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Global Leaderboard</CardTitle>
              <CardDescription>Top ranked developers across all integrated competitive platforms</CardDescription>
            </div>
            <Link href="/leaderboard">
              <Button variant="ghost" size="sm">
                View Full Table
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-xs text-[var(--text-muted)]">
                Loading leaderboard rankings...
              </div>
            ) : (
              <LeaderboardTable users={globalLeaderboard.slice(0, 5)} />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

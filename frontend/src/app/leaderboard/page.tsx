'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { Trophy, Award, Star, Layers, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button, Modal, StatCard } from '@/components/ui';

export default function LeaderboardPage() {
  const [rankings, setRankings] = useState<any[]>([]);
  const [myRank, setMyRank] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBreakdown, setSelectedBreakdown] = useState<any>(null);

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      const [rankRes, myRes, badgeRes] = await Promise.allSettled([
        api.get('/leaderboard/global'),
        api.get('/leaderboard/me'),
        api.get('/leaderboard/badges'),
      ]);

      if (rankRes.status === 'fulfilled') {
        const data = rankRes.value.data;
        const list = Array.isArray(data) ? data : data?.rankings || data?.users || [];
        setRankings(list);
      }
      if (myRes.status === 'fulfilled') {
        setMyRank(myRes.value.data);
      }
      if (badgeRes.status === 'fulfilled') {
        setBadges(badgeRes.value.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                Global Developer Leaderboard
              </h1>
              <Badge variant="burnt" size="sm">
                Normalized Rank
              </Badge>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Transparent multi-factor scoring: Coding (35%), Contributions (25%), Roadmaps (20%), and Portfolio (20%).
            </p>
          </div>
        </div>

        {/* User's Own Standing Cards */}
        {myRank && myRank.rank > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Your Global Standing"
              value={`#${myRank.rank}`}
              change={myRank.rank <= 10 ? 'Top Tier' : 'Ranked'}
              changeType="positive"
              subtext="Updated periodically via background worker"
              accent
              icon={<Trophy size={18} />}
            />
            <StatCard
              title="Aggregate Score"
              value={myRank.total_score || 0}
              change="+12 pts this week"
              changeType="positive"
              subtext="Normalized out of 2,000 maximum points"
              icon={<Award size={18} />}
            />
            <StatCard
              title="Badges Acquired"
              value={badges.length}
              subtext="Skill milestones & challenges unlocked"
              icon={<Star size={18} />}
            />
          </div>
        )}

        {/* Global Rankings Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Global Rankings</CardTitle>
                <CardDescription>
                  Verified rankings across all registered developers on Devfolio
                </CardDescription>
              </div>
              <Badge variant="neutral" size="sm">
                {rankings.length} Developers Ranked
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--surface-hover)] border-y border-[var(--border-subtle)] text-[var(--text-muted)] text-[11px] uppercase font-mono tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Developer</th>
                    <th className="py-3 px-4 font-mono">Total Score</th>
                    <th className="py-3 px-4">Coding (35%)</th>
                    <th className="py-3 px-4">Contrib (25%)</th>
                    <th className="py-3 px-4">Roadmap (20%)</th>
                    <th className="py-3 px-4">Portfolio (20%)</th>
                    <th className="py-3 px-4 text-right">Breakdown</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-secondary)]">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-xs text-[var(--text-muted)]">
                        Loading verified leaderboard...
                      </td>
                    </tr>
                  ) : rankings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-xs text-[var(--text-muted)]">
                        No ranked developers yet. The calculation engine will index profiles shortly.
                      </td>
                    </tr>
                  ) : (
                    rankings.map((entry, idx) => {
                      const isTop3 = entry.rank <= 3;
                      return (
                        <tr
                          key={entry.id || idx}
                          className="hover:bg-[var(--surface-hover)] transition-colors duration-150"
                        >
                          <td className="py-3.5 px-4 font-bold text-[var(--text-primary)]">
                            {isTop3 ? (
                              <Badge
                                variant={entry.rank === 1 ? 'burnt' : 'primary'}
                                size="sm"
                              >
                                #{entry.rank}
                              </Badge>
                            ) : (
                              <span className="font-mono text-xs">#{entry.rank}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)]">
                            {entry.profile_name || entry.username || 'Developer'}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-[#d9541e]">
                            {entry.total_score}
                          </td>
                          <td className="py-3.5 px-4 font-mono">{entry.coding_score ?? 0}</td>
                          <td className="py-3.5 px-4 font-mono">{entry.contribution_score ?? 0}</td>
                          <td className="py-3.5 px-4 font-mono">{entry.roadmap_score ?? 0}</td>
                          <td className="py-3.5 px-4 font-mono">{entry.portfolio_score ?? 0}</td>
                          <td className="py-3.5 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedBreakdown(entry.score_breakdown || entry)}
                              leftIcon={<Layers size={13} />}
                            >
                              Inspect
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Badges Showcase Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award size={18} className="text-[#d9541e]" />
              Awarded Badges Showcase
            </CardTitle>
            <CardDescription>
              Milestones and achievement medals earned through consistent engineering performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {badges.length === 0 ? (
              <div className="py-6 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-lg">
                No badges awarded yet. Complete milestones on learning roadmaps to unlock medals.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {badges.map((b: any) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-subtle)] flex items-center gap-3.5"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#d9541e]/15 text-[#d9541e] flex items-center justify-center font-bold">
                      <Star size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--text-primary)] text-xs">
                        {b.badge?.title || 'Achievement Unlocked'}
                      </h4>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                        {b.badge?.description || 'Milestone verified by engine'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Modal */}
      <Modal
        isOpen={!!selectedBreakdown}
        onClose={() => setSelectedBreakdown(null)}
        title="Score Breakdown Telemetry"
      >
        <div className="space-y-4">
          <p className="text-xs text-[var(--text-secondary)]">
            Detailed parameter weights applied to compute this developer ranking:
          </p>
          <pre className="p-4 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-primary)] overflow-x-auto max-h-60">
            {JSON.stringify(selectedBreakdown, null, 2)}
          </pre>
          <div className="flex justify-end pt-2">
            <Button variant="secondary" size="sm" onClick={() => setSelectedBreakdown(null)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}

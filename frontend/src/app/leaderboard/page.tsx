'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { Trophy, Award, Star, Code, GitCommit, Map, UserCheck, Layers } from 'lucide-react';

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
        api.get('/leaderboard/badges')
      ]);

      if (rankRes.status === 'fulfilled') {
        setRankings(rankRes.value.data.rankings || rankRes.value.data || []);
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

  if (loading) {
    return <DashboardShell><div className="text-white">Loading Leaderboard...</div></DashboardShell>;
  }

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <Trophy className="w-8 h-8 text-amber-400" /> Global Developer Leaderboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">Normalized scoring engine combining coding stats, GitHub contributions, roadmaps, and portfolio analytics.</p>
          </div>

          {myRank && myRank.rank > 0 && (
            <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 flex items-center gap-4">
              <div>
                <span className="text-[10px] text-indigo-300 font-semibold uppercase tracking-wider">Your Rank</span>
                <p className="text-2xl font-extrabold text-white">#{myRank.rank}</p>
              </div>
              <div className="h-8 w-px bg-indigo-800" />
              <div>
                <span className="text-[10px] text-indigo-300 font-semibold uppercase tracking-wider">Total Score</span>
                <p className="text-2xl font-extrabold text-amber-400">{myRank.total_score}</p>
              </div>
            </div>
          )}
        </div>

        {/* Global Rankings Table */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white">Global Developer Rankings</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Developer</th>
                  <th className="p-3">Total Score</th>
                  <th className="p-3">Coding (35%)</th>
                  <th className="p-3">Contrib (25%)</th>
                  <th className="p-3">Roadmap (20%)</th>
                  <th className="p-3">Portfolio (20%)</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {rankings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-500">No ranked developers yet. Scheduled recomputation will run periodically.</td>
                  </tr>
                ) : (
                  rankings.map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-extrabold text-white">#{entry.rank}</td>
                      <td className="p-3 font-semibold text-indigo-300">{entry.profile_name || 'Developer'}</td>
                      <td className="p-3 font-bold text-amber-400">{entry.total_score}</td>
                      <td className="p-3 text-slate-300">{entry.coding_score}</td>
                      <td className="p-3 text-slate-300">{entry.contribution_score}</td>
                      <td className="p-3 text-slate-300">{entry.roadmap_score}</td>
                      <td className="p-3 text-slate-300">{entry.portfolio_score}</td>
                      <td className="p-3">
                        <button
                          onClick={() => setSelectedBreakdown(entry.score_breakdown)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center gap-1"
                        >
                          <Layers className="w-3 h-3" /> Breakdown
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Badges Showcase Grid */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" /> Awarded Badges Showcase
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {badges.length === 0 ? (
              <p className="text-xs text-slate-400 col-span-3">No badges awarded yet. Complete roadmaps or solve problems to earn badges!</p>
            ) : (
              badges.map((b: any) => (
                <div key={b.id} className="p-4 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xs">{b.badge?.title || 'Badge'}</h3>
                    <p className="text-[10px] text-slate-400">{b.badge?.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

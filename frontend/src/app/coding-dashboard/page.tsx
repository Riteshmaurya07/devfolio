'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import ContributionHeatmap from '@/components/github/ContributionHeatmap';
import { Code, RefreshCw, Plus, Sparkles, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export default function CodingDashboardPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  // Form State
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [platform, setPlatform] = useState('codeforces');
  const [username, setUsername] = useState('');

  // AI Recommendation
  const [aiRec, setAiRec] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const profRes = await api.get('/platforms/profiles');
      setProfiles(profRes.data);

      const sumRes = await api.get('/platforms/dashboard/me');
      setSummary(sumRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnecting(true);
    setMessage('');
    try {
      await api.post('/platforms/connect', { platform, external_username: username });
      setMessage(`Successfully connected ${platform} account '@${username}'!`);
      setShowConnectModal(false);
      setUsername('');
      fetchDashboardData();
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to connect platform username.');
    } finally {
      setConnecting(false);
    }
  };

  const handleManualSync = async (platformName: string) => {
    setSyncing(platformName);
    setMessage('');
    try {
      await api.post(`/platforms/${platformName}/sync`);
      setMessage(`Sync triggered for ${platformName}!`);
      fetchDashboardData();
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Sync failed or on cooldown.');
    } finally {
      setSyncing(null);
    }
  };

  const handleFetchAiRec = async () => {
    setLoadingAi(true);
    try {
      const res = await api.post('/platforms/recommendations');
      setAiRec(res.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  };

  if (loading) {
    return <DashboardShell><div className="text-white">Loading Coding Dashboard...</div></DashboardShell>;
  }

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <Code className="w-8 h-8 text-indigo-400" /> Competitive Coding Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">Multi-platform problem solving stats, topic weakness analysis, and practice recommendations.</p>
          </div>

          <button
            onClick={() => setShowConnectModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" /> Connect Platform
          </button>
        </div>

        {message && (
          <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-500/50 text-indigo-200 text-sm">
            {message}
          </div>
        )}

        {/* Connected Platforms Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {['codeforces', 'leetcode', 'codechef', 'geeksforgeeks'].map(plat => {
            const connected = profiles.find(p => p.platform === plat);

            return (
              <div key={plat} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="capitalize font-bold text-white text-sm">{plat}</span>
                  {connected ? (
                    connected.sync_status === 'ok' ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> OK
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Stale
                      </span>
                    )
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">Not Connected</span>
                  )}
                </div>

                {connected ? (
                  <div className="space-y-1">
                    <p className="text-base font-extrabold text-indigo-400">@{connected.external_username}</p>
                    <p className="text-[10px] text-slate-400">
                      {connected.last_synced_at ? `Synced ${new Date(connected.last_synced_at).toLocaleTimeString()}` : 'Showing cached data'}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Connect account to track problem solves.</p>
                )}

                {connected && (
                  <button
                    onClick={() => handleManualSync(plat)}
                    disabled={syncing === plat}
                    className="w-full mt-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className={`w-3 h-3 ${syncing === plat ? 'animate-spin' : ''}`} /> Sync Now
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Aggregate Activity Heatmap */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white">Aggregated Submission Heatmap</h2>
          <ContributionHeatmap data={{}} title="Aggregated Submission Heatmap" />
        </div>

        {/* Topic Analysis & Weak Area Detection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" /> Detected Weak Topics (&lt;50% Solve Ratio)
            </h2>

            {summary?.weak_areas && summary.weak_areas.length > 0 ? (
              <div className="space-y-3">
                {summary.weak_areas.map((w: any) => (
                  <div key={w.topic} className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">{w.topic}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{w.solved} Solved / {w.attempts} Attempts</p>
                    </div>
                    <span className={`px-2 py-1 rounded font-mono font-bold ${w.severity === 'high' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                      {(w.solve_ratio * 100).toFixed(0)}% Ratio
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No major topic weaknesses detected with 5+ attempt sample sizes.</p>
            )}
          </div>

          {/* AI Practice Guidance Drawer */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" /> AI Recommended Practice
              </h2>
              <button
                onClick={handleFetchAiRec}
                disabled={loadingAi}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
              >
                {loadingAi ? 'Analyzing...' : 'Get Recommendations'}
              </button>
            </div>

            {aiRec ? (
              <div className="space-y-3 text-xs text-indigo-200">
                <p className="leading-relaxed bg-indigo-950/60 p-3 rounded-xl border border-indigo-500/40">{aiRec.advice}</p>
                {aiRec.suggested_problems && (
                  <div className="space-y-1.5 pt-1">
                    <p className="font-semibold text-white">Suggested Problems:</p>
                    {aiRec.suggested_problems.map((prob: string, i: number) => (
                      <div key={i} className="p-2 rounded bg-slate-800 border border-slate-700 text-slate-300">
                        {prob}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Click to get tailored problem recommendations based on your weak areas.</p>
            )}
          </div>
        </div>

        {/* Connect Modal */}
        {showConnectModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4">
              <h2 className="text-lg font-bold text-white">Connect Coding Platform</h2>
              <form onSubmit={handleConnect} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Platform</label>
                  <select
                    value={platform}
                    onChange={e => setPlatform(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-700 text-white rounded-lg bg-slate-800 text-xs"
                  >
                    <option value="codeforces">Codeforces</option>
                    <option value="leetcode">LeetCode</option>
                    <option value="codechef">CodeChef</option>
                    <option value="geeksforgeeks">GeeksforGeeks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">External Handle / Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="e.g. tourist"
                    className="w-full px-3 py-2 border border-slate-700 text-white rounded-lg bg-slate-800 text-xs text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConnectModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={connecting}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
                  >
                    {connecting ? 'Verifying...' : 'Verify & Connect'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

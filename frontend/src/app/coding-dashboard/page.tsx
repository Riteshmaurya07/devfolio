'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import ContributionHeatmap from '@/components/github/ContributionHeatmap';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Modal,
  Input,
  Select,
} from '@/components/ui';
import {
  Code,
  RefreshCw,
  Plus,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

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
      setProfiles(profRes.data || []);

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
    return (
      <DashboardShell>
        <div className="p-8 text-center text-xs text-[var(--text-muted)]">
          Loading Competitive Coding Dashboard...
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#d9541e]/15 border border-[#d9541e]/30 text-[#d9541e] flex items-center justify-center">
                <Code size={18} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                Competitive Coding Dashboard
              </h1>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xl">
              Multi-platform problem solving metrics, weak area diagnosis, and AI-guided practice recommendations.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowConnectModal(true)}
            leftIcon={<Plus size={14} />}
          >
            Connect Platform
          </Button>
        </div>

        {message && (
          <div className="p-3.5 rounded-lg bg-[#d9541e]/10 border border-[#d9541e]/25 text-xs text-[#d9541e] font-medium flex items-center justify-between">
            <span>{message}</span>
            <button
              onClick={() => setMessage('')}
              className="text-xs underline hover:opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Connected Platforms Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {['codeforces', 'leetcode', 'codechef', 'geeksforgeeks'].map((plat) => {
            const connected = profiles.find((p) => p.platform === plat);

            return (
              <Card
                key={plat}
                className="p-5 flex flex-col justify-between space-y-4 hover:border-[var(--border-strong)] transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="capitalize font-bold text-xs tracking-wider text-[var(--text-primary)]">
                    {plat}
                  </span>
                  {connected ? (
                    connected.sync_status === 'ok' ? (
                      <Badge variant="success" size="sm">
                        <CheckCircle2 size={11} className="mr-0.5" /> OK
                      </Badge>
                    ) : (
                      <Badge variant="warning" size="sm">
                        <AlertTriangle size={11} className="mr-0.5" /> Stale
                      </Badge>
                    )
                  ) : (
                    <Badge variant="neutral" size="sm">
                      Unlinked
                    </Badge>
                  )}
                </div>

                {connected ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-bold text-[#d9541e] font-mono">
                        @{connected.external_username}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                        {connected.last_synced_at
                          ? `Synced ${new Date(connected.last_synced_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          : 'Showing cached data'}
                      </p>
                    </div>

                    {connected.stats?.total_solved !== undefined && (
                      <div className="pt-2 border-t border-[var(--border-subtle)] space-y-1">
                        <div className="text-xl font-bold text-[var(--text-primary)] font-mono">
                          {connected.stats.total_solved}{' '}
                          <span className="text-xs font-normal text-[var(--text-muted)] font-sans">
                            Solved
                          </span>
                        </div>

                        {connected.platform === 'leetcode' && (
                          <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)] font-mono">
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{connected.stats.easy_solved || 0}E</span> •
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">{connected.stats.medium_solved || 0}M</span> •
                            <span className="text-rose-600 dark:text-rose-400 font-semibold">{connected.stats.hard_solved || 0}H</span>
                            {connected.stats.ranking > 0 && (
                              <span className="ml-auto text-[var(--text-muted)] font-mono">#{connected.stats.ranking.toLocaleString()}</span>
                            )}
                          </div>
                        )}

                        {connected.platform === 'codeforces' && connected.stats.rating !== undefined && (
                          <div className="text-xs text-[var(--text-secondary)]">
                            Rating: <strong className="text-[var(--text-primary)] font-mono">{connected.stats.rating}</strong> ({connected.stats.rank})
                          </div>
                        )}

                        {connected.platform === 'codechef' && connected.stats.current_rating !== undefined && (
                          <div className="text-xs text-[var(--text-secondary)]">
                            Rating: <strong className="text-[var(--text-primary)] font-mono">{connected.stats.current_rating}</strong> ({connected.stats.stars || '1★'})
                          </div>
                        )}

                        {connected.platform === 'geeksforgeeks' && connected.stats.coding_score !== undefined && (
                          <div className="text-xs text-[var(--text-secondary)]">
                            Score: <strong className="text-[var(--text-primary)] font-mono">{connected.stats.coding_score}</strong>
                            {connected.stats.institute_rank && (
                              <span className="text-[var(--text-muted)] ml-1">({connected.stats.institute_rank})</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--text-muted)] py-2">
                    Connect account to monitor problem solves.
                  </p>
                )}

                {connected && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleManualSync(plat)}
                    isLoading={syncing === plat}
                    leftIcon={<RefreshCw size={12} />}
                    className="w-full mt-2"
                  >
                    Sync Now
                  </Button>
                )}
              </Card>
            );
          })}
        </div>

        {/* Aggregate Activity Heatmap */}
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle>Aggregated Submission Heatmap</CardTitle>
            <CardDescription>
              Combined daily problem activity from all connected competitive coding profiles
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ContributionHeatmap
              data={summary?.submission_calendar || {}}
              title="Activity Heatmap"
            />
          </CardContent>
        </Card>

        {/* Topic Analysis & AI Guidance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weak Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-500" />
                Detected Topic Weaknesses
              </CardTitle>
              <CardDescription>
                Topics with &lt;50% solve ratio needing focused attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summary?.weak_areas && summary.weak_areas.length > 0 ? (
                <div className="space-y-2.5">
                  {summary.weak_areas.map((w: any) => (
                    <div
                      key={w.topic}
                      className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas-subtle)] flex justify-between items-center text-xs"
                    >
                      <div>
                        <p className="font-semibold text-[var(--text-primary)]">{w.topic}</p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                          {w.solved} Solved / {w.attempts} Attempts
                        </p>
                      </div>
                      <Badge
                        variant={w.severity === 'high' ? 'danger' : 'warning'}
                        size="sm"
                      >
                        {(w.solve_ratio * 100).toFixed(0)}% Ratio
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)] py-4 text-center">
                  No critical topic weaknesses detected. Keep up the consistent practice!
                </p>
              )}
            </CardContent>
          </Card>

          {/* AI Guidance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#d9541e]" />
                  AI Recommended Practice
                </CardTitle>
                <CardDescription>Targeted advice based on your weak patterns</CardDescription>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleFetchAiRec}
                isLoading={loadingAi}
              >
                Analyze
              </Button>
            </CardHeader>
            <CardContent>
              {aiRec ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg border border-[#d9541e]/25 bg-[#d9541e]/5 text-[var(--text-secondary)] leading-relaxed">
                    {aiRec.advice}
                  </div>
                  {aiRec.suggested_problems && (
                    <div className="space-y-1.5 pt-1">
                      <p className="font-semibold text-xs text-[var(--text-primary)]">
                        Suggested Problems:
                      </p>
                      {aiRec.suggested_problems.map((prob: string, i: number) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas-subtle)] text-[var(--text-secondary)]"
                        >
                          {prob}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)] py-6 text-center">
                  Click &apos;Analyze&apos; to receive tailored recommendations based on your weak topics.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modal for connecting platforms */}
        <Modal
          isOpen={showConnectModal}
          onClose={() => setShowConnectModal(false)}
          title="Connect Coding Platform"
          description="Enter your public username/handle to automatically synchronize your problem solves."
        >
          <form onSubmit={handleConnect} className="space-y-4">
            <Select
              label="Platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              options={[
                { value: 'codeforces', label: 'Codeforces' },
                { value: 'leetcode', label: 'LeetCode' },
                { value: 'codechef', label: 'CodeChef' },
                { value: 'geeksforgeeks', label: 'GeeksforGeeks' },
              ]}
            />

            <Input
              label="External Handle / Username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. tourist, neal, etc."
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowConnectModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={connecting}
              >
                Verify & Connect
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardShell>
  );
}

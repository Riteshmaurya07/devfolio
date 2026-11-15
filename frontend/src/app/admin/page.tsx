'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { Shield, Users, Flag, FileText, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  StatCard,
} from '@/components/ui';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'moderation' | 'audit'>('analytics');
  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'analytics') {
        const res = await api.get('/admin/analytics');
        setAnalytics(res.data);
      } else if (activeTab === 'users') {
        const res = await api.get('/admin/users');
        setUsers(res.data.users || []);
      } else if (activeTab === 'moderation') {
        const res = await api.get('/admin/reports');
        setReports(res.data || []);
      } else if (activeTab === 'audit') {
        const res = await api.get('/admin/audit-logs');
        setAuditLogs(res.data || []);
      }
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Admin privilege required.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSuspend = async (userId: string, currentSuspended: boolean) => {
    try {
      await api.put(`/admin/users/${userId}/suspend`, {
        is_suspended: !currentSuspended,
        reason: 'Admin moderation action',
      });
      setMessage(`User ${!currentSuspended ? 'suspended' : 'unsuspended'} successfully.`);
      fetchAdminData();
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Action failed.');
    }
  };

  const handleResolveReport = async (reportId: string, status: string) => {
    try {
      await api.put(`/admin/reports/${reportId}/status`, { status });
      setMessage(`Report marked as ${status}.`);
      fetchAdminData();
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Action failed.');
    }
  };

  const TABS = [
    { id: 'analytics', label: 'Platform Overview', icon: Activity },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'moderation', label: 'Moderation Queue', icon: Flag },
    { id: 'audit', label: 'Audit Trail', icon: FileText },
  ];

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                Admin Control Console
              </h1>
              <Badge variant="burnt" size="sm">
                Superuser Interlock
              </Badge>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Global platform telemetry, user account enforcement, moderation actions, and immutable audit events.
            </p>
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

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-[var(--border-subtle)] pb-2 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all duration-150 ${
                  isActive
                    ? 'bg-[#d9541e] text-white shadow-sm'
                    : 'bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="py-12 text-center text-xs text-[var(--text-muted)]">
            Loading administrative telemetry...
          </div>
        ) : (
          <>
            {activeTab === 'analytics' && analytics && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  title="Total Registered Accounts"
                  value={analytics.total_users || 0}
                  subtext="Indexed users across local and OAuth registrations"
                  accent
                  icon={<Users size={18} />}
                />
                <StatCard
                  title="Community Feed Posts"
                  value={analytics.total_posts || 0}
                  subtext="Discussions and project showcases created"
                  icon={<FileText size={18} />}
                />
                <StatCard
                  title="Job Applications Logged"
                  value={analytics.total_applications || 0}
                  subtext="Active recruitment pipelines monitored"
                  icon={<Activity size={18} />}
                />
              </div>
            )}

            {activeTab === 'users' && (
              <Card>
                <CardHeader>
                  <CardTitle>User Directory</CardTitle>
                  <CardDescription>
                    All registered user profiles with permission overrides and suspension gates
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[var(--surface-hover)] border-y border-[var(--border-subtle)] text-[var(--text-muted)] text-[11px] uppercase font-mono tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Username</th>
                          <th className="py-3 px-4">Email</th>
                          <th className="py-3 px-4">Role</th>
                          <th className="py-3 px-4">Account Status</th>
                          <th className="py-3 px-4 text-right">Moderation Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-secondary)]">
                        {users.map((u) => (
                          <tr
                            key={u.id}
                            className="hover:bg-[var(--surface-hover)] transition-colors duration-150"
                          >
                            <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)]">
                              {u.username}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-xs">{u.email}</td>
                            <td className="py-3.5 px-4">
                              <Badge variant={u.is_admin ? 'burnt' : 'neutral'} size="sm">
                                {u.is_admin ? 'Admin' : 'User'}
                              </Badge>
                            </td>
                            <td className="py-3.5 px-4">
                              <Badge variant={u.is_suspended ? 'danger' : 'success'} size="sm">
                                {u.is_suspended ? 'Suspended' : 'Active'}
                              </Badge>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              {!u.is_admin && (
                                <Button
                                  variant={u.is_suspended ? 'primary' : 'danger'}
                                  size="sm"
                                  onClick={() => handleToggleSuspend(u.id, u.is_suspended)}
                                >
                                  {u.is_suspended ? 'Unsuspend' : 'Suspend'}
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'moderation' && (
              <Card>
                <CardHeader>
                  <CardTitle>Content Moderation Queue</CardTitle>
                  <CardDescription>
                    Flags submitted by the community requiring supervisor resolution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {reports.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-lg">
                      No pending user reports in the moderation queue.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reports.map((r: any) => (
                        <div
                          key={r.id}
                          className="p-4 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-subtle)] flex justify-between items-center text-xs"
                        >
                          <div className="space-y-1">
                            <Badge variant="burnt" size="sm">
                              {r.target_type} Flag
                            </Badge>
                            <p className="text-xs text-[var(--text-primary)] pt-1">{r.reason}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleResolveReport(r.id, 'resolved')}
                            >
                              Resolve
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleResolveReport(r.id, 'dismissed')}
                            >
                              Dismiss
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'audit' && (
              <Card>
                <CardHeader>
                  <CardTitle>Immutable Audit Log Stream</CardTitle>
                  <CardDescription>
                    System events, administrative modifications, and security state alterations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {auditLogs.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-lg">
                      No audit events recorded in this cycle.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {auditLogs.map((a: any) => (
                        <div
                          key={a.id}
                          className="p-3 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-subtle)] flex justify-between items-center text-xs"
                        >
                          <div>
                            <span className="font-bold text-[#d9541e] font-mono text-[11px]">
                              {a.action_type}
                            </span>
                            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                              {a.reason || 'Automated verification check'}
                            </p>
                          </div>
                          <span className="text-[10px] text-[var(--text-muted)] font-mono">
                            {new Date(a.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}

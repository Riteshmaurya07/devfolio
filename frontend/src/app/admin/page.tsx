'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { Shield, Users, Flag, FileText, Activity, AlertTriangle, Trash2, CheckCircle } from 'lucide-react';

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
      setMessage(err.response?.data?.detail || 'Admin access required.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSuspend = async (userId: string, currentSuspended: boolean) => {
    try {
      await api.put(`/admin/users/${userId}/suspend`, {
        is_suspended: !currentSuspended,
        reason: 'Admin moderation action'
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

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-indigo-400" /> Admin Control Panel
          </h1>
          <p className="text-slate-400 text-sm mt-1">Platform management, user suspension interlocks, content moderation queues, and immutable audit logs.</p>
        </div>

        {message && (
          <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-500/50 text-indigo-200 text-sm">
            {message}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: 'analytics', label: 'Platform Overview', icon: Activity },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'moderation', label: 'Moderation Queue', icon: Flag },
            { id: 'audit', label: 'Audit Logs', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                  isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="text-white py-12">Loading Admin Data...</div>
        ) : (
          <>
            {activeTab === 'analytics' && analytics && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-slate-400">Total Users</span>
                  <p className="text-3xl font-extrabold text-white">{analytics.total_users}</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-slate-400">Total Feed Posts</span>
                  <p className="text-3xl font-extrabold text-indigo-400">{analytics.total_posts}</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-slate-400">Job Applications Tracked</span>
                  <p className="text-3xl font-extrabold text-emerald-400">{analytics.total_applications}</p>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h2 className="text-lg font-bold text-white">User Accounts</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/60 text-slate-400 text-[10px] uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Username</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-3 font-semibold text-white">{u.username}</td>
                          <td className="p-3 text-slate-300">{u.email}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${u.is_admin ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400'}`}>
                              {u.is_admin ? 'Admin' : 'User'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${u.is_suspended ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                              {u.is_suspended ? 'Suspended' : 'Active'}
                            </span>
                          </td>
                          <td className="p-3">
                            {!u.is_admin && (
                              <button
                                onClick={() => handleToggleSuspend(u.id, u.is_suspended)}
                                className={`px-3 py-1 rounded text-[10px] font-semibold transition ${
                                  u.is_suspended ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                                }`}
                              >
                                {u.is_suspended ? 'Unsuspend' : 'Suspend'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'moderation' && (
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h2 className="text-lg font-bold text-white">Pending Moderation Queue</h2>
                {reports.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No pending user reports in the moderation queue.</p>
                ) : (
                  <div className="space-y-3">
                    {reports.map((r: any) => (
                      <div key={r.id} className="p-4 rounded-xl bg-slate-800 border border-slate-700 flex justify-between items-center text-xs">
                        <div className="space-y-1">
                          <span className="font-bold text-white uppercase text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">{r.target_type} Report</span>
                          <p className="text-slate-300">{r.reason}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleResolveReport(r.id, 'resolved')} className="px-3 py-1 bg-indigo-600 text-white rounded text-[10px] font-semibold">
                            Resolve
                          </button>
                          <button onClick={() => handleResolveReport(r.id, 'dismissed')} className="px-3 py-1 bg-slate-700 text-slate-300 rounded text-[10px]">
                            Dismiss
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h2 className="text-lg font-bold text-white">Immutable Audit Logs</h2>
                <div className="space-y-2">
                  {auditLogs.map((a: any) => (
                    <div key={a.id} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-indigo-300">{a.action_type}</span>
                        <p className="text-[10px] text-slate-400">{a.reason}</p>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono">{new Date(a.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}

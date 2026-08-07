'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { Briefcase, Plus, Calendar, Download, Building, Shield, ArrowRight, X } from 'lucide-react';

const COLUMNS = [
  { id: 'wishlist', label: 'Wishlist', bg: 'bg-slate-900', border: 'border-slate-800' },
  { id: 'applied', label: 'Applied', bg: 'bg-indigo-950/40', border: 'border-indigo-500/30' },
  { id: 'interview', label: 'Interview', bg: 'bg-amber-950/40', border: 'border-amber-500/30' },
  { id: 'offer', label: 'Offer', bg: 'bg-emerald-950/40', border: 'border-emerald-500/30' },
  { id: 'rejected', label: 'Rejected', bg: 'bg-red-950/40', border: 'border-red-500/30' }
];

export default function JobTrackerPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<any>(null);

  // Form State
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [packageVal, setPackageVal] = useState('');
  const [notes, setNotes] = useState('');

  // Interview Schedule Form
  const [scheduledAt, setScheduledAt] = useState('');
  const [roundType, setRoundType] = useState('technical');
  const [interviewNotes, setInterviewNotes] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/jobs/applications');
      setApplications(Array.isArray(res.data) ? res.data : (res.data?.items || []));
    } catch (err) {
      console.error(err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/jobs/applications', {
        company,
        role,
        package: packageVal,
        status: 'wishlist',
        notes
      });
      setMessage(`Added application for ${role} at ${company}!`);
      setShowAddModal(false);
      setCompany('');
      setRole('');
      setPackageVal('');
      setNotes('');
      fetchApplications();
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to create application.');
    }
  };

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      await api.put(`/jobs/applications/${appId}/status`, { new_status: newStatus });
      setMessage(`Moved application to ${newStatus}`);
      fetchApplications();
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Illegal transition');
    }
  };

  const handleAddInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDetailModal) return;
    try {
      await api.post(`/jobs/applications/${showDetailModal.id}/interviews`, {
        scheduled_at: new Date(scheduledAt).toISOString(),
        round_type: roundType,
        notes: interviewNotes
      });
      setMessage('Interview scheduled successfully!');
      setScheduledAt('');
      setInterviewNotes('');
      fetchApplications();
      setShowDetailModal(null);
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to schedule interview');
    }
  };

  if (loading) {
    return <DashboardShell><div className="text-white">Loading Job Applications...</div></DashboardShell>;
  }

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-indigo-400" /> Job Application Tracker
            </h1>
            <p className="text-slate-400 text-sm mt-1">Track job applications, interview timelines, status state machines, and .ics calendar exports.</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Application
          </button>
        </div>

        {message && (
          <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-500/50 text-indigo-200 text-sm">
            {message}
          </div>
        )}

        {/* Kanban Board Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto">
          {COLUMNS.map(col => {
            const colApps = applications.filter(a => a.status === col.id);

            return (
              <div key={col.id} className={`p-4 rounded-2xl ${col.bg} border ${col.border} min-h-[500px] flex flex-col space-y-3`}>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="font-bold text-white text-xs uppercase tracking-wider">{col.label}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">{colApps.length}</span>
                </div>

                <div className="flex-1 space-y-3">
                  {colApps.map(app => (
                    <div
                      key={app.id}
                      onClick={() => setShowDetailModal(app)}
                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition cursor-pointer space-y-2 shadow-md"
                    >
                      <h3 className="font-bold text-white text-sm">{app.role}</h3>
                      <p className="text-xs text-indigo-400 flex items-center gap-1"><Building className="w-3.5 h-3.5" /> {app.company}</p>

                      {app.package && (
                        <p className="text-[10px] text-slate-400 font-mono">{app.package}</p>
                      )}

                      {/* Transition Action Pills */}
                      <div className="pt-2 flex flex-wrap gap-1" onClick={e => e.stopPropagation()}>
                        {COLUMNS.filter(c => c.id !== col.id).slice(0, 2).map(c => (
                          <button
                            key={c.id}
                            onClick={() => handleStatusChange(app.id, c.id)}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] flex items-center gap-1"
                          >
                            → {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">New Application</h2>
                <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>

              <form onSubmit={handleCreateApplication} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Company</label>
                  <input type="text" required value={company} onChange={e => setCompany(e.target.value)} className="w-full px-3 py-2 border border-slate-700 text-white rounded-lg bg-slate-800 text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Role</label>
                  <input type="text" required value={role} onChange={e => setRole(e.target.value)} className="w-full px-3 py-2 border border-slate-700 text-white rounded-lg bg-slate-800 text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Salary / Package</label>
                  <input type="text" value={packageVal} onChange={e => setPackageVal(e.target.value)} placeholder="$140,000 / year" className="w-full px-3 py-2 border border-slate-700 text-white rounded-lg bg-slate-800 text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Notes</label>
                  <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-3 py-2 border border-slate-700 text-white rounded-lg bg-slate-800 text-xs" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg">Create Application</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Application Detail & Interview Schedule Modal */}
        {showDetailModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-lg w-full space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-xl font-bold text-white">{showDetailModal.role}</h2>
                  <p className="text-xs text-indigo-400">{showDetailModal.company}</p>
                </div>
                <button onClick={() => setShowDetailModal(null)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>

              {/* Scheduled Interviews */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" /> Scheduled Interviews
                </h3>

                {showDetailModal.interviews && showDetailModal.interviews.length > 0 ? (
                  <div className="space-y-2">
                    {showDetailModal.interviews.map((inv: any) => (
                      <div key={inv.id} className="p-3 rounded-xl bg-slate-800 border border-slate-700 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-semibold text-white capitalize">{inv.round_type} Round</p>
                          <p className="text-[10px] text-slate-400">{new Date(inv.scheduled_at).toLocaleString()}</p>
                        </div>
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/jobs/interviews/${inv.id}/export.ics`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> .ics Export
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No interviews scheduled yet.</p>
                )}
              </div>

              {/* Schedule Form */}
              <form onSubmit={handleAddInterview} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white">Schedule New Interview</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 mb-1">Date & Time (UTC)</label>
                    <input type="datetime-local" required value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} className="w-full px-2.5 py-1.5 border border-slate-700 text-white rounded bg-slate-800 text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 mb-1">Round Type</label>
                    <select value={roundType} onChange={e => setRoundType(e.target.value)} className="w-full px-2.5 py-1.5 border border-slate-700 text-white rounded bg-slate-800 text-xs">
                      <option value="technical">Technical</option>
                      <option value="behavioral">Behavioral</option>
                      <option value="system_design">System Design</option>
                      <option value="hr">HR Screen</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button type="submit" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg font-semibold">Save Interview</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { Briefcase, Plus, Calendar, Download, Building } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button, Input, Textarea, Select, Modal } from '@/components/ui';

const COLUMNS = [
  { id: 'wishlist', label: 'Wishlist', badgeVariant: 'neutral' as const },
  { id: 'applied', label: 'Applied', badgeVariant: 'primary' as const },
  { id: 'interview', label: 'Interview', badgeVariant: 'burnt' as const },
  { id: 'offer', label: 'Offer', badgeVariant: 'success' as const },
  { id: 'rejected', label: 'Rejected', badgeVariant: 'danger' as const },
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
      setApplications(Array.isArray(res.data) ? res.data : res.data?.items || []);
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
        notes,
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
        notes: interviewNotes,
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

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                Job Application Tracker
              </h1>
              <Badge variant="burnt" size="sm">
                Career Operations
              </Badge>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Kanban pipeline tracking interview dates, offers, transitions, and .ics calendar exports.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            leftIcon={<Plus size={14} />}
          >
            Add Application
          </Button>
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

        {/* Kanban Board Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto min-h-[550px]">
          {COLUMNS.map((col) => {
            const colApps = applications.filter((a) => a.status === col.id);

            return (
              <div
                key={col.id}
                className="p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border-subtle)] flex flex-col space-y-3"
              >
                <div className="flex justify-between items-center pb-2 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[var(--text-primary)] text-xs uppercase tracking-wider">
                      {col.label}
                    </span>
                  </div>
                  <Badge variant={col.badgeVariant} size="sm">
                    {colApps.length}
                  </Badge>
                </div>

                <div className="flex-1 space-y-2.5 overflow-y-auto">
                  {colApps.length === 0 ? (
                    <div className="py-6 text-center text-[11px] text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-lg">
                      No applications
                    </div>
                  ) : (
                    colApps.map((app) => (
                      <Card
                        key={app.id}
                        onClick={() => setShowDetailModal(app)}
                        className="p-3 hover:border-[var(--border-strong)] transition-all cursor-pointer space-y-2 bg-[var(--surface-hover)]"
                      >
                        <h3 className="font-bold text-[var(--text-primary)] text-xs leading-snug">
                          {app.role}
                        </h3>
                        <p className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1">
                          <Building size={12} className="text-[#d9541e]" />
                          {app.company}
                        </p>

                        {app.package && (
                          <p className="text-[10px] font-mono text-[var(--text-muted)]">
                            {app.package}
                          </p>
                        )}

                        {/* Transition Pills */}
                        <div
                          className="pt-1.5 border-t border-[var(--border-subtle)] flex flex-wrap gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {COLUMNS.filter((c) => c.id !== col.id)
                            .slice(0, 2)
                            .map((c) => (
                              <button
                                key={c.id}
                                onClick={() => handleStatusChange(app.id, c.id)}
                                className="px-1.5 py-0.5 rounded bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] text-[9px] font-mono transition-colors"
                              >
                                → {c.label}
                              </button>
                            ))}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Application Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Create New Application"
        >
          <form onSubmit={handleCreateApplication} className="space-y-4">
            <Input
              label="Company Name"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Stripe, Vercel, Datadog..."
            />
            <Input
              label="Target Role"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Senior Backend Engineer"
            />
            <Input
              label="Compensation / Package"
              value={packageVal}
              onChange={(e) => setPackageVal(e.target.value)}
              placeholder="$160,000 / year"
            />
            <Textarea
              label="Application Notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Referral via alumni, tech stack includes Go and PostgreSQL..."
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
              <Button variant="secondary" size="sm" type="button" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Create Application
              </Button>
            </div>
          </form>
        </Modal>

        {/* Application Details & Interview Schedule Modal */}
        <Modal
          isOpen={!!showDetailModal}
          onClose={() => setShowDetailModal(null)}
          title={showDetailModal ? `${showDetailModal.role} @ ${showDetailModal.company}` : 'Application'}
        >
          {showDetailModal && (
            <div className="space-y-5">
              {showDetailModal.notes && (
                <div className="p-3 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                  {showDetailModal.notes}
                </div>
              )}

              {/* Scheduled Interviews */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#d9541e]" />
                  Scheduled Interviews
                </h3>

                {showDetailModal.interviews && showDetailModal.interviews.length > 0 ? (
                  <div className="space-y-2">
                    {showDetailModal.interviews.map((inv: any) => (
                      <div
                        key={inv.id}
                        className="p-3 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-subtle)] flex justify-between items-center text-xs"
                      >
                        <div>
                          <p className="font-semibold text-[var(--text-primary)] capitalize">
                            {inv.round_type} Round
                          </p>
                          <p className="text-[10px] text-[var(--text-muted)] font-mono">
                            {new Date(inv.scheduled_at).toLocaleString()}
                          </p>
                        </div>
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/jobs/interviews/${inv.id}/export.ics`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded text-[11px] font-semibold flex items-center gap-1"
                        >
                          <Download size={12} /> .ics
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-lg p-3 text-center">
                    No interviews scheduled yet.
                  </p>
                )}
              </div>

              {/* Schedule New Interview Form */}
              <form onSubmit={handleAddInterview} className="p-4 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-subtle)] space-y-3">
                <h4 className="text-xs font-bold text-[var(--text-primary)]">
                  Schedule New Interview
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Date & Time"
                    type="datetime-local"
                    required
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                  />
                  <Select
                    label="Round Type"
                    value={roundType}
                    onChange={(e) => setRoundType(e.target.value)}
                    options={[
                      { value: 'technical', label: 'Technical' },
                      { value: 'behavioral', label: 'Behavioral' },
                      { value: 'system_design', label: 'System Design' },
                      { value: 'hr', label: 'HR Screen' },
                    ]}
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <Button variant="primary" size="sm" type="submit">
                    Save Interview
                  </Button>
                </div>
              </form>
            </div>
          )}
        </Modal>
      </div>
    </DashboardShell>
  );
}

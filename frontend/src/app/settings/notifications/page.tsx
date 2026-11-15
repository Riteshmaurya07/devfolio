'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { Bell, Mail, Shield, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from '@/components/ui';

export default function NotificationSettingsPage() {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [categories, setCategories] = useState<{ [key: string]: boolean }>({
    interview: true,
    roadmap: true,
    github: true,
    ai_advice: true,
    system: true,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const res = await api.get('/notifications/preferences');
      setEmailEnabled(res.data.email_enabled);
      setCategories(res.data.category_preferences || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCategory = (cat: string) => {
    setCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/notifications/preferences', {
        email_enabled: emailEnabled,
        category_preferences: categories,
      });
      setMessage('Notification preferences saved successfully!');
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to save preferences.');
    }
  };

  const CATEGORY_ITEMS = [
    { id: 'interview', label: 'Interview Reminders', desc: 'Alerts for upcoming technical & HR interview rounds.' },
    { id: 'roadmap', label: 'Roadmap Milestone Reminders', desc: 'Alerts for active learning roadmaps (7-day cooldown).' },
    { id: 'github', label: 'GitHub Activity Sync', desc: 'Alerts when new repositories or stars are discovered.' },
    { id: 'ai_advice', label: 'AI Career Recommendations', desc: 'Proactive career suggestions from the AI Advisor.' },
    { id: 'system', label: 'System Announcements', desc: 'Important platform updates and security alerts.' },
  ];

  return (
    <DashboardShell>
      <div className="max-w-3xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="pb-2 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Notification Preferences
            </h1>
            <Badge variant="burnt" size="sm">
              Delivery Channels
            </Badge>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Configure delivery channels, email toggles, and notification trigger thresholds.
          </p>
        </div>

        {message && (
          <div className="p-3 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Check size={14} className="text-emerald-500" /> {message}
            </span>
            <button
              onClick={() => setMessage('')}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-mono"
            >
              dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Email Master Toggle */}
          <Card className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Mail size={16} className="text-[#d9541e]" />
                Email Notifications
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Receive transactional and alert summaries to your verified address.
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailEnabled}
              onChange={(e) => setEmailEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--border-subtle)] text-[#d9541e] focus:ring-[#d9541e] cursor-pointer"
            />
          </Card>

          {/* Category Toggles */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-[#d9541e]" />
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                Active Notification Categories
              </h2>
            </div>

            <div className="space-y-3 divide-y divide-[var(--border-subtle)]">
              {CATEGORY_ITEMS.map((cat) => (
                <div key={cat.id} className="pt-3 first:pt-0 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-[var(--text-primary)]">{cat.label}</p>
                    <p className="text-[11px] text-[var(--text-secondary)]">{cat.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!categories[cat.id]}
                    onChange={() => handleToggleCategory(cat.id)}
                    className="w-4 h-4 rounded border-[var(--border-subtle)] text-[#d9541e] focus:ring-[#d9541e] cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </Card>

          <div className="flex justify-end">
            <Button variant="primary" size="sm" type="submit">
              Save Preferences
            </Button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { Bell, Mail, Shield, Check } from 'lucide-react';

export default function NotificationSettingsPage() {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [categories, setCategories] = useState<{ [key: string]: boolean }>({
    interview: true,
    roadmap: true,
    github: true,
    ai_advice: true,
    system: true
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
    setCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/notifications/preferences', {
        email_enabled: emailEnabled,
        category_preferences: categories
      });
      setMessage('Notification preferences saved successfully!');
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to save preferences.');
    }
  };

  if (loading) {
    return <DashboardShell><div className="text-white">Loading Notification Preferences...</div></DashboardShell>;
  }

  return (
    <DashboardShell>
      <div className="max-w-3xl mx-auto space-y-8 pb-16">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Bell className="w-8 h-8 text-indigo-400" /> Notification Preferences
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage delivery channels, email toggles, and notification categories.</p>
        </div>

        {message && (
          <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-500/50 text-indigo-200 text-sm flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" /> {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Email Master Toggle */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400" /> Email Notifications
              </h2>
              <p className="text-xs text-slate-400">Receive email alerts for enabled notification categories.</p>
            </div>
            <input
              type="checkbox"
              checked={emailEnabled}
              onChange={e => setEmailEnabled(e.target.checked)}
              className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          {/* Category Toggles */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" /> Notification Categories
            </h2>

            <div className="space-y-3 divide-y divide-slate-800/60">
              {[
                { id: 'interview', label: 'Interview Reminders', desc: 'Alerts for upcoming technical & HR interview rounds.' },
                { id: 'roadmap', label: 'Roadmap Milestone Reminders', desc: 'Alerts for active learning roadmaps (7-day cooldown).' },
                { id: 'github', label: 'GitHub Activity Sync', desc: 'Alerts when new repositories or stars are discovered.' },
                { id: 'ai_advice', label: 'AI Career Recommendations', desc: 'Proactive career suggestions from the AI Advisor.' },
                { id: 'system', label: 'System Announcements', desc: 'Important platform updates and security alerts.' }
              ].map(cat => (
                <div key={cat.id} className="pt-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">{cat.label}</p>
                    <p className="text-[10px] text-slate-400">{cat.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!categories[cat.id]}
                    onChange={() => handleToggleCategory(cat.id)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30">
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}

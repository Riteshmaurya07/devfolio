'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { Compass, CheckCircle2, Circle, Bookmark, Sparkles, Award } from 'lucide-react';

export default function RoadmapDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [template, setTemplate] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [personalizing, setPersonalizing] = useState(false);
  const [aiAnnotation, setAiAnnotation] = useState<any>(null);

  useEffect(() => {
    fetchTemplateAndProgress();
  }, [slug]);

  const fetchTemplateAndProgress = async () => {
    try {
      const tmplRes = await api.get(`/roadmaps/templates/${slug}`);
      setTemplate(tmplRes.data);

      try {
        const progRes = await api.get('/roadmaps/my-progress');
        const match = progRes.data.find((p: any) => p.roadmap_template_id === tmplRes.data.id);
        if (match) {
          setProgress(match);
          if (match.ai_annotation) setAiAnnotation(match.ai_annotation);
        } else {
          // Auto-start
          const startRes = await api.post(`/roadmaps/start?template_id=${tmplRes.data.id}`);
          setProgress(startRes.data);
        }
      } catch (err) {}
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMilestone = async (milestoneId: string, currentStatus: boolean) => {
    if (!template) return;
    const newStatus = !currentStatus;

    // Optimistic UI update
    setProgress((prev: any) => ({
      ...prev,
      milestone_states: { ...(prev?.milestone_states || {}), [milestoneId]: newStatus }
    }));

    try {
      const res = await api.put(`/roadmaps/progress/${template.id}/milestone`, {
        milestone_id: milestoneId,
        is_completed: newStatus
      });
      setProgress(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBookmark = async (milestoneId: string) => {
    if (!template) return;
    try {
      const res = await api.post(`/roadmaps/progress/${template.id}/bookmark`, {
        milestone_id: milestoneId
      });
      setProgress(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePersonalizeAI = async () => {
    setPersonalizing(true);
    try {
      const res = await api.post(`/roadmaps/templates/${slug}/personalize`);
      setAiAnnotation(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setPersonalizing(false);
    }
  };

  if (loading) {
    return <DashboardShell><div className="text-white">Loading Roadmap...</div></DashboardShell>;
  }

  const completionPct = progress?.completion_percentage || 0;
  const milestoneStates = progress?.milestone_states || {};
  const bookmarks = progress?.bookmarks || [];

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase">
              {template.category}
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">{template.title} Roadmap</h1>
            <p className="text-slate-400 text-sm mt-1">{template.description}</p>
          </div>

          <button
            onClick={handlePersonalizeAI}
            disabled={personalizing}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4" /> {personalizing ? 'Analyzing Skills...' : 'Personalize with AI'}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="text-white flex items-center gap-2"><Award className="w-4 h-4 text-emerald-400" /> Milestone Completion</span>
            <span className="text-emerald-400 font-mono">{completionPct}%</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500" style={{ width: `${completionPct}%` }} />
          </div>
        </div>

        {/* AI Personalization Annotation Banner */}
        {aiAnnotation && (
          <div className="p-6 rounded-2xl bg-indigo-950/60 border border-indigo-500/50 space-y-3 text-indigo-200">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> AI Skill Recommendations
            </h3>
            <p className="text-xs leading-relaxed">{aiAnnotation.advice}</p>
            {aiAnnotation.recommended_focus && (
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-xs text-indigo-300 font-medium">Recommended Focus:</span>
                {aiAnnotation.recommended_focus.map((f: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-200 text-[10px] border border-indigo-500/30">
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timeline Checklist */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Milestones & Learning Objectives</h2>

          <div className="space-y-4 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
            {template.milestones.map((m: any, idx: number) => {
              const isDone = Boolean(milestoneStates[m.id]);
              const isBookmarked = bookmarks.includes(m.id);

              return (
                <div key={m.id} className={`relative pl-14 p-5 rounded-2xl border transition-all ${isDone ? 'bg-slate-900/60 border-slate-800/80 opacity-80' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}>
                  {/* Timeline Checkbox Node */}
                  <button
                    onClick={() => handleToggleMilestone(m.id, isDone)}
                    className="absolute left-4 top-5 text-indigo-400 hover:scale-110 transition z-10"
                  >
                    {isDone ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <Circle className="w-6 h-6 text-slate-600" />}
                  </button>

                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-indigo-400 font-mono font-semibold uppercase">Milestone 0{idx + 1}</span>
                      <h3 className={`text-base font-bold mt-0.5 ${isDone ? 'text-slate-400 line-through' : 'text-white'}`}>{m.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{m.description}</p>
                    </div>

                    <button
                      onClick={() => handleToggleBookmark(m.id)}
                      className={`p-1.5 rounded-lg border transition ${isBookmarked ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'}`}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

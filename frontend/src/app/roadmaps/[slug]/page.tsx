'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { Compass, CheckCircle2, Circle, Bookmark, Sparkles, Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from '@/components/ui';

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

    setProgress((prev: any) => ({
      ...prev,
      milestone_states: { ...(prev?.milestone_states || {}), [milestoneId]: newStatus },
    }));

    try {
      const res = await api.put(`/roadmaps/progress/${template.id}/milestone`, {
        milestone_id: milestoneId,
        is_completed: newStatus,
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
        milestone_id: milestoneId,
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
    return (
      <DashboardShell>
        <div className="py-12 text-center text-xs text-[var(--text-muted)]">
          Loading roadmap telemetry...
        </div>
      </DashboardShell>
    );
  }

  const completionPct = progress?.completion_percentage || 0;
  const milestoneStates = progress?.milestone_states || {};
  const bookmarks = progress?.bookmarks || [];

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="burnt" size="sm">
                {template?.category || 'Curated'}
              </Badge>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                {template?.milestones?.length || 0} Milestones Total
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              {template?.title}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              {template?.description}
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handlePersonalizeAI}
            isLoading={personalizing}
            leftIcon={<Sparkles size={14} />}
          >
            Personalize with AI
          </Button>
        </div>

        {/* Progress Bar Card */}
        <Card className="p-5 space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-[var(--text-primary)] flex items-center gap-2">
              <Award size={15} className="text-[#d9541e]" />
              Milestone Completion Rate
            </span>
            <span className="font-mono font-bold text-[#d9541e]">{completionPct}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[var(--surface-hover)] border border-[var(--border-subtle)] overflow-hidden">
            <div
              className="h-full bg-[#d9541e] transition-all duration-300 rounded-full"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </Card>

        {/* AI Recommendations Banner */}
        {aiAnnotation && (
          <Card className="p-5 border-[#d9541e]/30 bg-[#d9541e]/5 space-y-2.5">
            <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Sparkles size={14} className="text-[#d9541e]" />
              AI Tailored Recommendations
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {aiAnnotation.advice}
            </p>
            {aiAnnotation.recommended_focus && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-semibold text-[var(--text-primary)]">
                  Focus Areas:
                </span>
                {aiAnnotation.recommended_focus.map((f: string, i: number) => (
                  <Badge key={i} variant="burnt" size="sm">
                    {f}
                  </Badge>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Milestones Checklist */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            Milestones & Learning Objectives
          </h2>

          <div className="space-y-3">
            {template?.milestones?.map((m: any, idx: number) => {
              const isDone = Boolean(milestoneStates[m.id]);
              const isBookmarked = bookmarks.includes(m.id);

              return (
                <Card
                  key={m.id}
                  className={`p-4 transition-all duration-150 ${
                    isDone ? 'opacity-70 bg-[var(--surface-hover)]' : 'hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <button
                        onClick={() => handleToggleMilestone(m.id, isDone)}
                        className="mt-0.5 text-[#d9541e] hover:opacity-80 transition-opacity"
                        aria-label={isDone ? 'Mark milestone incomplete' : 'Mark milestone complete'}
                      >
                        {isDone ? (
                          <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Circle size={18} className="text-[var(--text-muted)]" />
                        )}
                      </button>

                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono uppercase font-semibold text-[var(--text-muted)]">
                          Milestone #{String(idx + 1).padStart(2, '0')}
                        </span>
                        <h3
                          className={`text-sm font-bold ${
                            isDone ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'
                          }`}
                        >
                          {m.title}
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-1">
                          {m.description}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleBookmark(m.id)}
                      className={`p-2 rounded-lg border text-xs transition-colors duration-150 ${
                        isBookmarked
                          ? 'border-[#d9541e]/40 bg-[#d9541e]/10 text-[#d9541e]'
                          : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'
                      }`}
                      aria-label="Bookmark milestone"
                    >
                      <Bookmark size={14} />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

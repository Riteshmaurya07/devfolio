'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { Compass, ChevronRight, BookOpen, Layers } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from '@/components/ui';

export default function RoadmapsBrowsePage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/roadmaps/templates');
      setTemplates(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(templates.map((t) => t.category).filter(Boolean)))];

  const filteredTemplates =
    selectedCategory === 'All'
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                Learning Roadmaps
              </h1>
              <Badge variant="burnt" size="sm">
                Skill Milestones
              </Badge>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Curated career tracks with structured milestones, practice exercises, and bookmarking.
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isSelected
                    ? 'bg-[#d9541e] text-white shadow-sm'
                    : 'bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="py-12 text-center text-xs text-[var(--text-muted)]">
            Loading curated roadmaps...
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="py-12 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-lg">
            No roadmaps found for category: {selectedCategory}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((t) => (
              <Link
                key={t.id}
                href={`/roadmaps/${t.slug}`}
                className="group flex flex-col"
              >
                <Card className="h-full flex flex-col justify-between p-6 hover:border-[var(--border-strong)] transition-all duration-150">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="burnt" size="sm">
                        {t.category || 'General'}
                      </Badge>
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">
                        {t.milestones?.length || 0} Milestones
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[#d9541e] transition-colors duration-150">
                      {t.title}
                    </h2>

                    <p className="text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                      {t.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-semibold text-[#d9541e]">
                    <span>Inspect Roadmap</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform duration-150" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

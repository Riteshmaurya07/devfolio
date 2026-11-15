'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/layout/DashboardShell';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Plus, FileText, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from '@/components/ui';

export default function ResumesPage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes/me');
      setResumes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const createNewResume = async () => {
    setIsCreating(true);
    try {
      await api.post('/resumes', {
        title: 'Untitled Resume',
        template_name: 'modern',
        content: {
          contact: { name: '', email: '', phone: '', location: '', website: '', linkedin: '', github: '' },
          summary: '',
          skills: [],
          experience: [],
          education: [],
          projects: [],
          certifications: [],
        },
      });
      toast.success('Resume created successfully');
      fetchResumes();
    } catch (err: any) {
      toast.error('Failed to create resume');
      console.error(err);
    } finally {
      setIsCreating(false);
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
                Resume Directory
              </h1>
              <Badge variant="burnt" size="sm">
                JSON & PDF
              </Badge>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Manage multi-version developer resumes, customize templates, and download verified PDFs.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/resumes/builder">
              <Button variant="secondary" size="sm">
                Advanced Builder
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={createNewResume}
              isLoading={isCreating}
              leftIcon={<Plus size={14} />}
            >
              Create New
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-[var(--text-muted)]">
            Loading resumes...
          </div>
        ) : resumes.length === 0 ? (
          <div className="p-8 rounded-lg bg-[var(--surface)] text-center border border-dashed border-[var(--border-subtle)]">
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              You haven&apos;t created any resumes yet.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={createNewResume}
              isLoading={isCreating}
            >
              Create your first resume
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((r) => (
              <Link href={`/resumes/${r.id}`} key={r.id} className="group">
                <Card className="p-6 h-full flex flex-col justify-between hover:border-[var(--border-strong)] transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
                        Version {r.version_number || 1}
                      </span>
                      {r.is_active && (
                        <Badge variant="success" size="sm">
                          Active
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-[var(--text-primary)] group-hover:text-[#d9541e] transition-colors">
                      {r.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Updated: {new Date(r.updated_at || r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex justify-between items-center text-xs text-[#d9541e] font-semibold">
                    <span>Edit Document</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
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

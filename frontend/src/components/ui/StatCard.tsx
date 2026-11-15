import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtext?: string;
  icon?: React.ReactNode;
  accent?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  subtext,
  icon,
  accent = false,
  className = '',
}: StatCardProps) {
  const changeBadgeVariant = {
    positive: 'success' as const,
    negative: 'danger' as const,
    neutral: 'neutral' as const,
  }[changeType];

  return (
    <Card
      className={`p-5 relative overflow-hidden transition-all duration-200 ${
        accent
          ? 'border-[#d9541e]/40 dark:border-[#d9541e]/30'
          : 'hover:border-[var(--border-strong)]'
      } ${className}`}
    >
      {/* Subtle top accent line for featured cards */}
      {accent && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#d9541e]" />
      )}

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {title}
          </p>
          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)] font-mono">
              {value}
            </span>
            {change && (
              <Badge variant={changeBadgeVariant} size="sm">
                {change}
              </Badge>
            )}
          </div>
        </div>

        {icon && (
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
              accent
                ? 'bg-[#d9541e]/10 border-[#d9541e]/25 text-[#d9541e]'
                : 'bg-[var(--bg-canvas-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
            }`}
          >
            {icon}
          </div>
        )}
      </div>

      {subtext && (
        <p className="mt-3 text-xs text-[var(--text-secondary)] border-t border-[var(--border-subtle)] pt-2.5 leading-relaxed">
          {subtext}
        </p>
      )}
    </Card>
  );
}

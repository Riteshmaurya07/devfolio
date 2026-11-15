'use client';

import React from 'react';

interface ContributionHeatmapProps {
  data: { [date: string]: number }; // e.g. {"2026-08-01": 5, "2026-08-02": 12}
  title?: string;
}

export default function ContributionHeatmap({
  data,
  title = 'Contribution Activity',
}: ContributionHeatmapProps) {
  // Generate days for past 90 days grid
  const days: string[] = [];
  const today = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }

  const getColorClass = (count: number) => {
    if (!count || count === 0)
      return 'bg-[var(--bg-canvas-subtle)] border-[var(--border-subtle)]';
    if (count <= 2)
      return 'bg-[#d9541e]/20 border-[#d9541e]/35';
    if (count <= 5)
      return 'bg-[#d9541e]/45 border-[#d9541e]/60';
    if (count <= 10)
      return 'bg-[#d9541e]/75 border-[#d9541e]/90 text-white';
    return 'bg-[#d9541e] border-[#c24615] text-white';
  };

  const totalContributions = Object.values(data || {}).reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="p-5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
          {title}
        </h3>
        <span className="text-xs text-[#d9541e] font-mono font-medium">
          {totalContributions} contributions in recent history
        </span>
      </div>

      <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto pb-1">
        {days.map((dateStr) => {
          const count = data[dateStr] || 0;
          return (
            <div
              key={dateStr}
              title={`${dateStr}: ${count} contributions`}
              className={`w-3.5 h-3.5 rounded-xs border transition-all hover:scale-125 hover:z-10 cursor-pointer ${getColorClass(
                count
              )}`}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-3 border-t border-[var(--border-subtle)]">
        <span>Recent 90 days</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <div className="w-3 h-3 rounded-xs bg-[var(--bg-canvas-subtle)] border border-[var(--border-subtle)]" />
          <div className="w-3 h-3 rounded-xs bg-[#d9541e]/20 border border-[#d9541e]/35" />
          <div className="w-3 h-3 rounded-xs bg-[#d9541e]/45 border border-[#d9541e]/60" />
          <div className="w-3 h-3 rounded-xs bg-[#d9541e]/75 border border-[#d9541e]/90" />
          <div className="w-3 h-3 rounded-xs bg-[#d9541e] border border-[#c24615]" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

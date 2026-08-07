'use client';

import React from 'react';

interface ContributionHeatmapProps {
  data: { [date: string]: number }; // e.g. {"2026-08-01": 5, "2026-08-02": 12}
  title?: string;
}

export default function ContributionHeatmap({ data, title = 'Contribution Activity' }: ContributionHeatmapProps) {
  // Generate days for past 90 days grid
  const days: string[] = [];
  const today = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }

  const getColorClass = (count: number) => {
    if (!count || count === 0) return 'bg-slate-800/80 border-slate-700/50';
    if (count <= 2) return 'bg-emerald-950 border-emerald-800 text-emerald-300';
    if (count <= 5) return 'bg-emerald-700 border-emerald-600 text-emerald-100';
    if (count <= 10) return 'bg-emerald-500 border-emerald-400 text-white';
    return 'bg-emerald-400 border-emerald-300 text-slate-950';
  };

  const totalContributions = Object.values(data || {}).reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-white">{title}</h3>
        <span className="text-xs text-emerald-400 font-mono font-medium">{totalContributions} contributions in recent history</span>
      </div>

      <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto pb-2">
        {days.map((dateStr) => {
          const count = data[dateStr] || 0;
          return (
            <div
              key={dateStr}
              title={`${dateStr}: ${count} contributions`}
              className={`w-3.5 h-3.5 rounded-sm border transition-all hover:scale-125 hover:z-10 cursor-pointer ${getColorClass(count)}`}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800/80">
        <span>Recent 90 days</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-slate-800 border border-slate-700"></div>
          <div className="w-3 h-3 rounded-sm bg-emerald-950 border border-emerald-800"></div>
          <div className="w-3 h-3 rounded-sm bg-emerald-700 border border-emerald-600"></div>
          <div className="w-3 h-3 rounded-sm bg-emerald-500 border border-emerald-400"></div>
          <div className="w-3 h-3 rounded-sm bg-emerald-400 border border-emerald-300"></div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

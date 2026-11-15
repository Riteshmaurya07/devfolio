import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'burnt' | 'neutral' | 'cream' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({
  className = '',
  variant = 'neutral',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-0.5 gap-1.5',
  }[size];

  const variantClasses = {
    burnt:
      'bg-[#d9541e]/10 text-[#d9541e] border border-[#d9541e]/25 font-semibold',
    neutral:
      'bg-[var(--bg-canvas-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)] font-medium',
    cream:
      'bg-[#111111]/5 dark:bg-[#f3eee3]/10 text-[#111111] dark:text-[#f3eee3] border border-[#111111]/15 dark:border-[#f3eee3]/20 font-medium',
    success:
      'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-medium',
    warning:
      'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25 font-medium',
    danger:
      'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 font-medium',
    outline:
      'bg-transparent text-[var(--text-secondary)] border border-[var(--border-strong)] font-medium',
  }[variant];

  return (
    <span
      className={`inline-flex items-center rounded-md transition-colors select-none ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

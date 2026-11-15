import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, helperText, id, disabled, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={`w-full text-sm rounded-lg border bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-all duration-150 p-3.5 min-h-[100px] ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
              : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)] focus:border-[#d9541e] focus:ring-1 focus:ring-[#d9541e]'
          } focus:outline-none disabled:opacity-50 disabled:bg-[var(--bg-canvas-subtle)] disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-[var(--text-muted)]">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

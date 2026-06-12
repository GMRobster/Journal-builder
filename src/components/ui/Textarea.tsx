'use client';
import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export function Textarea({ label, hint, className = '', id, ...props }: TextareaProps) {
  const elId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={elId} className="text-xs text-forge-muted font-medium">{label}</label>}
      <textarea
        id={elId}
        className={`bg-forge-bg border border-forge-border rounded px-2.5 py-1.5 text-sm text-forge-text placeholder-forge-muted/50 focus:outline-none focus:border-forge-accent transition-colors resize-y min-h-[80px] ${className}`}
        {...props}
      />
      {hint && <p className="text-xs text-forge-muted">{hint}</p>}
    </div>
  );
}

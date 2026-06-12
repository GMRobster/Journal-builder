'use client';
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export function Input({ label, hint, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={inputId} className="text-xs text-forge-muted font-medium">{label}</label>}
      <input
        id={inputId}
        className={`bg-forge-bg border border-forge-border rounded px-2.5 py-1.5 text-sm text-forge-text placeholder-forge-muted/50 focus:outline-none focus:border-forge-accent transition-colors ${className}`}
        {...props}
      />
      {hint && <p className="text-xs text-forge-muted">{hint}</p>}
    </div>
  );
}

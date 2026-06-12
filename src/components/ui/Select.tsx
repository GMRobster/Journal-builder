'use client';
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className = '', id, ...props }: SelectProps) {
  const elId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={elId} className="text-xs text-forge-muted font-medium">{label}</label>}
      <select
        id={elId}
        className={`bg-forge-bg border border-forge-border rounded px-2.5 py-1.5 text-sm text-forge-text focus:outline-none focus:border-forge-accent transition-colors cursor-pointer ${className}`}
        {...props}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

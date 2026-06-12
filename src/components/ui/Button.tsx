'use client';
import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
type Size = 'xs' | 'sm' | 'md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-forge-accent hover:bg-violet-500 text-white border border-violet-600',
  secondary: 'bg-forge-panel hover:bg-forge-border text-forge-text border border-forge-border',
  ghost: 'bg-transparent hover:bg-forge-panel text-forge-muted hover:text-forge-text border border-transparent',
  danger: 'bg-red-900/50 hover:bg-red-800/70 text-red-300 border border-red-800',
  gold: 'bg-amber-900/40 hover:bg-amber-800/50 text-amber-300 border border-amber-700',
};

const sizeClasses: Record<Size, string> = {
  xs: 'px-2 py-0.5 text-xs rounded',
  sm: 'px-2.5 py-1 text-xs rounded',
  md: 'px-3 py-1.5 text-sm rounded',
};

export function Button({ variant = 'secondary', size = 'sm', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

'use client';
import React, { useState, useRef } from 'react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  label?: string;
  placeholder?: string;
}

export function TagInput({ tags, onChange, label, placeholder = 'Tag hinzufügen…' }: TagInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = (raw: string) => {
    const parts = raw.split(',').map(t => t.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const next = [...tags];
    for (const part of parts) { if (!next.includes(part)) next.push(part); }
    onChange(next);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); commit(input); }
    else if (e.key === 'Backspace' && input === '' && tags.length > 0) { onChange(tags.slice(0, -1)); }
  };

  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-xs text-forge-muted font-medium">{label}</span>}
      <div
        className="flex flex-wrap gap-1.5 bg-forge-bg border border-forge-border rounded px-2 py-1.5 min-h-[36px] cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 bg-forge-panel border border-forge-border text-forge-text text-xs rounded px-1.5 py-0.5">
            {tag}
            <button type="button" className="text-forge-muted hover:text-red-400 leading-none"
              onClick={e => { e.stopPropagation(); onChange(tags.filter(t => t !== tag)); }}>×</button>
          </span>
        ))}
        <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown} onBlur={() => { if (input.trim()) commit(input); }}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[80px] bg-transparent text-sm text-forge-text placeholder-forge-muted/50 outline-none" />
      </div>
    </div>
  );
}

'use client';
import React, { useRef } from 'react';
import type { MediaItem, ImageAlignment, TextFlow } from '@/types';
import { Input } from './Input';
import { Select } from './Select';

interface MediaEditorProps {
  media: MediaItem;
  onChange: (updates: Partial<MediaItem>) => void;
  label?: string;
}

const alignOptions: { value: ImageAlignment; label: string }[] = [
  { value: 'left', label: 'Links' },
  { value: 'center', label: 'Mitte' },
  { value: 'right', label: 'Rechts' },
  { value: 'full', label: 'Volle Breite' },
];

const flowOptions: { value: TextFlow; label: string }[] = [
  { value: 'block', label: 'Block' },
  { value: 'wrap', label: 'Textumfluss' },
];

export function MediaEditor({ media, onChange, label = 'Bild' }: MediaEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // Derive a clean alt text from the filename (strip extension)
      const altText = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
      onChange({ url: dataUrl, alt: altText });
    };
    reader.readAsDataURL(file);
    // Reset so the same file can be re-selected if needed
    e.target.value = '';
  }

  return (
    <div className="space-y-2 border border-forge-border rounded p-3 bg-forge-bg/40">
      <p className="text-xs font-medium text-forge-muted uppercase tracking-wide">{label}</p>
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Input
            label="Bild-URL"
            value={media.url}
            onChange={e => onChange({ url: e.target.value })}
            placeholder="https://..."
          />
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 px-2 py-1.5 text-xs rounded border border-forge-border bg-forge-surface text-forge-text hover:bg-forge-panel transition-colors"
        >
          Datei wählen
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {media.url && (
        <>
          <div className="relative w-full max-h-28 overflow-hidden rounded">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={media.url} alt={media.alt} className="max-h-28 object-contain mx-auto" />
          </div>
          <Input
            label="Alt-Text"
            value={media.alt}
            onChange={e => onChange({ alt: e.target.value })}
          />
          <Input
            label="Bildunterschrift"
            value={media.caption}
            onChange={e => onChange({ caption: e.target.value })}
          />
          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Breite"
              value={media.width}
              onChange={e => onChange({ width: e.target.value })}
              placeholder="160px / 35%"
            />
            <Select
              label="Ausrichtung"
              value={media.alignment}
              options={alignOptions}
              onChange={e => onChange({ alignment: e.target.value as ImageAlignment })}
            />
            <Select
              label="Textfluss"
              value={media.textFlow}
              options={flowOptions}
              onChange={e => onChange({ textFlow: e.target.value as TextFlow })}
            />
          </div>
        </>
      )}
    </div>
  );
}

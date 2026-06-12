'use client';
import React from 'react';
import type { MediaItem, ImageAlignment, TextFlow } from '@/types';
import { Input } from './Input';
import { Select } from './Select';

interface MediaEditorProps {
  media: MediaItem;
  onChange: (updates: Partial<MediaItem>) => void;
  label?: string;
}

const alignOptions: { value: string; label: string }[] = [
  { value: 'left', label: 'Links' }, { value: 'center', label: 'Mitte' },
  { value: 'right', label: 'Rechts' }, { value: 'full', label: 'Volle Breite' },
];

const flowOptions: { value: string; label: string }[] = [
  { value: 'block', label: 'Block' }, { value: 'wrap', label: 'Textumfluss' },
];

export function MediaEditor({ media, onChange, label = 'Bild' }: MediaEditorProps) {
  return (
    <div className="space-y-2 border border-forge-border rounded p-3 bg-forge-bg/40">
      <p className="text-xs font-medium text-forge-muted uppercase tracking-wide">{label}</p>
      <Input label="Bild-URL" value={media.url} onChange={e => onChange({ url: e.target.value })} placeholder="https://..." />
      {media.url && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="relative w-full max-h-28 overflow-hidden rounded">
            <img src={media.url} alt={media.alt} className="max-h-28 object-contain mx-auto" />
          </div>
          <Input label="Alt-Text" value={media.alt} onChange={e => onChange({ alt: e.target.value })} />
          <Input label="Bildunterschrift" value={media.caption} onChange={e => onChange({ caption: e.target.value })} />
          <div className="grid grid-cols-3 gap-2">
            <Input label="Breite" value={media.width} onChange={e => onChange({ width: e.target.value })} placeholder="160px / 35%" />
            <Select label="Ausrichtung" value={media.alignment} options={alignOptions} onChange={e => onChange({ alignment: e.target.value as ImageAlignment })} />
            <Select label="Textfluss" value={media.textFlow} options={flowOptions} onChange={e => onChange({ textFlow: e.target.value as TextFlow })} />
          </div>
        </>
      )}
    </div>
  );
}

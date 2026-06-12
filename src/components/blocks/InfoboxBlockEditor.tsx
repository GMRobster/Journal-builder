'use client';
import React from 'react';
import type { InfoboxBlock } from '@/types';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { MediaEditor } from '@/components/ui/MediaEditor';
import { Button } from '@/components/ui/Button';
import { defaultMedia } from '@/types';

const variantOptions = [
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warnung' },
  { value: 'tip', label: 'Tipp' },
  { value: 'lore', label: 'Lore' },
];

interface Props {
  block: InfoboxBlock;
  onChange: (updates: Partial<InfoboxBlock>) => void;
}

export function InfoboxBlockEditor({ block, onChange }: Props) {
  return (
    <div className="space-y-3">
      <Input label="Überschrift" value={block.title}
        onChange={e => onChange({ title: e.target.value })} />
      <Select label="Typ" value={block.variant} options={variantOptions}
        onChange={e => onChange({ variant: e.target.value as InfoboxBlock['variant'] })} />
      <Textarea label="Inhalt (Markdown)" value={block.content} rows={5}
        onChange={e => onChange({ content: e.target.value })} />
      {block.media ? (
        <MediaEditor media={block.media}
          onChange={updates => onChange({ media: { ...block.media!, ...updates } })} />
      ) : (
        <Button variant="ghost" size="sm" onClick={() => onChange({ media: defaultMedia() })}>
          + Bild hinzufügen
        </Button>
      )}
      {block.media && (
        <Button variant="danger" size="xs" onClick={() => onChange({ media: undefined })}>
          Bild entfernen
        </Button>
      )}
    </div>
  );
}

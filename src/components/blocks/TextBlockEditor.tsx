'use client';
import React from 'react';
import type { TextBlock, TextAlign } from '@/types';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { MediaEditor } from '@/components/ui/MediaEditor';
import { Button } from '@/components/ui/Button';
import { defaultMedia } from '@/types';

const alignOptions: { value: TextAlign; label: string }[] = [
  { value: 'left', label: 'Links' }, { value: 'center', label: 'Mitte' },
  { value: 'right', label: 'Rechts' }, { value: 'justify', label: 'Blocksatz' },
];

interface Props {
  block: TextBlock;
  onChange: (updates: Partial<TextBlock>) => void;
}

export function TextBlockEditor({ block, onChange }: Props) {
  return (
    <div className="space-y-3">
      <Textarea
        label="Inhalt (Markdown)"
        value={block.content}
        onChange={e => onChange({ content: e.target.value })}
        rows={6}
        placeholder="**Fett**, *kursiv*, __unterstrichen__, `code`, [Link](url), > Zitat, ---"
      />
      <Select label="Ausrichtung" value={block.align} options={alignOptions}
        onChange={e => onChange({ align: e.target.value as TextAlign })} />
      {block.media ? (
        <MediaEditor
          media={block.media}
          onChange={updates => onChange({ media: { ...block.media!, ...updates } })}
        />
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

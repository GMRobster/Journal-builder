'use client';
import React from 'react';
import type { ReadaloudBlock } from '@/types';
import { Textarea } from '@/components/ui/Textarea';
import { MediaEditor } from '@/components/ui/MediaEditor';
import { Button } from '@/components/ui/Button';
import { defaultMedia } from '@/types';

interface Props {
  block: ReadaloudBlock;
  onChange: (updates: Partial<ReadaloudBlock>) => void;
}

export function ReadaloudBlockEditor({ block, onChange }: Props) {
  return (
    <div className="space-y-3">
      <Textarea
        label="Vorlesetext (Markdown)"
        value={block.content}
        onChange={e => onChange({ content: e.target.value })}
        rows={5}
        placeholder="Text der den Spielern vorgelesen wird…"
      />
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

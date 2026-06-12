'use client';
import React from 'react';
import type { ImageBlock } from '@/types';
import { MediaEditor } from '@/components/ui/MediaEditor';

interface Props {
  block: ImageBlock;
  onChange: (updates: Partial<ImageBlock>) => void;
}

export function ImageBlockEditor({ block, onChange }: Props) {
  return (
    <MediaEditor
      media={block.media}
      onChange={updates => onChange({ media: { ...block.media, ...updates } })}
      label="Bild"
    />
  );
}

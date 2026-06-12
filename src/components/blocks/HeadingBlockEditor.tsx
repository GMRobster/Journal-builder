'use client';
import React from 'react';
import type { HeadingBlock, HeadingLevel, TextAlign } from '@/types';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

const levelOptions: { value: HeadingLevel; label: string }[] = [
  { value: 'h1', label: 'H1' }, { value: 'h2', label: 'H2' },
  { value: 'h3', label: 'H3' }, { value: 'h4', label: 'H4' },
  { value: 'h5', label: 'H5' }, { value: 'h6', label: 'H6' },
];

const alignOptions: { value: TextAlign; label: string }[] = [
  { value: 'left', label: 'Links' }, { value: 'center', label: 'Mitte' },
  { value: 'right', label: 'Rechts' }, { value: 'justify', label: 'Blocksatz' },
];

interface Props {
  block: HeadingBlock;
  onChange: (updates: Partial<HeadingBlock>) => void;
}

export function HeadingBlockEditor({ block, onChange }: Props) {
  return (
    <div className="space-y-3">
      <Input label="Text" value={block.text} onChange={e => onChange({ text: e.target.value })} />
      <div className="grid grid-cols-2 gap-2">
        <Select label="Ebene" value={block.level} options={levelOptions}
          onChange={e => onChange({ level: e.target.value as HeadingLevel })} />
        <Select label="Ausrichtung" value={block.align} options={alignOptions}
          onChange={e => onChange({ align: e.target.value as TextAlign })} />
      </div>
    </div>
  );
}

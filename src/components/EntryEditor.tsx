'use client';
import React, { useState } from 'react';
import type { Entry, HeadingLevel } from '@/types';
import { useStore } from '@/store/store';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { TagInput } from './ui/TagInput';
import { Button } from './ui/Button';
import { BlockList } from './BlockList';
import { slugify } from '@/lib/utils';

const hlOptions: { value: HeadingLevel; label: string }[] = [
  { value: 'h1', label: 'H1' }, { value: 'h2', label: 'H2' },
  { value: 'h3', label: 'H3' }, { value: 'h4', label: 'H4' },
  { value: 'h5', label: 'H5' }, { value: 'h6', label: 'H6' },
];

interface Props {
  projectId: string;
  collectionId: string;
  entry: Entry;
}

export function EntryEditor({ projectId, collectionId, entry }: Props) {
  const { updateEntry, setActiveBlock } = useStore();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const update = (updates: Partial<Entry>) => {
    updateEntry(projectId, collectionId, entry.id, updates);
  };

  const handleTitleChange = (title: string) => {
    update({ title, slug: slugify(title) });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Entry header */}
      <div className="flex-shrink-0 space-y-2 pb-3 border-b border-forge-border mb-3">
        <div className="flex items-center gap-2">
          <Input
            className="flex-1 text-base font-semibold"
            value={entry.title}
            onChange={e => handleTitleChange(e.target.value)}
            placeholder="Eintragstitel…"
          />
          <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(o => !o)}>
            ⚙ {settingsOpen ? '▲' : '▼'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setActiveBlock(null)}>
            Alle schließen
          </Button>
        </div>

        {settingsOpen && (
          <div className="bg-forge-surface border border-forge-border rounded p-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Input label="Slug / ID"
                value={entry.slug}
                onChange={e => update({ slug: e.target.value })}
                hint="Wird als HTML id= verwendet" />
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm text-forge-muted cursor-pointer">
                  <input type="checkbox" checked={entry.exportTitleAsHeading}
                    onChange={e => update({ exportTitleAsHeading: e.target.checked })}
                    className="accent-forge-accent" />
                  Titel als Heading exportieren
                </label>
                {entry.exportTitleAsHeading && (
                  <Select value={entry.headingLevel} options={hlOptions}
                    onChange={e => update({ headingLevel: e.target.value as HeadingLevel })} />
                )}
              </div>
            </div>
            <TagInput tags={entry.tags} onChange={tags => update({ tags })} label="Tags" />
          </div>
        )}
      </div>

      {/* Blocks */}
      <div className="flex-1 overflow-y-auto">
        <BlockList
          projectId={projectId}
          collectionId={collectionId}
          entryId={entry.id}
          blocks={entry.blocks}
        />
      </div>
    </div>
  );
}

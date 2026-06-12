'use client';
import React, { useState } from 'react';
import type { Collection, Entry } from '@/types';
import { useStore } from '@/store/store';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { TagInput } from './ui/TagInput';
import { Button } from './ui/Button';
import { EntryEditor } from './EntryEditor';
import { slugify } from '@/lib/utils';

interface Props {
  projectId: string;
  collection: Collection;
}

export function CollectionEditor({ projectId, collection }: Props) {
  const {
    updateCollection, deleteCollection,
    createEntry, updateEntry, deleteEntry, moveEntry, duplicateEntry, sortEntries,
    setActiveEntry, activeEntryId,
  } = useStore();
  const [colSettingsOpen, setColSettingsOpen] = useState(false);
  const [newEntryTitle, setNewEntryTitle] = useState('');

  const activeEntry = collection.entries.find(e => e.id === activeEntryId);

  const handleAddEntry = () => {
    const title = newEntryTitle.trim() || 'Neuer Eintrag';
    createEntry(projectId, collection.id, title);
    setNewEntryTitle('');
  };

  return (
    <div className="flex h-full gap-0">
      {/* Entry list sidebar */}
      <div className="w-52 flex-shrink-0 flex flex-col border-r border-forge-border overflow-y-auto">
        {/* Collection header */}
        <div className="p-2 border-b border-forge-border flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-forge-text truncate flex-1">{collection.title}</h2>
            <Button variant="ghost" size="xs" onClick={() => setColSettingsOpen(o => !o)}>⚙</Button>
          </div>

          {colSettingsOpen && (
            <div className="space-y-2 mt-2 mb-1">
              <Input value={collection.title}
                onChange={e => updateCollection(projectId, collection.id, { title: e.target.value })}
                placeholder="Titel der Sammlung" />
              <Textarea value={collection.description} rows={2}
                onChange={e => updateCollection(projectId, collection.id, { description: e.target.value })}
                placeholder="Beschreibung…" />
              <TagInput tags={collection.tags}
                onChange={tags => updateCollection(projectId, collection.id, { tags })} />
              <Button variant="danger" size="xs" className="w-full"
                onClick={() => {
                  if (confirm('Sammlung löschen?')) deleteCollection(projectId, collection.id);
                }}>
                Sammlung löschen
              </Button>
            </div>
          )}

          {/* Sort */}
          <div className="flex gap-1 mt-1">
            <Button variant="ghost" size="xs" onClick={() => sortEntries(projectId, collection.id, 'az')}>A–Z</Button>
            <Button variant="ghost" size="xs" onClick={() => sortEntries(projectId, collection.id, 'za')}>Z–A</Button>
            <Button variant="ghost" size="xs" onClick={() => sortEntries(projectId, collection.id, 'tags')}>Tags</Button>
          </div>
        </div>

        {/* Entry list */}
        <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
          {collection.entries
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((entry, idx) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                index={idx}
                total={collection.entries.length}
                isActive={activeEntryId === entry.id}
                onSelect={() => setActiveEntry(entry.id === activeEntryId ? null : entry.id)}
                onMoveUp={() => moveEntry(projectId, collection.id, idx, idx - 1)}
                onMoveDown={() => moveEntry(projectId, collection.id, idx, idx + 1)}
                onDuplicate={() => duplicateEntry(projectId, collection.id, entry.id)}
                onDelete={() => deleteEntry(projectId, collection.id, entry.id)}
              />
            ))}
        </div>

        {/* Add entry */}
        <div className="p-2 border-t border-forge-border flex-shrink-0 space-y-1">
          <input
            className="w-full bg-forge-bg border border-forge-border rounded px-2 py-1 text-xs text-forge-text placeholder-forge-muted/50 focus:outline-none focus:border-forge-accent"
            value={newEntryTitle}
            onChange={e => setNewEntryTitle(e.target.value)}
            placeholder="Neuer Eintrag…"
            onKeyDown={e => e.key === 'Enter' && handleAddEntry()}
          />
          <Button variant="primary" size="xs" className="w-full justify-center" onClick={handleAddEntry}>
            + Eintrag
          </Button>
        </div>
      </div>

      {/* Entry editor */}
      <div className="flex-1 overflow-hidden p-3">
        {activeEntry ? (
          <EntryEditor
            projectId={projectId}
            collectionId={collection.id}
            entry={activeEntry}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-forge-muted text-sm">
            Wähle einen Eintrag oder erstelle einen neuen.
          </div>
        )}
      </div>
    </div>
  );
}

interface EntryRowProps {
  entry: Entry;
  index: number;
  total: number;
  isActive: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function EntryRow({ entry, index, total, isActive, onSelect, onMoveUp, onMoveDown, onDuplicate, onDelete }: EntryRowProps) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className={`group relative flex items-center rounded px-1.5 py-1 cursor-pointer text-xs transition-colors ${
        isActive ? 'bg-forge-accent/20 text-forge-text' : 'hover:bg-forge-panel text-forge-muted'
      }`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onSelect}
    >
      <div className="flex flex-col gap-0 mr-1 flex-shrink-0">
        <button type="button" className="text-forge-muted/50 hover:text-forge-muted leading-none"
          onClick={e => { e.stopPropagation(); onMoveUp(); }} disabled={index === 0}>▲</button>
        <button type="button" className="text-forge-muted/50 hover:text-forge-muted leading-none"
          onClick={e => { e.stopPropagation(); onMoveDown(); }} disabled={index === total - 1}>▼</button>
      </div>

      <span className="truncate flex-1">{entry.title || '(kein Titel)'}</span>
      <span className="text-forge-muted/40 ml-1">{entry.blocks.length}</span>

      {hover && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 bg-forge-panel border border-forge-border rounded px-0.5">
          <button type="button" title="Duplizieren" className="text-forge-muted hover:text-forge-text p-0.5"
            onClick={e => { e.stopPropagation(); onDuplicate(); }}>⎘</button>
          <button type="button" title="Löschen" className="text-red-400/70 hover:text-red-400 p-0.5"
            onClick={e => { e.stopPropagation(); if (confirm('Eintrag löschen?')) onDelete(); }}>×</button>
        </div>
      )}
    </div>
  );
}

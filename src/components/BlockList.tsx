'use client';
import React, { useState } from 'react';
import type { Block, BlockType } from '@/types';
import { generateId } from '@/lib/utils';
import { defaultMedia } from '@/types';
import { Button } from './ui/Button';
import { BlockCard } from './BlockCard';
import { useStore } from '@/store/store';

function createBlock(type: BlockType): Block {
  const base = {
    id: generateId(),
    visibility: 'player' as const,
    tags: [],
    hiddenFromExport: false,
  };

  switch (type) {
    case 'heading':
      return { ...base, type: 'heading', level: 'h3', text: '', align: 'left' };
    case 'text':
      return { ...base, type: 'text', content: '', align: 'left' };
    case 'readaloud':
      return { ...base, type: 'readaloud', content: '' };
    case 'image':
      return { ...base, type: 'image', media: defaultMedia() };
    case 'accordion':
      return {
        ...base, type: 'accordion', title: '', defaultOpen: false,
        items: [{ id: generateId(), summary: 'Abschnitt', content: '' }],
      };
    case 'list':
      return {
        ...base, type: 'list', ordered: false,
        items: [{ id: generateId(), text: '' }],
      };
    case 'infobox':
      return { ...base, type: 'infobox', title: '', content: '', variant: 'info' };
    case 'profile':
      return {
        ...base, type: 'profile', name: '', subtitle: '', actorRef: '',
        description: '', quotes: '', gmDetails: '', gmPersonality: '',
        gmConnections: '', defaultOpen: false, headingLevel: 'h3',
        labelMode: 'label', labelQuotes: 'Zitate', labelGmDetails: 'Details',
        labelGmPersonality: 'Persönlichkeit', labelGmConnections: 'Verbindungen',
      };
  }
}

const BLOCK_TYPES: { type: BlockType; label: string; icon: string }[] = [
  { type: 'heading', label: 'Überschrift', icon: 'H' },
  { type: 'text', label: 'Text', icon: '¶' },
  { type: 'readaloud', label: 'Vorlesetext', icon: '📖' },
  { type: 'image', label: 'Bild', icon: '🖼' },
  { type: 'accordion', label: 'Akkordeon', icon: '▼' },
  { type: 'list', label: 'Liste', icon: '≡' },
  { type: 'infobox', label: 'Infobox', icon: 'ℹ' },
  { type: 'profile', label: 'Profil', icon: '👤' },
];

interface Props {
  projectId: string;
  collectionId: string;
  entryId: string;
  blocks: Block[];
}

export function BlockList({ projectId, collectionId, entryId, blocks }: Props) {
  const {
    addBlock, updateBlock, deleteBlock, moveBlock, duplicateBlock,
    setActiveBlock, activeBlockId, sortProfileBlocks,
  } = useStore();
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  const handleAdd = (type: BlockType) => {
    const block = createBlock(type);
    addBlock(projectId, collectionId, entryId, block);
    setAddMenuOpen(false);
  };

  const hasProfiles = blocks.some(b => b.type === 'profile');

  return (
    <div className="space-y-2">
      {/* Sort profile blocks */}
      {hasProfiles && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-forge-muted">Profile sortieren:</span>
          {[
            { mode: 'az' as const, label: 'A–Z' },
            { mode: 'za' as const, label: 'Z–A' },
            { mode: 'subtitle' as const, label: 'Traits' },
            { mode: 'tags' as const, label: 'Tags' },
          ].map(s => (
            <Button key={s.mode} variant="ghost" size="xs"
              onClick={() => sortProfileBlocks(projectId, collectionId, entryId, s.mode)}>
              {s.label}
            </Button>
          ))}
        </div>
      )}

      {blocks.length === 0 && (
        <p className="text-forge-muted text-sm text-center py-6 border border-dashed border-forge-border rounded">
          Noch keine Blöcke. Füge einen hinzu.
        </p>
      )}

      {blocks.map((block, idx) => (
        <BlockCard
          key={block.id}
          block={block}
          index={idx}
          total={blocks.length}
          isActive={activeBlockId === block.id}
          onActivate={() => setActiveBlock(block.id)}
          onClose={() => setActiveBlock(null)}
          onUpdate={updates => updateBlock(projectId, collectionId, entryId, block.id, updates)}
          onDelete={() => deleteBlock(projectId, collectionId, entryId, block.id)}
          onMoveUp={() => moveBlock(projectId, collectionId, entryId, idx, idx - 1)}
          onMoveDown={() => moveBlock(projectId, collectionId, entryId, idx, idx + 1)}
          onDuplicate={() => duplicateBlock(projectId, collectionId, entryId, block.id)}
        />
      ))}

      {/* Add block */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center border-dashed border-forge-border"
          onClick={() => setAddMenuOpen(o => !o)}
        >
          + Block hinzufügen
        </Button>
        {addMenuOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-1 bg-forge-panel border border-forge-border rounded-md shadow-xl z-10 p-2">
            <div className="grid grid-cols-4 gap-1">
              {BLOCK_TYPES.map(bt => (
                <button
                  key={bt.type}
                  type="button"
                  className="flex flex-col items-center gap-1 p-2 rounded hover:bg-forge-border text-forge-muted hover:text-forge-text text-xs transition-colors"
                  onClick={() => handleAdd(bt.type)}
                >
                  <span className="text-base">{bt.icon}</span>
                  <span>{bt.label}</span>
                </button>
              ))}
            </div>
            <div className="border-t border-forge-border mt-1 pt-1">
              <Button variant="ghost" size="xs" className="w-full" onClick={() => setAddMenuOpen(false)}>
                Abbrechen
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

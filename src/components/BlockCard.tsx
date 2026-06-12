'use client';
import React from 'react';
import type { Block, Visibility } from '@/types';
import { Button } from './ui/Button';
import { TagInput } from './ui/TagInput';
import { Select } from './ui/Select';
import { HeadingBlockEditor } from './blocks/HeadingBlockEditor';
import { TextBlockEditor } from './blocks/TextBlockEditor';
import { ReadaloudBlockEditor } from './blocks/ReadaloudBlockEditor';
import { ImageBlockEditor } from './blocks/ImageBlockEditor';
import { AccordionBlockEditor } from './blocks/AccordionBlockEditor';
import { ListBlockEditor } from './blocks/ListBlockEditor';
import { InfoboxBlockEditor } from './blocks/InfoboxBlockEditor';
import { ProfileBlockEditor } from './blocks/ProfileBlockEditor';

const TYPE_LABELS: Record<Block['type'], string> = {
  heading: 'Überschrift',
  text: 'Text',
  readaloud: 'Vorlesetext',
  image: 'Bild',
  accordion: 'Akkordeon',
  list: 'Liste',
  infobox: 'Infobox',
  profile: 'Profil',
};

const TYPE_ICONS: Record<Block['type'], string> = {
  heading: 'H',
  text: '¶',
  readaloud: '📖',
  image: '🖼',
  accordion: '▼',
  list: '≡',
  infobox: 'ℹ',
  profile: '👤',
};

const TYPE_COLORS: Record<Block['type'], string> = {
  heading: 'text-forge-gold border-forge-gold/30',
  text: 'text-blue-400 border-blue-400/30',
  readaloud: 'text-emerald-400 border-emerald-400/30',
  image: 'text-pink-400 border-pink-400/30',
  accordion: 'text-purple-400 border-purple-400/30',
  list: 'text-cyan-400 border-cyan-400/30',
  infobox: 'text-orange-400 border-orange-400/30',
  profile: 'text-violet-300 border-violet-300/30',
};

const visibilityOptions: { value: Visibility; label: string }[] = [
  { value: 'player', label: 'Spieler' },
  { value: 'gm', label: 'Nur SL' },
  { value: 'draft', label: 'Entwurf' },
];

function blockPreview(block: Block): string {
  switch (block.type) {
    case 'heading': return block.text || '(leer)';
    case 'text': return block.content.slice(0, 60) || '(leer)';
    case 'readaloud': return block.content.slice(0, 60) || '(leer)';
    case 'image': return block.media.url ? block.media.url.split('/').pop() || 'Bild' : '(kein Bild)';
    case 'accordion': return block.items[0]?.summary || block.title || '(leer)';
    case 'list': return block.items[0]?.text || '(leer)';
    case 'infobox': return block.title || block.content.slice(0, 40) || '(leer)';
    case 'profile': return block.name || '(kein Name)';
  }
}

interface Props {
  block: Block;
  index: number;
  total: number;
  isActive: boolean;
  onActivate: () => void;
  onClose: () => void;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
}

export function BlockCard({
  block, index, total, isActive,
  onActivate, onClose, onUpdate, onDelete, onMoveUp, onMoveDown, onDuplicate,
}: Props) {
  const typeColor = TYPE_COLORS[block.type];
  const visClass =
    block.visibility === 'gm' ? 'opacity-60' :
    block.visibility === 'draft' ? 'opacity-40 border-dashed' : '';

  return (
    <div
      className={`border rounded-md overflow-hidden transition-all ${
        isActive ? 'border-forge-accent/60 shadow-lg shadow-forge-accent/10' : 'border-forge-border'
      } ${visClass}`}
    >
      {/* Header row */}
      <div
        className={`flex items-center gap-2 px-2.5 py-2 cursor-pointer select-none ${
          isActive ? 'bg-forge-panel' : 'bg-forge-surface hover:bg-forge-panel/70'
        }`}
        onClick={isActive ? onClose : onActivate}
      >
        {/* Move buttons */}
        <div className="flex flex-col gap-0.5 flex-shrink-0">
          <button
            type="button"
            className="text-forge-muted hover:text-forge-text text-xs leading-none"
            onClick={e => { e.stopPropagation(); onMoveUp(); }}
            disabled={index === 0}
          >▲</button>
          <button
            type="button"
            className="text-forge-muted hover:text-forge-text text-xs leading-none"
            onClick={e => { e.stopPropagation(); onMoveDown(); }}
            disabled={index === total - 1}
          >▼</button>
        </div>

        {/* Type badge */}
        <span className={`text-xs font-mono px-1.5 py-0.5 border rounded flex-shrink-0 ${typeColor}`}>
          {TYPE_ICONS[block.type]} {TYPE_LABELS[block.type]}
        </span>

        {/* Preview */}
        <span className="text-sm text-forge-muted truncate flex-1 min-w-0">
          {blockPreview(block)}
        </span>

        {/* Visibility badge */}
        {block.visibility !== 'player' && (
          <span className={`text-xs px-1 rounded ${
            block.visibility === 'gm' ? 'bg-amber-900/40 text-amber-400' : 'bg-gray-800 text-gray-500'
          }`}>
            {block.visibility === 'gm' ? 'SL' : 'Entwurf'}
          </span>
        )}

        {/* Hidden badge */}
        {block.hiddenFromExport && (
          <span className="text-xs px-1 rounded bg-red-900/30 text-red-400">versteckt</span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="xs" onClick={onDuplicate} title="Duplizieren">⎘</Button>
          <Button variant="danger" size="xs" onClick={onDelete} title="Löschen">×</Button>
        </div>

        {/* Toggle indicator */}
        <span className="text-forge-muted text-xs flex-shrink-0">{isActive ? '▲' : '▼'}</span>
      </div>

      {/* Expanded editor */}
      {isActive && (
        <div className="p-3 bg-forge-bg space-y-4 border-t border-forge-border">
          {/* Block type editor */}
          {block.type === 'heading' && (
            <HeadingBlockEditor block={block} onChange={u => onUpdate(u as Partial<Block>)} />
          )}
          {block.type === 'text' && (
            <TextBlockEditor block={block} onChange={u => onUpdate(u as Partial<Block>)} />
          )}
          {block.type === 'readaloud' && (
            <ReadaloudBlockEditor block={block} onChange={u => onUpdate(u as Partial<Block>)} />
          )}
          {block.type === 'image' && (
            <ImageBlockEditor block={block} onChange={u => onUpdate(u as Partial<Block>)} />
          )}
          {block.type === 'accordion' && (
            <AccordionBlockEditor block={block} onChange={u => onUpdate(u as Partial<Block>)} />
          )}
          {block.type === 'list' && (
            <ListBlockEditor block={block} onChange={u => onUpdate(u as Partial<Block>)} />
          )}
          {block.type === 'infobox' && (
            <InfoboxBlockEditor block={block} onChange={u => onUpdate(u as Partial<Block>)} />
          )}
          {block.type === 'profile' && (
            <ProfileBlockEditor block={block} onChange={u => onUpdate(u as Partial<Block>)} />
          )}

          {/* Shared block settings */}
          <div className="border-t border-forge-border pt-3 space-y-2">
            <p className="text-xs text-forge-muted font-medium uppercase tracking-wide">Block-Einstellungen</p>
            <div className="grid grid-cols-2 gap-2">
              <Select label="Sichtbarkeit" value={block.visibility} options={visibilityOptions}
                onChange={e => onUpdate({ visibility: e.target.value as Visibility })} />
              <label className="flex items-center gap-2 text-sm text-forge-muted cursor-pointer self-end pb-1.5">
                <input type="checkbox" checked={block.hiddenFromExport}
                  onChange={e => onUpdate({ hiddenFromExport: e.target.checked })}
                  className="accent-forge-accent" />
                Vom Export ausschließen
              </label>
            </div>
            <TagInput tags={block.tags} onChange={tags => onUpdate({ tags })} label="Tags" />
          </div>

          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={onClose}>Schließen</Button>
          </div>
        </div>
      )}
    </div>
  );
}

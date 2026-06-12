'use client';
import React from 'react';
import type { ListBlock } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { generateId } from '@/lib/utils';

interface Props {
  block: ListBlock;
  onChange: (updates: Partial<ListBlock>) => void;
}

export function ListBlockEditor({ block, onChange }: Props) {
  const updateItem = (id: string, text: string) => {
    onChange({ items: block.items.map(it => (it.id === id ? { ...it, text } : it)) });
  };

  const addItem = () => {
    onChange({ items: [...block.items, { id: generateId(), text: '' }] });
  };

  const removeItem = (id: string) => {
    onChange({ items: block.items.filter(it => it.id !== id) });
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm text-forge-muted cursor-pointer">
        <input
          type="checkbox"
          checked={block.ordered}
          onChange={e => onChange({ ordered: e.target.checked })}
          className="accent-forge-accent"
        />
        Nummerierte Liste
      </label>

      <div className="space-y-1.5">
        {block.items.map((item, idx) => (
          <div key={item.id} className="flex items-center gap-2">
            <span className="text-xs text-forge-muted w-5 text-right flex-shrink-0">
              {block.ordered ? `${idx + 1}.` : '•'}
            </span>
            <Input
              className="flex-1"
              value={item.text}
              onChange={e => updateItem(item.id, e.target.value)}
              placeholder="Listeneintrag…"
            />
            <Button variant="danger" size="xs" onClick={() => removeItem(item.id)}>×</Button>
          </div>
        ))}
      </div>
      <Button variant="ghost" size="sm" onClick={addItem}>+ Eintrag hinzufügen</Button>
    </div>
  );
}

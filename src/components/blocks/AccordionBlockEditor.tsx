'use client';
import React from 'react';
import type { AccordionBlock, AccordionItem } from '@/types';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { generateId } from '@/lib/utils';

interface Props {
  block: AccordionBlock;
  onChange: (updates: Partial<AccordionBlock>) => void;
}

export function AccordionBlockEditor({ block, onChange }: Props) {
  const updateItem = (id: string, updates: Partial<AccordionItem>) => {
    onChange({
      items: block.items.map(it => (it.id === id ? { ...it, ...updates } : it)),
    });
  };

  const addItem = () => {
    onChange({
      items: [...block.items, { id: generateId(), summary: 'Neuer Eintrag', content: '' }],
    });
  };

  const removeItem = (id: string) => {
    onChange({ items: block.items.filter(it => it.id !== id) });
  };

  return (
    <div className="space-y-3">
      <Input
        label="Gruppenüberschrift (optional)"
        value={block.title}
        onChange={e => onChange({ title: e.target.value })}
      />
      <label className="flex items-center gap-2 text-sm text-forge-muted cursor-pointer">
        <input
          type="checkbox"
          checked={block.defaultOpen}
          onChange={e => onChange({ defaultOpen: e.target.checked })}
          className="accent-forge-accent"
        />
        Standardmäßig geöffnet
      </label>

      <div className="space-y-2">
        {block.items.map((item, idx) => (
          <div key={item.id} className="border border-forge-border rounded p-2 space-y-2 bg-forge-bg/40">
            <div className="flex items-center gap-2">
              <span className="text-xs text-forge-muted">#{idx + 1}</span>
              <Input
                className="flex-1"
                value={item.summary}
                onChange={e => updateItem(item.id, { summary: e.target.value })}
                placeholder="Zusammenfassung…"
              />
              <Button variant="danger" size="xs" onClick={() => removeItem(item.id)}>×</Button>
            </div>
            <Textarea
              value={item.content}
              onChange={e => updateItem(item.id, { content: e.target.value })}
              placeholder="Inhalt (Markdown)…"
              rows={3}
            />
          </div>
        ))}
      </div>
      <Button variant="ghost" size="sm" onClick={addItem}>+ Eintrag hinzufügen</Button>
    </div>
  );
}

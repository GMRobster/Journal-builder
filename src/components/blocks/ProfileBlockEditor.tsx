'use client';
import React, { useState } from 'react';
import type { ProfileBlock } from '@/types';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { MediaEditor } from '@/components/ui/MediaEditor';
import { Button } from '@/components/ui/Button';
import { defaultMedia } from '@/types';

type HeadingOpt = { value: string; label: string };

const headingOptions: HeadingOpt[] = [
  { value: 'none', label: 'Kein Heading' },
  { value: 'h2', label: 'H2' },
  { value: 'h3', label: 'H3' },
  { value: 'h4', label: 'H4' },
  { value: 'h5', label: 'H5' },
];

const labelModeOptions = [
  { value: 'label', label: 'Label (Div)' },
  { value: 'heading', label: 'Echtes Heading' },
];

interface Props {
  block: ProfileBlock;
  onChange: (updates: Partial<ProfileBlock>) => void;
}

export function ProfileBlockEditor({ block, onChange }: Props) {
  const [gmOpen, setGmOpen] = useState(false);
  const [labelsOpen, setLabelsOpen] = useState(false);

  function setHeadingLevel(v: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onChange({ headingLevel: v as any });
  }

  function setLabelMode(v: string) {
    onChange({ labelMode: v as 'label' | 'heading' });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Input
          label="Name / Titel"
          value={block.name}
          onChange={e => onChange({ name: e.target.value })}
        />
        <Input
          label="Untertitel / Traits"
          value={block.subtitle}
          onChange={e => onChange({ subtitle: e.target.value })}
          placeholder="Mensch - Kapitaenin - Die Seehexe"
        />
      </div>

      <Input
        label="Actor/Journal Referenz (Foundry UUID)"
        value={block.actorRef}
        onChange={e => onChange({ actorRef: e.target.value })}
        placeholder="@UUID[Actor.xxx]{Name}"
      />

      <Textarea
        label="Beschreibung (Markdown)"
        value={block.description}
        onChange={e => onChange({ description: e.target.value })}
        rows={4}
      />

      {block.media ? (
        <div>
          <MediaEditor
            media={block.media}
            onChange={updates => onChange({ media: { ...block.media!, ...updates } })}
          />
          <Button
            variant="danger"
            size="xs"
            className="mt-1"
            onClick={() => onChange({ media: undefined })}
          >
            Bild entfernen
          </Button>
        </div>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => onChange({ media: defaultMedia() })}>
          + Profilbild hinzufuegen
        </Button>
      )}

      <Textarea
        label="Zitate (eine Zeile pro Zitat)"
        value={block.quotes}
        onChange={e => onChange({ quotes: e.target.value })}
        placeholder="Ein Zitat pro Zeile"
        rows={3}
      />

      <div className="grid grid-cols-2 gap-2">
        <Select
          label="Name als Heading"
          value={block.headingLevel}
          options={headingOptions}
          onChange={e => setHeadingLevel(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm text-forge-muted cursor-pointer self-end pb-1.5">
          <input
            type="checkbox"
            checked={block.defaultOpen}
            onChange={e => onChange({ defaultOpen: e.target.checked })}
            className="accent-forge-accent"
          />
          Standardmaessig geoeffnet
        </label>
      </div>

      <div className="border border-forge-border rounded overflow-hidden">
        <button
          type="button"
          className="w-full flex items-center justify-between px-3 py-2 bg-forge-panel text-sm text-forge-muted hover:text-forge-text"
          onClick={() => setGmOpen(o => !o)}
        >
          <span>Spielleiterinformationen</span>
          <span>{gmOpen ? '▲' : '▼'}</span>
        </button>
        {gmOpen && (
          <div className="p-3 space-y-3 bg-forge-bg/40">
            <Textarea
              label="Details (Markdown)"
              value={block.gmDetails}
              onChange={e => onChange({ gmDetails: e.target.value })}
              rows={3}
            />
            <Textarea
              label="Persoenlichkeit (Markdown)"
              value={block.gmPersonality}
              onChange={e => onChange({ gmPersonality: e.target.value })}
              rows={3}
            />
            <Textarea
              label="Verbindungen (Markdown)"
              value={block.gmConnections}
              onChange={e => onChange({ gmConnections: e.target.value })}
              rows={3}
            />
          </div>
        )}
      </div>

      <div className="border border-forge-border rounded overflow-hidden">
        <button
          type="button"
          className="w-full flex items-center justify-between px-3 py-2 bg-forge-panel text-sm text-forge-muted hover:text-forge-text"
          onClick={() => setLabelsOpen(o => !o)}
        >
          <span>Abschnittsbeschriftungen</span>
          <span>{labelsOpen ? '▲' : '▼'}</span>
        </button>
        {labelsOpen && (
          <div className="p-3 space-y-3 bg-forge-bg/40">
            <Select
              label="Label-Modus"
              value={block.labelMode}
              options={labelModeOptions}
              onChange={e => setLabelMode(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Label Zitate"
                value={block.labelQuotes}
                onChange={e => onChange({ labelQuotes: e.target.value })}
              />
              <Input
                label="Label Details"
                value={block.labelGmDetails}
                onChange={e => onChange({ labelGmDetails: e.target.value })}
              />
              <Input
                label="Label Persoenlichkeit"
                value={block.labelGmPersonality}
                onChange={e => onChange({ labelGmPersonality: e.target.value })}
              />
              <Input
                label="Label Verbindungen"
                value={block.labelGmConnections}
                onChange={e => onChange({ labelGmConnections: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

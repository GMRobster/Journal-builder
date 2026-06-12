'use client';
import React, { useState } from 'react';
import type { JFStyle, StyleTokens } from '@/types';
import { useStore } from '@/store/store';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import { STYLE_PRESETS } from '@/lib/stylePresets';

const GOOGLE_FONTS = [
  'Inter', 'Roboto', 'Noto Sans', 'Noto Serif', 'Merriweather',
  'Libre Baskerville', 'EB Garamond', 'Alegreya', 'Cormorant Garamond',
  'Cinzel', 'Oswald', 'Roboto Slab', 'IM Fell English SC',
  'Uncial Antiqua', 'Pirata One', 'MedievalSharp',
];

const fontOptions = [
  { value: '', label: '(System-Standard)' },
  ...GOOGLE_FONTS.map(f => ({ value: f, label: f })),
];

const transformOptions = [
  { value: 'none', label: 'Normal' },
  { value: 'uppercase', label: 'GROSSBUCHSTABEN' },
  { value: 'lowercase', label: 'kleinbuchstaben' },
  { value: 'capitalize', label: 'Ersten Buchstaben Groß' },
];

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-forge-muted font-medium">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="w-8 h-8 rounded border border-forge-border cursor-pointer bg-transparent" />
        <input type="text" value={value} onChange={e => onChange(e.target.value)}
          className="flex-1 bg-forge-bg border border-forge-border rounded px-2 py-1 text-xs text-forge-text focus:outline-none focus:border-forge-accent" />
      </div>
    </div>
  );
}

interface Props {
  projectId: string;
  style: JFStyle;
}

export function StyleEditor({ projectId, style }: Props) {
  const { updateStyleTokens, updateStyle, createStyle, deleteStyle, setActiveStyle, duplicateStyle, getActiveProject } = useStore();
  const project = getActiveProject();
  const [section, setSection] = useState<'colors' | 'fonts' | 'layout' | 'custom'>('colors');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(STYLE_PRESETS[0].id);

  const t = style.tokens;
  const set = (updates: Partial<StyleTokens>) => updateStyleTokens(projectId, style.id, updates);

  return (
    <div className="flex flex-col h-full">
      {/* Style selector */}
      <div className="flex-shrink-0 p-3 border-b border-forge-border space-y-2">
        <div className="flex items-center gap-2">
          <select
            className="flex-1 bg-forge-bg border border-forge-border rounded px-2 py-1.5 text-sm text-forge-text focus:outline-none"
            value={style.id}
            onChange={e => setActiveStyle(projectId, e.target.value)}
          >
            {project?.styles.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <Button variant="ghost" size="sm" onClick={() => createStyle(projectId, 'Neuer Stil')}>+</Button>
          <Button variant="ghost" size="sm" onClick={() => duplicateStyle(projectId, style.id)}>⎘</Button>
          {project && project.styles.length > 1 && (
            <Button variant="danger" size="sm"
              onClick={() => { if (confirm('Stil löschen?')) deleteStyle(projectId, style.id); }}>×</Button>
          )}
        </div>
        <Input label="Name" value={style.name}
          onChange={e => updateStyle(projectId, style.id, { name: e.target.value })} />
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="text-xs text-forge-muted font-medium block mb-1">Preset laden</label>
            <select
              className="w-full bg-forge-bg border border-forge-border rounded px-2 py-1.5 text-sm text-forge-text focus:outline-none"
              value={selectedPresetId}
              onChange={e => setSelectedPresetId(e.target.value)}
            >
              {STYLE_PRESETS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const preset = STYLE_PRESETS.find(p => p.id === selectedPresetId);
              if (preset) updateStyleTokens(projectId, style.id, preset.tokens);
            }}
          >
            Anwenden
          </Button>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex-shrink-0 flex border-b border-forge-border">
        {(['colors', 'fonts', 'layout', 'custom'] as const).map(s => (
          <button
            key={s}
            type="button"
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              section === s
                ? 'text-forge-accent border-b-2 border-forge-accent bg-forge-surface'
                : 'text-forge-muted hover:text-forge-text'
            }`}
            onClick={() => setSection(s)}
          >
            {s === 'colors' ? 'Farben' : s === 'fonts' ? 'Schriften' : s === 'layout' ? 'Layout' : 'CSS'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {section === 'colors' && (
          <>
            <p className="text-xs text-forge-muted uppercase tracking-wide font-medium">Hintergrund</p>
            <div className="grid grid-cols-2 gap-3">
              <ColorField label="Hintergrund" value={t.backgroundColor} onChange={v => set({ backgroundColor: v })} />
              <ColorField label="Oberfläche" value={t.surfaceColor} onChange={v => set({ surfaceColor: v })} />
              <ColorField label="Panel" value={t.panelColor} onChange={v => set({ panelColor: v })} />
              <ColorField label="Rahmen" value={t.borderColor} onChange={v => set({ borderColor: v })} />
            </div>
            <p className="text-xs text-forge-muted uppercase tracking-wide font-medium">Text</p>
            <div className="grid grid-cols-2 gap-3">
              <ColorField label="Text" value={t.textColor} onChange={v => set({ textColor: v })} />
              <ColorField label="Gedämpft" value={t.mutedTextColor} onChange={v => set({ mutedTextColor: v })} />
              <ColorField label="Überschriften" value={t.headingColor} onChange={v => set({ headingColor: v })} />
              <ColorField label="Links" value={t.linkColor} onChange={v => set({ linkColor: v })} />
              <ColorField label="Akzent" value={t.accentColor} onChange={v => set({ accentColor: v })} />
            </div>
            <p className="text-xs text-forge-muted uppercase tracking-wide font-medium">Vorlesetext</p>
            <div className="grid grid-cols-2 gap-3">
              <ColorField label="Hintergrund" value={t.readaloudBg} onChange={v => set({ readaloudBg: v })} />
              <ColorField label="Rand" value={t.readaloudBorder} onChange={v => set({ readaloudBorder: v })} />
            </div>
            <p className="text-xs text-forge-muted uppercase tracking-wide font-medium">Infoboxen</p>
            <div className="grid grid-cols-2 gap-3">
              <ColorField label="Info – Hintergrund" value={t.infoColor ?? ''} onChange={v => set({ infoColor: v })} />
              <ColorField label="Info – Rand" value={t.infoBorder ?? ''} onChange={v => set({ infoBorder: v })} />
              <ColorField label="Warnung – Hintergrund" value={t.warningColor ?? ''} onChange={v => set({ warningColor: v })} />
              <ColorField label="Warnung – Rand" value={t.warningBorder ?? ''} onChange={v => set({ warningBorder: v })} />
              <ColorField label="Tipp – Hintergrund" value={t.tipColor ?? ''} onChange={v => set({ tipColor: v })} />
              <ColorField label="Tipp – Rand" value={t.tipBorder ?? ''} onChange={v => set({ tipBorder: v })} />
              <ColorField label="Lore – Hintergrund" value={t.loreColor ?? ''} onChange={v => set({ loreColor: v })} />
              <ColorField label="Lore – Rand" value={t.loreBorder ?? ''} onChange={v => set({ loreBorder: v })} />
            </div>
          </>
        )}

        {section === 'fonts' && (
          <>
            <div className="space-y-3">
              <Select label="Google Font (Text)"
                value={t.googleFontBody}
                options={fontOptions}
                onChange={e => {
                  const f = e.target.value;
                  set({ googleFontBody: f, fontFamily: f ? `'${f}', sans-serif` : 'sans-serif' });
                }}
              />
              <Input
                label="Eigene Schrift eingeben… (Fließtext)"
                value={t.googleFontBody}
                onChange={e => {
                  const f = e.target.value;
                  set({ googleFontBody: f, fontFamily: f ? `'${f}', sans-serif` : 'sans-serif' });
                }}
                placeholder="z. B. MedievalSharp"
              />
              <Select label="Google Font (Überschriften)"
                value={t.googleFontHeading}
                options={fontOptions}
                onChange={e => {
                  const f = e.target.value;
                  set({ googleFontHeading: f, headingFontFamily: f ? `'${f}', serif` : 'serif' });
                }}
              />
              <Input
                label="Eigene Schrift eingeben… (Überschriften)"
                value={t.googleFontHeading}
                onChange={e => {
                  const f = e.target.value;
                  set({ googleFontHeading: f, headingFontFamily: f ? `'${f}', serif` : 'serif' });
                }}
                placeholder="z. B. Cinzel Decorative"
              />
              <Input label="Font-Familie (CSS, Fließtext)" value={t.fontFamily}
                onChange={e => set({ fontFamily: e.target.value })}
                placeholder="'Noto Sans', sans-serif" />
              <Input label="Font-Familie (CSS, Überschriften)" value={t.headingFontFamily}
                onChange={e => set({ headingFontFamily: e.target.value })}
                placeholder="'Cinzel', serif" />
              <Select label="Überschriften-Transformation"
                value={t.headingTransform}
                options={transformOptions}
                onChange={e => set({ headingTransform: e.target.value as StyleTokens['headingTransform'] })}
              />
              <Input label="Buchstabenabstand (Überschriften)" value={t.headingLetterSpacing}
                onChange={e => set({ headingLetterSpacing: e.target.value })}
                placeholder="0.02em" />
            </div>
          </>
        )}

        {section === 'layout' && (
          <div className="space-y-3">
            <Input label="Eckenradius" value={t.borderRadius}
              onChange={e => set({ borderRadius: e.target.value })} placeholder="6px" />
            <Input label="Innenabstand" value={t.padding}
              onChange={e => set({ padding: e.target.value })} placeholder="1rem" />
            <Input label="Abschnittabstand" value={t.sectionSpacing}
              onChange={e => set({ sectionSpacing: e.target.value })} placeholder="1.5rem" />
            <Input label="Rahmenbreite" value={t.borderWidth}
              onChange={e => set({ borderWidth: e.target.value })} placeholder="1px" />
            <Input label="Schatten" value={t.shadow}
              onChange={e => set({ shadow: e.target.value })} placeholder="0 2px 8px rgba(0,0,0,0.4)" />
            <Input label="Bildecken" value={t.imageRadius}
              onChange={e => set({ imageRadius: e.target.value })} placeholder="4px" />
          </div>
        )}

        {section === 'custom' && (
          <Textarea label="Eigenes CSS" value={t.customCSS}
            onChange={e => set({ customCSS: e.target.value })}
            rows={20}
            placeholder="/* Eigenes CSS hier */\n.jb-profile { ... }" />
        )}
      </div>
    </div>
  );
}

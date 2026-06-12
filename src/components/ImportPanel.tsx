'use client';
import React, { useState, useRef } from 'react';
import { useStore } from '@/store/store';
import { importHTML, ImportOptions } from '@/lib/htmlImport';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

const hlOptions = [
  { value: 'h1', label: 'H1' },
  { value: 'h2', label: 'H2' },
];

export function ImportPanel() {
  const store = useStore();
  const project = store.getActiveProject();
  const fileRef = useRef<HTMLInputElement>(null);

  const [htmlInput, setHtmlInput] = useState('');
  const [options, setOptions] = useState<ImportOptions>({
    useHeadingsAsEntries: true,
    entryHeadingLevel: 'h2',
    collectionTitle: 'Importiert',
  });
  const [status, setStatus] = useState('');

  if (!project) return (
    <div className="p-4 text-forge-muted text-sm">Kein Projekt geöffnet.</div>
  );

  const doImport = (html: string) => {
    if (!html.trim()) {
      setStatus('Kein HTML zum Importieren.');
      return;
    }
    try {
      const collection = importHTML(html, options);
      store.importCollection(project.id, collection);
      setHtmlInput('');
      setStatus(`Importiert: "${collection.title}" mit ${collection.entries.length} Einträgen.`);
    } catch (e) {
      setStatus(`Fehler beim Import: ${e}`);
      console.error(e);
    }
    setTimeout(() => setStatus(''), 5000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    doImport(text);
    e.target.value = '';
  };

  const handleJSONImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    store.importProjectJSON(text);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-3 space-y-4">
      {/* Options */}
      <section className="space-y-2">
        <p className="text-xs text-forge-muted uppercase tracking-wide font-medium">Import-Optionen</p>
        <div className="space-y-2 bg-forge-surface border border-forge-border rounded p-3">
          <Input label="Sammlungstitel" value={options.collectionTitle}
            onChange={e => setOptions(o => ({ ...o, collectionTitle: e.target.value }))} />
          <label className="flex items-center gap-2 text-sm text-forge-muted cursor-pointer">
            <input type="checkbox" checked={options.useHeadingsAsEntries}
              onChange={e => setOptions(o => ({ ...o, useHeadingsAsEntries: e.target.checked }))}
              className="accent-forge-accent" />
            Überschriften als Einträge verwenden
          </label>
          {options.useHeadingsAsEntries && (
            <Select label="Eintrag-Überschriftenebene"
              value={options.entryHeadingLevel}
              options={hlOptions}
              onChange={e => setOptions(o => ({ ...o, entryHeadingLevel: e.target.value as 'h1' | 'h2' }))}
            />
          )}
        </div>
      </section>

      {/* File import */}
      <section className="space-y-2">
        <p className="text-xs text-forge-muted uppercase tracking-wide font-medium">Datei-Import</p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
            📂 HTML-Datei importieren (.html / .htm / .txt)
          </Button>
          <input ref={fileRef} type="file" accept=".html,.htm,.txt" className="hidden"
            onChange={handleFileChange} />
        </div>
      </section>

      {/* Paste import */}
      <section className="space-y-2">
        <p className="text-xs text-forge-muted uppercase tracking-wide font-medium">HTML einfügen</p>
        <textarea
          className="w-full bg-forge-bg border border-forge-border rounded px-2.5 py-1.5 text-xs text-forge-text font-mono focus:outline-none focus:border-forge-accent resize-y"
          rows={10}
          value={htmlInput}
          onChange={e => setHtmlInput(e.target.value)}
          placeholder="HTML hier einfügen…"
        />
        <Button variant="primary" size="sm" onClick={() => doImport(htmlInput)}>
          Importieren
        </Button>
      </section>

      {/* Project JSON import */}
      <section className="space-y-2">
        <p className="text-xs text-forge-muted uppercase tracking-wide font-medium">Projekt-JSON importieren</p>
        <div className="flex gap-2">
          <label className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-forge-panel hover:bg-forge-border text-forge-text border border-forge-border rounded cursor-pointer transition-colors">
            📁 Projekt JSON laden
            <input type="file" accept=".json" className="hidden" onChange={handleJSONImport} />
          </label>
        </div>
      </section>

      {status && (
        <div className={`rounded p-2 text-sm ${
          status.startsWith('Fehler') ? 'bg-red-900/30 text-red-300 border border-red-800' :
          'bg-emerald-900/30 text-emerald-300 border border-emerald-800'
        }`}>
          {status}
        </div>
      )}
    </div>
  );
}

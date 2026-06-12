'use client';
import React, { useState } from 'react';
import { useStore } from '@/store/store';
import { renderCollection } from '@/lib/htmlExport';
import { generateCSS } from '@/lib/cssExport';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import type { ExportSettings, Project } from '@/types';

async function downloadZip(project: Project | null) {
  if (!project) return;
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  const style = project.styles.find(s => s.id === project.activeStyleId) || project.styles[0];
  const css = style ? generateCSS(style.tokens) : '';
  const es = project.exportSettings;

  const moduleJson = {
    id: es.moduleId,
    title: es.moduleTitle,
    description: es.moduleDescription,
    version: es.moduleVersion,
    authors: [{ name: es.authorName }],
    compatibility: { minimum: es.minFoundryVersion, verified: es.verifiedFoundryVersion },
    esmodules: ['scripts/main.js'],
    styles: ['styles/journalforge-theme.css'],
    languages: [
      { lang: 'de', name: 'Deutsch', path: 'lang/de.json' },
      { lang: 'en', name: 'English', path: 'lang/en.json' },
    ],
    relationships: {
      systems: [{ id: 'pf2e', type: 'system', compatibility: {} }],
      requires: es.requiresModules.map(m => ({
        id: m.id, type: 'module', manifest: m.manifest,
      })),
    },
  };

  zip.file('module.json', JSON.stringify(moduleJson, null, 2));
  zip.file('styles/journalforge-theme.css', css);
  zip.file('lang/de.json', JSON.stringify({ 'journalforge.title': es.moduleTitle }, null, 2));
  zip.file('lang/en.json', JSON.stringify({ 'journalforge.title': es.moduleTitle }, null, 2));

  const index: { id: string; title: string; file: string }[] = [];
  for (const col of project.collections) {
    const html = renderCollection(col);
    const filename = `${col.id}.html`;
    zip.file(`data/journals/${filename}`, html);
    index.push({ id: col.id, title: col.title, file: filename });
  }

  zip.file('data/index.json', JSON.stringify(index, null, 2));
  zip.file('data/project.json', JSON.stringify(project, null, 2));

  const mainJs = `/* JournalForge Import Helper */
Hooks.once('ready', () => {
  game.journalforgeModule = {
    async importJournalsFromModule({ folderName = 'JournalForge Import', overwrite = false } = {}) {
      const indexResp = await fetch('/modules/${es.moduleId}/data/index.json');
      const index = await indexResp.json();
      let folder = game.folders.find(f => f.name === folderName && f.type === 'JournalEntry');
      if (!folder) {
        folder = await Folder.create({ name: folderName, type: 'JournalEntry' });
      }
      for (const item of index) {
        const existing = game.journal.find(j => j.name === item.title);
        if (existing && !overwrite) continue;
        const resp = await fetch(\`/modules/${es.moduleId}/data/journals/\${item.file}\`);
        const html = await resp.text();
        const data = { name: item.title, folder: folder.id, pages: [{ name: item.title, type: 'text', text: { content: html, format: 1 } }] };
        if (existing && overwrite) await existing.update(data);
        else await JournalEntry.create(data);
      }
      ui.notifications.info('JournalForge: Import abgeschlossen.');
    }
  };
  console.log('JournalForge module loaded.');
});
`;

  zip.file('scripts/main.js', mainJs);
  zip.file('README.md', `# ${es.moduleTitle}\n\n${es.moduleDescription}\n\nGeneriert mit JournalForge.\n`);

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${es.moduleId}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportPanel() {
  const store = useStore();
  const project = store.getActiveProject();
  const collection = store.getActiveCollection();
  const style = store.getActiveStyle();
  const [status, setStatus] = useState('');
  const [zipBuilding, setZipBuilding] = useState(false);

  if (!project) return (
    <div className="p-4 text-forge-muted text-sm">Kein Projekt geöffnet.</div>
  );

  const es = project.exportSettings;
  const update = (updates: Partial<ExportSettings>) => {
    store.updateProject(project.id, {
      exportSettings: { ...es, ...updates },
    });
  };

  const copyCollectionHTML = async () => {
    if (!collection) return;
    try {
      await navigator.clipboard.writeText(renderCollection(collection));
      setStatus('HTML kopiert!');
    } catch { setStatus('Fehler'); }
    setTimeout(() => setStatus(''), 2500);
  };

  const copyAllHTML = async () => {
    const all = project.collections.map(renderCollection).join('\n\n');
    try {
      await navigator.clipboard.writeText(all);
      setStatus('Alle Sammlungen kopiert!');
    } catch { setStatus('Fehler'); }
    setTimeout(() => setStatus(''), 2500);
  };

  const copyCSS = async () => {
    if (!style) return;
    try {
      await navigator.clipboard.writeText(generateCSS(style.tokens));
      setStatus('CSS kopiert!');
    } catch { setStatus('Fehler'); }
    setTimeout(() => setStatus(''), 2500);
  };

  const downloadProjectJSON = () => {
    const json = JSON.stringify(project, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBuildZip = async () => {
    setZipBuilding(true);
    try {
      await downloadZip(project);
      setStatus('ZIP erstellt!');
    } catch (e) {
      setStatus('Fehler beim ZIP-Export');
      console.error(e);
    }
    setZipBuilding(false);
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-3 space-y-4">
      {/* Quick copy */}
      <section className="space-y-2">
        <p className="text-xs text-forge-muted uppercase tracking-wide font-medium">Schnell-Export</p>
        <div className="flex flex-wrap gap-2">
          {collection && (
            <Button variant="secondary" size="sm" onClick={copyCollectionHTML}>
              📋 Aktuelle Sammlung (HTML)
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={copyAllHTML}>
            📋 Alle Sammlungen (HTML)
          </Button>
          <Button variant="secondary" size="sm" onClick={copyCSS}>
            🎨 CSS kopieren
          </Button>
        </div>
        {status && <p className="text-xs text-emerald-400">{status}</p>}
      </section>

      {/* Project export */}
      <section className="space-y-2">
        <p className="text-xs text-forge-muted uppercase tracking-wide font-medium">Projekt</p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={downloadProjectJSON}>
            💾 Projekt als JSON speichern
          </Button>
        </div>
      </section>

      {/* FoundryVTT Module */}
      <section className="space-y-3">
        <p className="text-xs text-forge-muted uppercase tracking-wide font-medium">FoundryVTT Modul ZIP</p>
        <div className="space-y-2 bg-forge-surface border border-forge-border rounded p-3">
          <div className="grid grid-cols-2 gap-2">
            <Input label="Modul-ID" value={es.moduleId}
              onChange={e => update({ moduleId: e.target.value })} placeholder="journalforge-module" />
            <Input label="Titel" value={es.moduleTitle}
              onChange={e => update({ moduleTitle: e.target.value })} />
            <Input label="Version" value={es.moduleVersion}
              onChange={e => update({ moduleVersion: e.target.value })} placeholder="1.0.0" />
            <Input label="Autor" value={es.authorName}
              onChange={e => update({ authorName: e.target.value })} />
            <Input label="Foundry Min-Version" value={es.minFoundryVersion}
              onChange={e => update({ minFoundryVersion: e.target.value })} />
            <Input label="Foundry Verified" value={es.verifiedFoundryVersion}
              onChange={e => update({ verifiedFoundryVersion: e.target.value })} />
          </div>
          <Textarea label="Beschreibung" value={es.moduleDescription}
            onChange={e => update({ moduleDescription: e.target.value })} rows={2} />
          <Button variant="gold" size="md" onClick={handleBuildZip} disabled={zipBuilding}>
            {zipBuilding ? 'Wird erstellt…' : '📦 Modul ZIP herunterladen'}
          </Button>
        </div>
      </section>
    </div>
  );
}

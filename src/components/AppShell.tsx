'use client';
import React, { useState } from 'react';
import { useStore } from '@/store/store';
import { ProjectTree } from './ProjectTree';
import { CollectionEditor } from './CollectionEditor';
import { StyleEditor } from './StyleEditor';
import { ExportPanel } from './ExportPanel';
import { ImportPanel } from './ImportPanel';
import { PreviewPanel } from './PreviewPanel';
import { ProjectModal } from './ProjectModal';
import { Button } from './ui/Button';

type Tab = 'editor' | 'style' | 'export' | 'import';

export function AppShell() {
  const store = useStore();
  const project = store.getActiveProject();
  const collection = store.getActiveCollection();
  const style = store.getActiveStyle();
  const [tab, setTab] = useState<Tab>('editor');
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-forge-bg">
      {/* Left sidebar: Project tree */}
      <div className="w-52 flex-shrink-0 flex flex-col overflow-hidden">
        <ProjectTree onOpenProjectModal={() => setProjectModalOpen(true)} />
      </div>

      {/* Center: Editor */}
      <div className="flex-1 flex flex-col overflow-hidden border-l border-forge-border">
        {/* Tab bar */}
        <div className="flex-shrink-0 flex items-center border-b border-forge-border bg-forge-surface px-2">
          {([
            { id: 'editor', label: 'Editor' },
            { id: 'style', label: 'Stil' },
            { id: 'export', label: 'Export' },
            { id: 'import', label: 'Import' },
          ] as { id: Tab; label: string }[]).map(t => (
            <button
              key={t.id}
              type="button"
              className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-forge-accent text-forge-accent'
                  : 'border-transparent text-forge-muted hover:text-forge-text'
              }`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}

          <div className="flex-1" />

          {/* Project name */}
          {project && (
            <span
              className="text-xs text-forge-muted mr-2 cursor-pointer hover:text-forge-text"
              onClick={() => setProjectModalOpen(true)}
            >
              {project.name}
            </span>
          )}

          {/* Toggle preview */}
          <Button variant="ghost" size="xs" onClick={() => setPreviewVisible(v => !v)}>
            {previewVisible ? '▧' : '▨'}
          </Button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden">
          {tab === 'editor' && (
            project && collection ? (
              <CollectionEditor projectId={project.id} collection={collection} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-forge-muted">
                {!project ? (
                  <>
                    <p className="text-sm">Willkommen bei JournalForge</p>
                    <Button variant="primary" size="md" onClick={() => setProjectModalOpen(true)}>
                      Neues Projekt erstellen
                    </Button>
                  </>
                ) : (
                  <p className="text-sm">Wähle eine Sammlung aus der linken Leiste.</p>
                )}
              </div>
            )
          )}

          {tab === 'style' && project && style && (
            <StyleEditor projectId={project.id} style={style} />
          )}

          {tab === 'export' && <ExportPanel />}

          {tab === 'import' && <ImportPanel />}
        </div>
      </div>

      {/* Right: Preview */}
      {previewVisible && (
        <div className="w-[420px] flex-shrink-0 flex flex-col overflow-hidden border-l border-forge-border">
          <PreviewPanel />
        </div>
      )}

      {/* Project modal */}
      {projectModalOpen && (
        <ProjectModal onClose={() => setProjectModalOpen(false)} />
      )}
    </div>
  );
}

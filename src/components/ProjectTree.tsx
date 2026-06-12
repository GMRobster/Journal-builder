'use client';
import React, { useState } from 'react';
import { useStore } from '@/store/store';
import type { Collection } from '@/types';
import { Button } from './ui/Button';

interface Props {
  onOpenProjectModal: () => void;
}

export function ProjectTree({ onOpenProjectModal }: Props) {
  const {
    projects, activeProjectId, activeCollectionId,
    setActiveProject, setActiveCollection, createCollection, deleteCollection,
    moveCollection, duplicateCollection,
  } = useStore();

  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set([activeProjectId ?? '']));

  const toggleProject = (id: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const [newColName, setNewColName] = useState('');
  const [addingCol, setAddingCol] = useState(false);

  const handleAddCollection = () => {
    if (!activeProjectId) return;
    const name = newColName.trim() || 'Neue Sammlung';
    createCollection(activeProjectId, name);
    setNewColName('');
    setAddingCol(false);
  };

  return (
    <div className="flex flex-col h-full bg-forge-surface border-r border-forge-border">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-forge-border flex-shrink-0">
        <span className="text-xs font-semibold text-forge-gold tracking-wide uppercase">JournalForge</span>
        <Button variant="ghost" size="xs" onClick={onOpenProjectModal} title="Projekte verwalten">
          ⊞
        </Button>
      </div>

      {/* Project list */}
      <div className="flex-1 overflow-y-auto">
        {projects.length === 0 && (
          <div className="p-4 text-center">
            <p className="text-forge-muted text-xs mb-2">Kein Projekt vorhanden</p>
            <Button variant="primary" size="sm" onClick={onOpenProjectModal}>
              + Neues Projekt
            </Button>
          </div>
        )}

        {projects.map(project => (
          <div key={project.id}>
            {/* Project header */}
            <div
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer select-none group ${
                activeProjectId === project.id
                  ? 'bg-forge-panel text-forge-text'
                  : 'text-forge-muted hover:bg-forge-panel/50 hover:text-forge-text'
              }`}
              onClick={() => {
                setActiveProject(project.id);
                toggleProject(project.id);
              }}
            >
              <span className="text-xs flex-shrink-0">
                {expandedProjects.has(project.id) ? '▼' : '▶'}
              </span>
              <span className="text-sm font-medium flex-1 truncate">{project.name}</span>
            </div>

            {/* Collections */}
            {expandedProjects.has(project.id) && (
              <div className="pl-3">
                {project.collections.map((col, idx) => (
                  <CollectionRow
                    key={col.id}
                    collection={col}
                    index={idx}
                    total={project.collections.length}
                    projectId={project.id}
                    isActive={activeCollectionId === col.id && activeProjectId === project.id}
                    onSelect={() => {
                      setActiveProject(project.id);
                      setActiveCollection(col.id === activeCollectionId ? null : col.id);
                    }}
                    onMoveUp={() => moveCollection(project.id, idx, idx - 1)}
                    onMoveDown={() => moveCollection(project.id, idx, idx + 1)}
                    onDuplicate={() => duplicateCollection(project.id, col.id)}
                    onDelete={() => {
                      if (confirm(`Sammlung "${col.title}" löschen?`)) {
                        deleteCollection(project.id, col.id);
                      }
                    }}
                  />
                ))}

                {/* Add collection */}
                {activeProjectId === project.id && (
                  <div className="px-1 py-1">
                    {addingCol ? (
                      <div className="flex gap-1">
                        <input
                          autoFocus
                          className="flex-1 bg-forge-bg border border-forge-border rounded px-2 py-0.5 text-xs text-forge-text focus:outline-none focus:border-forge-accent"
                          value={newColName}
                          onChange={e => setNewColName(e.target.value)}
                          placeholder="Sammlungsname…"
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleAddCollection();
                            if (e.key === 'Escape') setAddingCol(false);
                          }}
                        />
                        <Button variant="primary" size="xs" onClick={handleAddCollection}>✓</Button>
                        <Button variant="ghost" size="xs" onClick={() => setAddingCol(false)}>✗</Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="xs" className="w-full justify-center text-forge-muted"
                        onClick={() => setAddingCol(true)}>
                        + Sammlung
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface ColRowProps {
  collection: Collection;
  index: number;
  total: number;
  projectId: string;
  isActive: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function CollectionRow({ collection, index, total, isActive, onSelect, onMoveUp, onMoveDown, onDuplicate, onDelete }: ColRowProps) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className={`relative flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer text-xs transition-colors ${
        isActive
          ? 'bg-forge-accent/25 text-forge-text'
          : 'text-forge-muted hover:bg-forge-panel hover:text-forge-text'
      }`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onSelect}
    >
      <span className="w-3 flex-shrink-0 text-forge-muted/40">
        {isActive ? '●' : '○'}
      </span>
      <span className="flex-1 truncate">{collection.title || '(kein Titel)'}</span>
      <span className="text-forge-muted/40 text-xs">{collection.entries.length}</span>

      {hover && (
        <div
          className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5 bg-forge-panel border border-forge-border rounded px-0.5"
          onClick={e => e.stopPropagation()}
        >
          <button type="button" className="p-0.5 text-forge-muted/50 hover:text-forge-muted"
            disabled={index === 0} onClick={onMoveUp}>▲</button>
          <button type="button" className="p-0.5 text-forge-muted/50 hover:text-forge-muted"
            disabled={index === total - 1} onClick={onMoveDown}>▼</button>
          <button type="button" className="p-0.5 text-forge-muted hover:text-forge-text"
            onClick={onDuplicate} title="Duplizieren">⎘</button>
          <button type="button" className="p-0.5 text-red-400/60 hover:text-red-400"
            onClick={onDelete} title="Löschen">×</button>
        </div>
      )}
    </div>
  );
}

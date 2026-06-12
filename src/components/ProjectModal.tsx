'use client';
import React, { useState } from 'react';
import { useStore } from '@/store/store';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface Props {
  onClose: () => void;
}

export function ProjectModal({ onClose }: Props) {
  const { projects, createProject, deleteProject, setActiveProject, activeProjectId } = useStore();
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    createProject(name);
    setNewName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="bg-forge-surface border border-forge-border rounded-lg shadow-2xl w-full max-w-md p-4 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-forge-text">Projekte</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>

        {/* Project list */}
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {projects.length === 0 && (
            <p className="text-forge-muted text-sm py-2">Keine Projekte vorhanden.</p>
          )}
          {projects.map(p => (
            <div
              key={p.id}
              className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm transition-colors ${
                activeProjectId === p.id
                  ? 'bg-forge-accent/25 text-forge-text'
                  : 'hover:bg-forge-panel text-forge-muted hover:text-forge-text'
              }`}
            >
              <span
                className="flex-1 truncate"
                onClick={() => { setActiveProject(p.id); onClose(); }}
              >
                {p.name}
              </span>
              <span className="text-xs text-forge-muted/50">
                {p.collections.length} Sammlungen
              </span>
              {projects.length > 1 && (
                <Button variant="danger" size="xs"
                  onClick={() => {
                    if (confirm(`Projekt "${p.name}" löschen?`)) {
                      deleteProject(p.id);
                    }
                  }}>
                  ×
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Create new */}
        <div className="border-t border-forge-border pt-3 space-y-2">
          <p className="text-xs text-forge-muted font-medium">Neues Projekt</p>
          <div className="flex gap-2">
            <Input
              className="flex-1"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Projektname…"
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <Button variant="primary" size="sm" onClick={handleCreate}>Erstellen</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

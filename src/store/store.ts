import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Project, Collection, Entry, Block, JFStyle, StyleTokens,
} from '@/types';
import { defaultStyleTokens, defaultExportSettings } from '@/types';
import { generateId, slugify, moveItem } from '@/lib/utils';

export type EditorTab = 'editor' | 'style' | 'export' | 'import';

export interface AppState {
  projects: Project[];
  activeProjectId: string | null;
  activeCollectionId: string | null;
  activeEntryId: string | null;
  activeBlockId: string | null;
  editorTab: EditorTab;
  tagFilter: string[];
  statusMessage: string;

  createProject: (name: string) => void;
  updateProject: (id: string, updates: Partial<Omit<Project, 'id'>>) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string | null) => void;
  importProjectJSON: (json: string) => void;

  createCollection: (projectId: string, title: string) => void;
  updateCollection: (projectId: string, collectionId: string, updates: Partial<Collection>) => void;
  deleteCollection: (projectId: string, collectionId: string) => void;
  moveCollection: (projectId: string, from: number, to: number) => void;
  duplicateCollection: (projectId: string, collectionId: string) => void;
  setActiveCollection: (id: string | null) => void;

  createEntry: (projectId: string, collectionId: string, title: string) => void;
  updateEntry: (projectId: string, collectionId: string, entryId: string, updates: Partial<Entry>) => void;
  deleteEntry: (projectId: string, collectionId: string, entryId: string) => void;
  moveEntry: (projectId: string, collectionId: string, from: number, to: number) => void;
  duplicateEntry: (projectId: string, collectionId: string, entryId: string) => void;
  sortEntries: (projectId: string, collectionId: string, mode: 'az' | 'za' | 'tags') => void;
  setActiveEntry: (id: string | null) => void;

  addBlock: (projectId: string, collectionId: string, entryId: string, block: Block) => void;
  updateBlock: (projectId: string, collectionId: string, entryId: string, blockId: string, updates: Partial<Block>) => void;
  deleteBlock: (projectId: string, collectionId: string, entryId: string, blockId: string) => void;
  moveBlock: (projectId: string, collectionId: string, entryId: string, from: number, to: number) => void;
  duplicateBlock: (projectId: string, collectionId: string, entryId: string, blockId: string) => void;
  setActiveBlock: (id: string | null) => void;
  sortProfileBlocks: (projectId: string, collectionId: string, entryId: string, mode: 'az' | 'za' | 'subtitle' | 'tags') => void;

  createStyle: (projectId: string, name: string) => void;
  updateStyle: (projectId: string, styleId: string, updates: Partial<JFStyle>) => void;
  updateStyleTokens: (projectId: string, styleId: string, tokens: Partial<StyleTokens>) => void;
  deleteStyle: (projectId: string, styleId: string) => void;
  setActiveStyle: (projectId: string, styleId: string) => void;
  duplicateStyle: (projectId: string, styleId: string) => void;

  setEditorTab: (tab: EditorTab) => void;
  setTagFilter: (tags: string[]) => void;
  setStatusMessage: (msg: string) => void;

  getActiveProject: () => Project | null;
  getActiveCollection: () => Collection | null;
  getActiveEntry: () => Entry | null;
  getActiveStyle: () => JFStyle | null;

  importCollection: (projectId: string, collection: Collection) => void;
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function newProject(name: string): Project {
  const defaultStyle: JFStyle = {
    id: generateId(),
    name: 'Standard',
    tokens: defaultStyleTokens(),
  };
  return {
    id: generateId(),
    name,
    collections: [],
    styles: [defaultStyle],
    activeStyleId: defaultStyle.id,
    exportSettings: defaultExportSettings(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function updateTs(project: Project): Project {
  return { ...project, updatedAt: new Date().toISOString() };
}

function patchProject(projects: Project[], id: string, fn: (p: Project) => Project): Project[] {
  return projects.map(p => (p.id === id ? updateTs(fn(p)) : p));
}

function patchCollection(
  projects: Project[], pid: string, cid: string, fn: (c: Collection) => Collection
): Project[] {
  return patchProject(projects, pid, p => ({
    ...p,
    collections: p.collections.map(c => (c.id === cid ? fn(c) : c)),
  }));
}

function patchEntry(
  projects: Project[], pid: string, cid: string, eid: string, fn: (e: Entry) => Entry
): Project[] {
  return patchCollection(projects, pid, cid, c => ({
    ...c,
    entries: c.entries.map(e => (e.id === eid ? fn(e) : e)),
  }));
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,
      activeCollectionId: null,
      activeEntryId: null,
      activeBlockId: null,
      editorTab: 'editor',
      tagFilter: [],
      statusMessage: '',

      createProject: (name) => {
        const project = newProject(name);
        set(s => ({
          projects: [...s.projects, project],
          activeProjectId: project.id,
          activeCollectionId: null,
          activeEntryId: null,
          activeBlockId: null,
        }));
      },

      updateProject: (id, updates) =>
        set(s => ({ projects: patchProject(s.projects, id, p => ({ ...p, ...updates })) })),

      deleteProject: (id) =>
        set(s => ({
          projects: s.projects.filter(p => p.id !== id),
          activeProjectId: s.activeProjectId === id ? null : s.activeProjectId,
        })),

      setActiveProject: (id) =>
        set({ activeProjectId: id, activeCollectionId: null, activeEntryId: null, activeBlockId: null }),

      importProjectJSON: (json) => {
        try {
          const project: Project = JSON.parse(json);
          project.id = generateId();
          project.createdAt = new Date().toISOString();
          project.updatedAt = new Date().toISOString();
          set(s => ({ projects: [...s.projects, project], activeProjectId: project.id }));
        } catch {
          set({ statusMessage: 'Fehler: Ungültiges JSON' });
        }
      },

      createCollection: (projectId, title) => {
        const col: Collection = { id: generateId(), title, description: '', template: '', tags: [], entries: [] };
        set(s => ({
          projects: patchProject(s.projects, projectId, p => ({ ...p, collections: [...p.collections, col] })),
          activeCollectionId: col.id,
          activeEntryId: null,
          activeBlockId: null,
        }));
      },

      updateCollection: (projectId, collectionId, updates) =>
        set(s => ({ projects: patchCollection(s.projects, projectId, collectionId, c => ({ ...c, ...updates })) })),

      deleteCollection: (projectId, collectionId) =>
        set(s => ({
          projects: patchProject(s.projects, projectId, p => ({ ...p, collections: p.collections.filter(c => c.id !== collectionId) })),
          activeCollectionId: s.activeCollectionId === collectionId ? null : s.activeCollectionId,
        })),

      moveCollection: (projectId, from, to) =>
        set(s => ({ projects: patchProject(s.projects, projectId, p => ({ ...p, collections: moveItem(p.collections, from, to) })) })),

      duplicateCollection: (projectId, collectionId) => {
        const project = get().projects.find(p => p.id === projectId);
        const col = project?.collections.find(c => c.id === collectionId);
        if (!col) return;
        const copy = deepClone(col);
        copy.id = generateId();
        copy.title = col.title + ' (Kopie)';
        copy.entries = copy.entries.map((e: Entry) => ({ ...e, id: generateId() }));
        set(s => ({ projects: patchProject(s.projects, projectId, p => ({ ...p, collections: [...p.collections, copy] })) }));
      },

      setActiveCollection: (id) => set({ activeCollectionId: id, activeEntryId: null, activeBlockId: null }),

      createEntry: (projectId, collectionId, title) => {
        const project = get().projects.find(p => p.id === projectId);
        const col = project?.collections.find(c => c.id === collectionId);
        const order = col ? col.entries.length : 0;
        const entry: Entry = {
          id: generateId(), title, slug: slugify(title), tags: [], order,
          exportTitleAsHeading: true, headingLevel: 'h2', blocks: [],
        };
        set(s => ({
          projects: patchCollection(s.projects, projectId, collectionId, c => ({ ...c, entries: [...c.entries, entry] })),
          activeEntryId: entry.id,
          activeBlockId: null,
        }));
      },

      updateEntry: (projectId, collectionId, entryId, updates) =>
        set(s => ({ projects: patchEntry(s.projects, projectId, collectionId, entryId, e => ({ ...e, ...updates })) })),

      deleteEntry: (projectId, collectionId, entryId) =>
        set(s => ({
          projects: patchCollection(s.projects, projectId, collectionId, c => ({ ...c, entries: c.entries.filter(e => e.id !== entryId) })),
          activeEntryId: s.activeEntryId === entryId ? null : s.activeEntryId,
        })),

      moveEntry: (projectId, collectionId, from, to) =>
        set(s => ({
          projects: patchCollection(s.projects, projectId, collectionId, c => {
            const moved = moveItem(c.entries, from, to).map((e, i) => ({ ...e, order: i }));
            return { ...c, entries: moved };
          }),
        })),

      duplicateEntry: (projectId, collectionId, entryId) => {
        const project = get().projects.find(p => p.id === projectId);
        const col = project?.collections.find(c => c.id === collectionId);
        const entry = col?.entries.find(e => e.id === entryId);
        if (!entry) return;
        const copy = deepClone(entry);
        copy.id = generateId();
        copy.title = entry.title + ' (Kopie)';
        copy.slug = slugify(copy.title);
        copy.order = col!.entries.length;
        copy.blocks = copy.blocks.map((b: Block) => ({ ...b, id: generateId() }));
        set(s => ({ projects: patchCollection(s.projects, projectId, collectionId, c => ({ ...c, entries: [...c.entries, copy] })) }));
      },

      sortEntries: (projectId, collectionId, mode) =>
        set(s => ({
          projects: patchCollection(s.projects, projectId, collectionId, c => {
            let sorted = [...c.entries];
            if (mode === 'az') sorted.sort((a, b) => a.title.localeCompare(b.title));
            else if (mode === 'za') sorted.sort((a, b) => b.title.localeCompare(a.title));
            else sorted.sort((a, b) => a.tags.join(',').localeCompare(b.tags.join(',')));
            return { ...c, entries: sorted.map((e, i) => ({ ...e, order: i })) };
          }),
        })),

      setActiveEntry: (id) => set({ activeEntryId: id, activeBlockId: null }),

      addBlock: (projectId, collectionId, entryId, block) =>
        set(s => ({
          projects: patchEntry(s.projects, projectId, collectionId, entryId, e => ({ ...e, blocks: [...e.blocks, block] })),
          activeBlockId: block.id,
        })),

      updateBlock: (projectId, collectionId, entryId, blockId, updates) =>
        set(s => ({
          projects: patchEntry(s.projects, projectId, collectionId, entryId, e => ({
            ...e,
            blocks: e.blocks.map(b => (b.id === blockId ? { ...b, ...updates } as Block : b)),
          })),
        })),

      deleteBlock: (projectId, collectionId, entryId, blockId) =>
        set(s => ({
          projects: patchEntry(s.projects, projectId, collectionId, entryId, e => ({ ...e, blocks: e.blocks.filter(b => b.id !== blockId) })),
          activeBlockId: s.activeBlockId === blockId ? null : s.activeBlockId,
        })),

      moveBlock: (projectId, collectionId, entryId, from, to) =>
        set(s => ({
          projects: patchEntry(s.projects, projectId, collectionId, entryId, e => ({ ...e, blocks: moveItem(e.blocks, from, to) })),
        })),

      duplicateBlock: (projectId, collectionId, entryId, blockId) => {
        const project = get().projects.find(p => p.id === projectId);
        const col = project?.collections.find(c => c.id === collectionId);
        const entry = col?.entries.find(e => e.id === entryId);
        const block = entry?.blocks.find(b => b.id === blockId);
        if (!block) return;
        const copy = { ...deepClone(block), id: generateId() };
        const idx = entry!.blocks.findIndex(b => b.id === blockId);
        set(s => ({
          projects: patchEntry(s.projects, projectId, collectionId, entryId, e => {
            const blocks = [...e.blocks];
            blocks.splice(idx + 1, 0, copy as Block);
            return { ...e, blocks };
          }),
        }));
      },

      setActiveBlock: (id) => set({ activeBlockId: id }),

      sortProfileBlocks: (projectId, collectionId, entryId, mode) =>
        set(s => ({
          projects: patchEntry(s.projects, projectId, collectionId, entryId, e => {
            const nonProfiles = e.blocks.filter(b => b.type !== 'profile');
            const profiles = e.blocks.filter(b => b.type === 'profile');
            type PB = typeof profiles[0] & { type: 'profile'; name: string; subtitle: string; tags: string[] };
            const sorted = [...profiles] as PB[];
            if (mode === 'az') sorted.sort((a, b) => a.name.localeCompare(b.name));
            else if (mode === 'za') sorted.sort((a, b) => b.name.localeCompare(a.name));
            else if (mode === 'subtitle') sorted.sort((a, b) => a.subtitle.localeCompare(b.subtitle));
            else sorted.sort((a, b) => a.tags.join(',').localeCompare(b.tags.join(',')));
            return { ...e, blocks: [...nonProfiles, ...sorted] };
          }),
        })),

      createStyle: (projectId, name) => {
        const style: JFStyle = { id: generateId(), name, tokens: defaultStyleTokens() };
        set(s => ({ projects: patchProject(s.projects, projectId, p => ({ ...p, styles: [...p.styles, style], activeStyleId: style.id })) }));
      },

      updateStyle: (projectId, styleId, updates) =>
        set(s => ({ projects: patchProject(s.projects, projectId, p => ({ ...p, styles: p.styles.map(st => (st.id === styleId ? { ...st, ...updates } : st)) })) })),

      updateStyleTokens: (projectId, styleId, tokens) =>
        set(s => ({
          projects: patchProject(s.projects, projectId, p => ({
            ...p,
            styles: p.styles.map(st => st.id === styleId ? { ...st, tokens: { ...st.tokens, ...tokens } } : st),
          })),
        })),

      deleteStyle: (projectId, styleId) =>
        set(s => ({ projects: patchProject(s.projects, projectId, p => ({ ...p, styles: p.styles.filter(st => st.id !== styleId) })) })),

      setActiveStyle: (projectId, styleId) =>
        set(s => ({ projects: patchProject(s.projects, projectId, p => ({ ...p, activeStyleId: styleId })) })),

      duplicateStyle: (projectId, styleId) => {
        const project = get().projects.find(p => p.id === projectId);
        const style = project?.styles.find(s => s.id === styleId);
        if (!style) return;
        const copy: JFStyle = { ...deepClone(style), id: generateId(), name: style.name + ' (Kopie)' };
        set(s => ({ projects: patchProject(s.projects, projectId, p => ({ ...p, styles: [...p.styles, copy] })) }));
      },

      setEditorTab: (tab) => set({ editorTab: tab }),
      setTagFilter: (tags) => set({ tagFilter: tags }),
      setStatusMessage: (msg) => {
        set({ statusMessage: msg });
        if (msg) setTimeout(() => set({ statusMessage: '' }), 3000);
      },

      getActiveProject: () => { const s = get(); return s.projects.find(p => p.id === s.activeProjectId) ?? null; },
      getActiveCollection: () => {
        const s = get();
        const project = s.projects.find(p => p.id === s.activeProjectId);
        return project?.collections.find(c => c.id === s.activeCollectionId) ?? null;
      },
      getActiveEntry: () => {
        const s = get();
        const project = s.projects.find(p => p.id === s.activeProjectId);
        const col = project?.collections.find(c => c.id === s.activeCollectionId);
        return col?.entries.find(e => e.id === s.activeEntryId) ?? null;
      },
      getActiveStyle: () => {
        const s = get();
        const project = s.projects.find(p => p.id === s.activeProjectId);
        if (!project) return null;
        return project.styles.find(st => st.id === project.activeStyleId) ?? project.styles[0] ?? null;
      },

      importCollection: (projectId, collection) =>
        set(s => ({
          projects: patchProject(s.projects, projectId, p => ({ ...p, collections: [...p.collections, collection] })),
          activeCollectionId: collection.id,
          activeEntryId: null,
          activeBlockId: null,
        })),
    }),
    {
      name: 'journalforge-store',
      partialize: (state) => ({ projects: state.projects, activeProjectId: state.activeProjectId }),
    }
  )
);

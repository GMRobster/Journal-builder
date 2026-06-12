'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/store';
import { renderCollection } from '@/lib/htmlExport';
import { generateCSS, generateFullDocument } from '@/lib/cssExport';
import { Button } from './ui/Button';

export function PreviewPanel() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [copyStatus, setCopyStatus] = useState('');
  const [previewMode, setPreviewMode] = useState<'collection' | 'entry'>('collection');

  const store = useStore();
  const project = store.getActiveProject();
  const collection = store.getActiveCollection();
  const entry = store.getActiveEntry();
  const style = store.getActiveStyle();

  useEffect(() => {
    if (!iframeRef.current) return;
    if (!collection || !style) {
      iframeRef.current.srcdoc = '<html><body style="background:#0f1117;color:#6b7594;font-family:sans-serif;padding:2rem;text-align:center;"><p>Wähle eine Sammlung aus.</p></body></html>';
      return;
    }

    const css = generateCSS(style.tokens);
    let html: string;

    if (previewMode === 'entry' && entry) {
      const singleCollection = { ...collection, entries: [entry] };
      html = renderCollection(singleCollection);
    } else {
      html = renderCollection(collection);
    }

    const doc = generateFullDocument(html, css, collection.title);
    iframeRef.current.srcdoc = doc;
  }, [collection, entry, style, previewMode, store]);

  const copyHTML = async () => {
    if (!collection) return;
    const html = renderCollection(collection);
    try {
      await navigator.clipboard.writeText(html);
      setCopyStatus('HTML kopiert!');
    } catch {
      setCopyStatus('Fehler beim Kopieren');
    }
    setTimeout(() => setCopyStatus(''), 2500);
  };

  const copyCSS = async () => {
    if (!style) return;
    const css = generateCSS(style.tokens);
    try {
      await navigator.clipboard.writeText(css);
      setCopyStatus('CSS kopiert!');
    } catch {
      setCopyStatus('Fehler beim Kopieren');
    }
    setTimeout(() => setCopyStatus(''), 2500);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center gap-2 p-2 border-b border-forge-border bg-forge-surface">
        <span className="text-xs text-forge-muted font-medium">Vorschau</span>
        <div className="flex gap-1">
          <Button
            variant={previewMode === 'collection' ? 'primary' : 'ghost'}
            size="xs"
            onClick={() => setPreviewMode('collection')}
          >Sammlung</Button>
          {entry && (
            <Button
              variant={previewMode === 'entry' ? 'primary' : 'ghost'}
              size="xs"
              onClick={() => setPreviewMode('entry')}
            >Eintrag</Button>
          )}
        </div>
        <div className="flex-1" />
        <Button variant="secondary" size="xs" onClick={copyHTML}>HTML kopieren</Button>
        <Button variant="secondary" size="xs" onClick={copyCSS}>CSS kopieren</Button>
        {copyStatus && (
          <span className="text-xs text-emerald-400 animate-pulse">{copyStatus}</span>
        )}
      </div>

      {/* iframe */}
      <iframe
        ref={iframeRef}
        className="flex-1 w-full border-0 bg-[#0f1117]"
        title="JournalForge Vorschau"
        sandbox="allow-same-origin"
      />
    </div>
  );
}

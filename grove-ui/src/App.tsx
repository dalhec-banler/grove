import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  FileMeta, View, Share, Selection, Update, InboxEntry,
  CanopyEntry, CanopyConfig, CanopyListing, CanopyMode,
} from './types';
import {
  scryFiles, scryViews, scryShares, scryInbox, scryTrusted,
  scryCanopyEntries, scryCanopyConfig, scryCanopyPeers,
  poke, subscribeUpdates, fileToBase64, inferMark,
} from './api';
import Sidebar from './components/Sidebar';
import FileList from './components/FileList';
import FileGrid from './components/FileGrid';
import UploadZone from './components/UploadZone';
import ViewModal from './components/ViewModal';
import ShareModal from './components/ShareModal';
import FileDetails from './components/FileDetails';
import BulkTagModal from './components/BulkTagModal';
import InboxView from './components/InboxView';
import CanopyView from './components/CanopyView';
import PublishModal from './components/PublishModal';

type ViewMode = 'list' | 'grid';

export default function App() {
  const [files, setFiles] = useState<Map<string, FileMeta>>(new Map());
  const [views, setViews] = useState<Map<string, View>>(new Map());
  const [shares, setShares] = useState<Map<string, Share>>(new Map());
  const [inbox, setInbox] = useState<Map<string, InboxEntry>>(new Map());
  const [trusted, setTrusted] = useState<Set<string>>(new Set());
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [canopyEntries, setCanopyEntries] = useState<Map<string, CanopyEntry>>(new Map());
  const [canopyConfig, setCanopyConfig] = useState<CanopyConfig>({ mode: 'open', name: '', friends: [] });
  const [canopyPeers, setCanopyPeers] = useState<Map<string, CanopyListing>>(new Map());
  const [selection, setSelection] = useState<Selection>({ kind: 'all' });
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingView, setEditingView] = useState<View | null>(null);
  const [shareDialog, setShareDialog] = useState<Share | null>(null);
  const [pendingShareFor, setPendingShareFor] = useState<string | null>(null);
  const [publishingFile, setPublishingFile] = useState<FileMeta | null>(null);
  const [connected, setConnected] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    (localStorage.getItem('grove:viewMode') as ViewMode) || 'grid'
  );
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [bulkTagIds, setBulkTagIds] = useState<string[] | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const dragCounter = useRef(0);
  const uploadTrackingRef = useRef<Set<string> | null>(null);
  const uploadCollectedRef = useRef<string[]>([]);

  useEffect(() => { localStorage.setItem('grove:viewMode', viewMode); }, [viewMode]);

  useEffect(() => {
    (async () => {
      const [f, v, s, ib, tr, ce, cc, cp] = await Promise.all([
        scryFiles(), scryViews(), scryShares(), scryInbox(), scryTrusted(),
        scryCanopyEntries(), scryCanopyConfig(), scryCanopyPeers(),
      ]);
      setFiles(new Map(f.map((m) => [m.id, m])));
      setViews(new Map(v.map((w) => [w.name, w])));
      setShares(new Map(s.map((sh) => [sh.token, sh])));
      setInbox(new Map(ib.map((e) => [`${e.owner}/${e.fileId}`, e])));
      setTrusted(new Set(tr.trusted));
      setBlocked(new Set(tr.blocked));
      setCanopyEntries(new Map(ce.map((e) => [e.id, e])));
      setCanopyConfig(cc);
      setCanopyPeers(new Map(cp.map((l) => [l.host, l])));
      setConnected(true);
    })().catch((e) => console.error('initial load failed', e));
  }, []);

  useEffect(() => {
    const sub = subscribeUpdates(handleUpdate);
    return () => { sub.then(() => {}); };
  }, []);

  const handleUpdate = useCallback((u: Update) => {
    switch (u.type) {
      case 'fileAdded':
      case 'fileUpdated': {
        setFiles((prev) => {
          const existing = prev.get(u.fileId);
          const meta: FileMeta = {
            id: u.fileId, name: u.name, fileMark: u.fileMark, size: u.size,
            tags: u.tags, created: u.created, modified: u.modified,
            description: u.description, starred: u.starred,
            allowed: existing?.allowed ?? [],
          };
          return new Map(prev).set(meta.id, meta);
        });
        if (u.type === 'fileAdded' && uploadTrackingRef.current) {
          uploadCollectedRef.current.push(u.fileId);
        }
        break;
      }
      case 'allowedUpdated':
        setFiles((prev) => {
          const fm = prev.get(u.fileId);
          if (!fm) return prev;
          return new Map(prev).set(u.fileId, { ...fm, allowed: u.ships });
        });
        break;
      case 'fileRemoved':
        setFiles((prev) => { const n = new Map(prev); n.delete(u.fileId); return n; });
        setShares((prev) => {
          const n = new Map(prev);
          for (const [k, sh] of n) if (sh.fileId === u.fileId) n.delete(k);
          return n;
        });
        break;
      case 'viewAdded':
        setViews((prev) => new Map(prev).set(u.name, { name: u.name, tags: u.tags, color: u.color }));
        break;
      case 'viewRemoved':
        setViews((prev) => { const n = new Map(prev); n.delete(u.name); return n; });
        break;
      case 'shareAdded': {
        setFiles((prev) => {
          const fm = prev.get(u.fileId);
          if (fm) {
            const sh: Share = { token: u.token, fileId: u.fileId, name: fm.name };
            setShares((ps) => new Map(ps).set(u.token, sh));
            setPendingShareFor((pending) => {
              if (pending === u.fileId) {
                setShareDialog(sh);
                return null;
              }
              return pending;
            });
          }
          return prev;
        });
        break;
      }
      case 'shareRemoved':
        setShares((prev) => { const n = new Map(prev); n.delete(u.token); return n; });
        break;
      case 'inboxAdded':
      case 'inboxUpdated':
        setInbox((prev) => new Map(prev).set(`${u.entry.owner}/${u.entry.fileId}`, u.entry));
        break;
      case 'inboxRemoved':
        setInbox((prev) => { const n = new Map(prev); n.delete(`${u.owner}/${u.fileId}`); return n; });
        break;
      case 'trustedUpdated':
        setTrusted(new Set(u.trusted));
        setBlocked(new Set(u.blocked));
        break;
      case 'cacheUpdated':
        setInbox((prev) => {
          const k = `${u.owner}/${u.meta.id}`;
          const ent = prev.get(k);
          if (!ent) return prev;
          return new Map(prev).set(k, { ...ent, cached: true });
        });
        break;
      case 'cacheRemoved':
        setInbox((prev) => {
          const k = `${u.owner}/${u.fileId}`;
          const ent = prev.get(k);
          if (!ent) return prev;
          return new Map(prev).set(k, { ...ent, cached: false });
        });
        break;
      case 'canopyEntryAdded':
        setCanopyEntries((prev) => new Map(prev).set(u.entry.id, u.entry));
        break;
      case 'canopyEntryRemoved':
        setCanopyEntries((prev) => { const n = new Map(prev); n.delete(u.fileId); return n; });
        break;
      case 'canopyConfigUpdated':
        setCanopyConfig(u.config);
        break;
      case 'canopyPeerUpdated':
        setCanopyPeers((prev) => new Map(prev).set(u.listing.host, u.listing));
        break;
      case 'canopyPeerRemoved':
        setCanopyPeers((prev) => { const n = new Map(prev); n.delete(u.host); return n; });
        break;
    }
  }, []);

  const uploadFiles = useCallback(async (list: FileList | File[]) => {
    const files = Array.from(list);
    if (files.length === 0) return;
    uploadTrackingRef.current = new Set();
    uploadCollectedRef.current = [];
    setUploadBusy(true);
    setUploadProgress({ done: 0, total: files.length });
    try {
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const data = await fileToBase64(f);
        await poke({
          upload: { name: f.name, 'file-mark': inferMark(f.name), data, tags: [] },
        });
        setUploadProgress({ done: i + 1, total: files.length });
      }
      await new Promise((r) => setTimeout(r, 400));
      const collected = [...uploadCollectedRef.current];
      if (collected.length > 0) setBulkTagIds(collected);
    } catch (e) {
      console.error('upload failed', e);
      alert(`Upload failed: ${(e as Error).message ?? e}`);
    } finally {
      uploadTrackingRef.current = null;
      uploadCollectedRef.current = [];
      setUploadBusy(false);
      setUploadProgress(null);
    }
  }, []);

  const tagCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const f of files.values()) for (const t of f.tags) m.set(t, (m.get(t) ?? 0) + 1);
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [files]);

  const visibleFiles = useMemo(() => {
    let list = Array.from(files.values()).sort((a, b) => b.modified.localeCompare(a.modified));
    if (selection.kind === 'starred') list = list.filter((f) => f.starred);
    else if (selection.kind === 'view') {
      const view = views.get(selection.name);
      if (!view) list = [];
      else if (view.tags.length > 0) list = list.filter((f) => view.tags.every((t) => f.tags.includes(t)));
    } else if (selection.kind === 'tag') {
      list = list.filter((f) => f.tags.includes(selection.name));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((f) =>
        f.name.toLowerCase().includes(q) ||
        f.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [files, views, selection, search]);

  const activeFile = activeFileId ? files.get(activeFileId) ?? null : null;
  const shareForActive = useMemo(() => {
    if (!activeFile) return null;
    for (const sh of shares.values()) if (sh.fileId === activeFile.id) return sh;
    return null;
  }, [activeFile, shares]);

  const openShareFor = useCallback((fileId: string) => {
    for (const sh of shares.values()) {
      if (sh.fileId === fileId) { setShareDialog(sh); return; }
    }
    setPendingShareFor(fileId);
    poke({ share: { id: fileId } }).catch((e) => {
      console.error('share poke failed', e);
      setPendingShareFor(null);
    });
  }, [shares]);

  const onDragEnter = (e: React.DragEvent) => {
    if (!e.dataTransfer?.types?.includes('Files')) return;
    e.preventDefault();
    dragCounter.current++;
    setDragActive(true);
  };
  const onDragOver = (e: React.DragEvent) => {
    if (!e.dataTransfer?.types?.includes('Files')) return;
    e.preventDefault();
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) setDragActive(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragActive(false);
    const f = e.dataTransfer?.files;
    if (f && f.length > 0) uploadFiles(f);
  };

  const bulkTagFiles = bulkTagIds
    ? bulkTagIds.map((id) => files.get(id)).filter((f): f is FileMeta => !!f)
    : [];

  const canopyPeerList = useMemo(
    () => Array.from(canopyPeers.keys()).sort(),
    [canopyPeers]
  );

  const isCanopySelection =
    selection.kind === 'canopy-mine' || selection.kind === 'canopy-browse' || selection.kind === 'canopy-peer';

  const activeTitle =
    selection.kind === 'all' ? 'All files' :
    selection.kind === 'starred' ? 'Starred' :
    selection.kind === 'inbox' ? 'Shared with me' :
    selection.kind === 'canopy-mine' ? 'My canopy' :
    selection.kind === 'canopy-browse' ? 'Browse canopies' :
    selection.kind === 'canopy-peer' ? (canopyPeers.get(selection.ship)?.name || selection.ship) :
    selection.kind === 'view' ? selection.name :
    selection.kind === 'tag' ? `#${selection.name}` : '';

  return (
    <div
      className="flex h-full relative"
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <Sidebar
        views={Array.from(views.values())}
        tagCounts={tagCounts}
        selection={selection}
        onSelect={setSelection}
        onNewView={() => { setEditingView(null); setShowViewModal(true); }}
        onEditView={(v) => { setEditingView(v); setShowViewModal(true); }}
        onDeleteView={(v) => poke({ rmview: { name: v.name } })}
        counts={{
          all: files.size,
          starred: Array.from(files.values()).filter((f) => f.starred).length,
          inbox: inbox.size,
          inboxPending: Array.from(inbox.values()).filter((e) => !e.accepted).length,
          canopy: canopyEntries.size,
        }}
        connected={connected}
        shipName={window.ship ?? ''}
        canopyPeers={canopyPeerList}
        onUnsubscribeCanopy={(ship) => {
          poke({ 'unsubscribe-from': { who: ship } });
          if (selection.kind === 'canopy-peer' && selection.ship === ship) {
            setSelection({ kind: 'canopy-browse' });
          }
        }}
      />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center px-6 gap-4 bg-surface">
          <h1 className="text-lg font-medium min-w-0 truncate">
            {selection.kind === 'view' ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: views.get(selection.name)?.color ?? '#888' }} />
                {selection.name}
              </span>
            ) : selection.kind === 'canopy-peer' ? (
              <span className="flex items-center gap-2">
                <span>{activeTitle}</span>
                <span className="text-xs text-faint font-mono font-normal">{selection.ship}</span>
              </span>
            ) : activeTitle}
          </h1>
          {!isCanopySelection && selection.kind !== 'inbox' && (
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files & tags…"
              className="flex-1 max-w-md border border-border rounded px-3 py-1.5 text-sm"
            />
          )}
          <div className="ml-auto flex items-center gap-3">
            {!isCanopySelection && selection.kind !== 'inbox' && (
              <div className="flex border border-border rounded overflow-hidden text-xs">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-2 py-1 ${viewMode === 'list' ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-bg'}`}
                >List</button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2 py-1 border-l border-border ${viewMode === 'grid' ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-bg'}`}
                >Grid</button>
              </div>
            )}
            <UploadZone busy={uploadBusy} progress={uploadProgress} onFiles={uploadFiles} />
          </div>
        </header>
        <div className="flex-1 flex min-h-0">
          {selection.kind === 'inbox' ? (
            <InboxView
              entries={Array.from(inbox.values())}
              trusted={trusted}
              blocked={blocked}
              onAccept={(e) => poke({ 'accept-offer': { owner: e.owner, id: e.fileId } })}
              onDecline={(e) => poke({ 'decline-offer': { owner: e.owner, id: e.fileId } })}
              onTrust={(s) => poke({ 'trust-ship': { who: s } })}
              onUntrust={(s) => poke({ 'untrust-ship': { who: s } })}
              onBlock={(s) => poke({ 'block-ship': { who: s } })}
              onUnblock={(s) => poke({ 'unblock-ship': { who: s } })}
              onFetch={(e) => poke({ fetch: { owner: e.owner, id: e.fileId } })}
              onPlant={(e) => poke({ plant: { owner: e.owner, id: e.fileId } })}
              onDropCache={(e) => poke({ 'drop-cache': { owner: e.owner, id: e.fileId } })}
            />
          ) : selection.kind === 'canopy-mine' ? (
            <CanopyView
              kind="mine"
              entries={Array.from(canopyEntries.values())}
              config={canopyConfig}
              onUnpublish={(id) => poke({ unpublish: { id } })}
              onSetMode={(m: CanopyMode) => poke({ 'set-canopy-mode': { mode: m } })}
              onSetName={(name) => poke({ 'set-canopy-name': { name } })}
              onAddFriend={(who) => poke({ 'add-friend': { who } })}
              onRemoveFriend={(who) => poke({ 'remove-friend': { who } })}
            />
          ) : selection.kind === 'canopy-browse' ? (
            <CanopyView
              kind="browse"
              subscribed={new Set(canopyPeers.keys())}
              onSubscribe={(ship) => {
                poke({ 'subscribe-to': { who: ship } });
                setSelection({ kind: 'canopy-peer', ship });
              }}
            />
          ) : selection.kind === 'canopy-peer' ? (
            <CanopyView
              kind="peer"
              host={selection.ship}
              listing={canopyPeers.get(selection.ship) ?? null}
              cache={inbox}
              onFetch={(host, id) => poke({ fetch: { owner: host, id } })}
              onPlant={(host, id) => poke({ plant: { owner: host, id } })}
              onDropCache={(host, id) => poke({ 'drop-cache': { owner: host, id } })}
              onUnsubscribe={(ship) => {
                poke({ 'unsubscribe-from': { who: ship } });
                setSelection({ kind: 'canopy-browse' });
              }}
            />
          ) : viewMode === 'list' ? (
            <FileList
              files={visibleFiles}
              activeId={activeFileId}
              onSelect={setActiveFileId}
              onToggleStar={(id) => poke({ 'toggle-star': { id } })}
              onShare={openShareFor}
              onDelete={(id) => {
                if (!confirm('Delete this file?')) return;
                poke({ delete: { id } });
                if (activeFileId === id) setActiveFileId(null);
              }}
            />
          ) : (
            <FileGrid
              files={visibleFiles}
              activeId={activeFileId}
              onSelect={setActiveFileId}
              onToggleStar={(id) => poke({ 'toggle-star': { id } })}
              onShare={openShareFor}
              onDelete={(id) => {
                if (!confirm('Delete this file?')) return;
                poke({ delete: { id } });
                if (activeFileId === id) setActiveFileId(null);
              }}
            />
          )}
          {activeFile && !isCanopySelection && (
            <FileDetails
              file={activeFile}
              share={shareForActive}
              published={canopyEntries.has(activeFile.id)}
              onClose={() => setActiveFileId(null)}
              onRename={(name) => poke({ rename: { id: activeFile.id, name } })}
              onAddTags={(tags) => poke({ 'add-tags': { id: activeFile.id, tags } })}
              onRemoveTags={(tags) => poke({ 'remove-tags': { id: activeFile.id, tags } })}
              onShare={() => openShareFor(activeFile.id)}
              onUnshare={(token) => poke({ unshare: { token } })}
              onShowShare={(sh) => setShareDialog(sh)}
              onSetAllowed={(ships, notify) =>
                poke({ 'set-allowed': { id: activeFile.id, ships, notify } })
              }
              onPublish={() => setPublishingFile(activeFile)}
              onUnpublish={() => poke({ unpublish: { id: activeFile.id } })}
            />
          )}
        </div>
      </main>

      {dragActive && (
        <div className="fixed inset-0 bg-accent/10 border-4 border-dashed border-accent pointer-events-none z-40 flex items-center justify-center">
          <div className="bg-surface rounded-lg shadow-lg px-6 py-4 text-accent font-medium">
            Drop files to upload
          </div>
        </div>
      )}

      {showViewModal && (
        <ViewModal
          initial={editingView}
          allTags={uniqueTags(files)}
          onClose={() => setShowViewModal(false)}
          onSave={(name, tags, color) => {
            poke({ mkview: { name, tags, color } });
            setShowViewModal(false);
          }}
        />
      )}
      {shareDialog && (
        <ShareModal share={shareDialog} onClose={() => setShareDialog(null)} />
      )}
      {publishingFile && (
        <PublishModal
          file={publishingFile}
          onClose={() => setPublishingFile(null)}
          onPublish={({ displayName, tags, description }) => {
            poke({
              publish: {
                id: publishingFile.id,
                'display-name': displayName,
                tags,
                description,
              },
            });
            setPublishingFile(null);
          }}
        />
      )}
      {bulkTagIds && bulkTagFiles.length > 0 && (
        <BulkTagModal
          files={bulkTagFiles}
          allTags={uniqueTags(files)}
          onClose={() => setBulkTagIds(null)}
          onApply={({ tags, makePublic }) => {
            for (const id of bulkTagIds) {
              if (tags.length > 0) poke({ 'add-tags': { id, tags } });
              if (makePublic) poke({ share: { id } });
            }
            setBulkTagIds(null);
          }}
        />
      )}
    </div>
  );
}

function uniqueTags(files: Map<string, FileMeta>): string[] {
  const s = new Set<string>();
  for (const f of files.values()) for (const t of f.tags) s.add(t);
  return Array.from(s).sort();
}

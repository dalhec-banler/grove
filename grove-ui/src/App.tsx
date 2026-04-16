import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FileMeta, View, Selection, CanopyMode, SortKey, ViewMode } from './types';
import { poke, pokeSafe, setErrorHandler } from './api';
import { parseViewMode } from './format';
import { filterAndSortFiles } from './filter';
import { useGroveData } from './useGroveData';
import { useUpload } from './useUpload';
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
import ToolbarControls from './components/ToolbarControls';
import PublishModal from './components/PublishModal';

export default function App() {
  const isUploadingRef = useRef(false);
  const uploadCollectedRef = useRef<string[]>([]);

  const {
    files, setFiles, views, shares, inbox, trusted, blocked,
    canopyEntries, canopyConfig, setCanopyConfig, canopyPeers, availableGroups,
    connected, loadError, setPendingShareFor, shareDialog, setShareDialog,
  } = useGroveData(isUploadingRef, uploadCollectedRef);

  const upload = useUpload(setFiles, isUploadingRef, uploadCollectedRef);

  const [selection, setSelection] = useState<Selection>({ kind: 'all' });
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingView, setEditingView] = useState<View | null>(null);
  const [publishingFile, setPublishingFile] = useState<FileMeta | null>(null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    parseViewMode(localStorage.getItem('grove:viewMode') ?? 'grid')
  );
  const [fileSort, setFileSort] = useState<SortKey>('newest');
  const [canopySort, setCanopySort] = useState<SortKey>('newest');
  const [canopyViewMode, setCanopyViewMode] = useState<ViewMode>('list');
  const [canopySearch, setCanopySearch] = useState('');
  const [inboxSort, setInboxSort] = useState<SortKey>('newest');
  const [inboxViewMode, setInboxViewMode] = useState<ViewMode>('list');
  const [inboxSearch, setInboxSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setErrorHandler((msg) => { setToast(msg); setTimeout(() => setToast(null), 4000); });
  }, []);
  useEffect(() => { localStorage.setItem('grove:viewMode', viewMode); }, [viewMode]);

  const tagCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const f of files.values()) for (const t of f.tags) m.set(t, (m.get(t) ?? 0) + 1);
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [files]);

  const allTags = useMemo(() => tagCounts.map(([t]) => t).sort((a, b) => a.localeCompare(b)), [tagCounts]);

  const visibleFiles = useMemo(
    () => filterAndSortFiles(files, views, selection, search, fileSort),
    [files, views, selection, search, fileSort],
  );

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
    poke({ share: { id: fileId } }).catch(() => {
      setPendingShareFor(null);
    });
  }, [shares, setShareDialog, setPendingShareFor]);

  const bulkTagFiles = upload.bulkTagIds
    ? upload.bulkTagIds.map((id) => files.get(id)).filter((f): f is FileMeta => !!f)
    : [];

  const canopyPeerList = useMemo(
    () => Array.from(canopyPeers.keys()).sort((a, b) => a.localeCompare(b)),
    [canopyPeers]
  );

  const isCanopySelection =
    selection.kind === 'canopy-mine' || selection.kind === 'canopy-browse' || selection.kind === 'canopy-peer';

  const toolbarProps = useMemo(() => {
    if (isCanopySelection) return {
      search: canopySearch, onSearchChange: setCanopySearch,
      sortKey: canopySort, onSortChange: setCanopySort,
      viewMode: canopyViewMode, onViewModeChange: setCanopyViewMode,
      placeholder: 'Search entries…', tint: 'canopy' as const,
    };
    if (selection.kind === 'inbox') return {
      search: inboxSearch, onSearchChange: setInboxSearch,
      sortKey: inboxSort, onSortChange: setInboxSort,
      viewMode: inboxViewMode, onViewModeChange: setInboxViewMode,
      placeholder: 'Search shared…', tint: 'accent' as const,
    };
    return {
      search, onSearchChange: setSearch,
      sortKey: fileSort, onSortChange: setFileSort,
      viewMode, onViewModeChange: setViewMode,
      placeholder: 'Search files & tags…', tint: 'accent' as const,
    };
  }, [
    isCanopySelection, selection.kind,
    canopySearch, canopySort, canopyViewMode,
    inboxSearch, inboxSort, inboxViewMode,
    search, fileSort, viewMode,
  ]);

  const activeTitle =
    selection.kind === 'all' ? 'All files' :
    selection.kind === 'starred' ? 'Starred' :
    selection.kind === 'inbox' ? 'Shared with me' :
    selection.kind === 'canopy-mine' ? 'My canopy' :
    selection.kind === 'canopy-browse' ? 'Browse canopies' :
    selection.kind === 'canopy-peer' ? (canopyPeers.get(selection.ship)?.name || selection.ship) :
    selection.kind === 'view' ? selection.name :
    selection.kind === 'tag' ? `#${selection.name}` : '';

  const deleteFile = useCallback((id: string) => {
    if (!confirm('Delete this file?')) return;
    pokeSafe({ delete: { id } });
    setActiveFileId((prev) => prev === id ? null : prev);
  }, []);

  return (
    <div className="flex h-full relative" {...upload.dragHandlers}>
      <Sidebar
        views={Array.from(views.values())}
        tagCounts={tagCounts}
        selection={selection}
        onSelect={setSelection}
        onNewView={() => { setEditingView(null); setShowViewModal(true); }}
        onEditView={(v) => { setEditingView(v); setShowViewModal(true); }}
        onDeleteView={(v) => pokeSafe({ rmview: { name: v.name } })}
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
          pokeSafe({ 'unsubscribe-from': { who: ship } });
          if (selection.kind === 'canopy-peer' && selection.ship === ship) {
            setSelection({ kind: 'canopy-browse' });
          }
        }}
      />
      <main className="flex-1 flex flex-col min-w-0">
        {loadError && (
          <div className="bg-red-600 text-white text-sm px-4 py-2 text-center">{loadError}</div>
        )}
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
          {selection.kind !== 'canopy-browse' && (
            <ToolbarControls {...toolbarProps} />
          )}
          {selection.kind === 'canopy-browse' && <div className="flex-1" />}
          <div className={selection.kind === 'canopy-browse' ? 'ml-auto' : ''}>
            <UploadZone busy={upload.busy} progress={upload.progress} onFiles={upload.upload} />
          </div>
        </header>
        <div className="flex-1 flex min-h-0">
          {selection.kind === 'inbox' ? (
            <InboxView
              entries={Array.from(inbox.values())}
              trusted={trusted}
              blocked={blocked}
              search={inboxSearch}
              sortKey={inboxSort}
              viewMode={inboxViewMode}
              onAccept={(e) => pokeSafe({ 'accept-offer': { owner: e.owner, id: e.fileId } })}
              onDecline={(e) => pokeSafe({ 'decline-offer': { owner: e.owner, id: e.fileId } })}
              onTrust={(s) => pokeSafe({ 'trust-ship': { who: s } })}
              onUntrust={(s) => pokeSafe({ 'untrust-ship': { who: s } })}
              onBlock={(s) => pokeSafe({ 'block-ship': { who: s } })}
              onUnblock={(s) => pokeSafe({ 'unblock-ship': { who: s } })}
              onFetch={(e) => pokeSafe({ fetch: { owner: e.owner, id: e.fileId } })}
              onPlant={(e) => pokeSafe({ plant: { owner: e.owner, id: e.fileId } })}
              onDropCache={(e) => pokeSafe({ 'drop-cache': { owner: e.owner, id: e.fileId } })}
            />
          ) : selection.kind === 'canopy-mine' ? (
            <CanopyView
              kind="mine"
              entries={Array.from(canopyEntries.values())}
              config={canopyConfig}
              search={canopySearch}
              sortKey={canopySort}
              viewMode={canopyViewMode}
              onUnpublish={(id) => pokeSafe({ unpublish: { id } })}
              onSetMode={(m: CanopyMode) => { setCanopyConfig((c) => ({ ...c, mode: m })); pokeSafe({ 'set-canopy-mode': { mode: m } }); }}
              onSetName={(name) => pokeSafe({ 'set-canopy-name': { name } })}
              onAddFriend={(who) => pokeSafe({ 'add-friend': { who } })}
              onRemoveFriend={(who) => pokeSafe({ 'remove-friend': { who } })}
              onSetGroup={(flag) => pokeSafe({ 'set-canopy-group': { flag: flag ?? null } })}
              groups={availableGroups}
            />
          ) : selection.kind === 'canopy-browse' ? (
            <CanopyView
              kind="browse"
              subscribed={new Set(canopyPeers.keys())}
              onSubscribe={(ship) => {
                pokeSafe({ 'subscribe-to': { who: ship } });
                setSelection({ kind: 'canopy-peer', ship });
              }}
            />
          ) : selection.kind === 'canopy-peer' ? (
            <CanopyView
              kind="peer"
              host={selection.ship}
              listing={canopyPeers.get(selection.ship) ?? null}
              cache={inbox}
              search={canopySearch}
              sortKey={canopySort}
              viewMode={canopyViewMode}
              onFetch={(host, id) => pokeSafe({ fetch: { owner: host, id } })}
              onPlant={(host, id) => pokeSafe({ plant: { owner: host, id } })}
              onDropCache={(host, id) => pokeSafe({ 'drop-cache': { owner: host, id } })}
              onUnsubscribe={(ship) => {
                pokeSafe({ 'unsubscribe-from': { who: ship } });
                setSelection({ kind: 'canopy-browse' });
              }}
            />
          ) : viewMode === 'list' ? (
            <FileList
              files={visibleFiles}
              activeId={activeFileId}
              onSelect={setActiveFileId}
              onToggleStar={(id) => pokeSafe({ 'toggle-star': { id } })}
              onShare={openShareFor}
              onDelete={deleteFile}
            />
          ) : (
            <FileGrid
              files={visibleFiles}
              activeId={activeFileId}
              onSelect={setActiveFileId}
              onToggleStar={(id) => pokeSafe({ 'toggle-star': { id } })}
              onShare={openShareFor}
              onDelete={deleteFile}
            />
          )}
          {activeFile && !isCanopySelection && (
            <FileDetails
              file={activeFile}
              share={shareForActive}
              published={canopyEntries.has(activeFile.id)}
              onClose={() => setActiveFileId(null)}
              onRename={(name) => pokeSafe({ rename: { id: activeFile.id, name } })}
              onAddTags={(tags) => pokeSafe({ 'add-tags': { id: activeFile.id, tags } })}
              onRemoveTags={(tags) => pokeSafe({ 'remove-tags': { id: activeFile.id, tags } })}
              onShare={() => openShareFor(activeFile.id)}
              onUnshare={(token) => pokeSafe({ unshare: { token } })}
              onShowShare={(sh) => setShareDialog(sh)}
              onSetAllowed={(ships, notify) =>
                pokeSafe({ 'set-allowed': { id: activeFile.id, ships, notify } })
              }
              onPublish={() => setPublishingFile(activeFile)}
              onUnpublish={() => pokeSafe({ unpublish: { id: activeFile.id } })}
            />
          )}
        </div>
      </main>

      {upload.dragActive && (
        <div className="fixed inset-0 bg-accent/10 border-4 border-dashed border-accent pointer-events-none z-40 flex items-center justify-center">
          <div className="bg-surface rounded-lg shadow-lg px-6 py-4 text-accent font-medium">
            Drop files to upload
          </div>
        </div>
      )}

      {showViewModal && (
        <ViewModal
          initial={editingView}
          allTags={allTags}
          onClose={() => setShowViewModal(false)}
          onSave={(name, tags, color) => {
            pokeSafe({ mkview: { name, tags, color } });
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
            pokeSafe({
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
      {upload.bulkTagIds && bulkTagFiles.length > 0 && (
        <BulkTagModal
          files={bulkTagFiles}
          allTags={allTags}
          onClose={() => upload.setBulkTagIds(null)}
          onApply={({ tags, makePublic }) => {
            for (const id of upload.bulkTagIds!) {
              if (tags.length > 0) pokeSafe({ 'add-tags': { id, tags } });
              if (makePublic) pokeSafe({ share: { id } });
            }
            upload.setBulkTagIds(null);
          }}
        />
      )}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-sm px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}


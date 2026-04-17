import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FileMeta, View, Selection } from './types';
import { poke, pokeSafe, setErrorHandler, notifyError } from './api';
import { parseViewMode } from './format';
import { filterAndSortFiles } from './filter';
import { useGroveData } from './useGroveData';
import { useUpload } from './useUpload';
import { useToolbarState } from './useToolbarState';
import { useInboxActions, useCanopyActions } from './useActions';
import Sidebar from './components/Sidebar';
import FileList from './components/FileList';
import FileGrid from './components/FileGrid';
import UploadZone from './components/UploadZone';
import ViewModal from './components/ViewModal';
import ShareModal from './components/ShareModal';
import FileDetails from './components/FileDetails';
import BulkTagModal from './components/BulkTagModal';
import BulkActionBar from './components/BulkActionBar';
import InboxView from './components/InboxView';
import CanopyView from './components/CanopyView';
import ToolbarControls from './components/ToolbarControls';
import PublishModal from './components/PublishModal';
import SharedViewsView from './components/SharedViewsView';
import Lightbox from './components/Lightbox';
import PdfViewer from './components/PdfViewer';
import { IMAGE_MARKS } from './format';
import { fileUrl } from './urls';

export default function App() {
  const isUploadingRef = useRef(false);
  const uploadCollectedRef = useRef<string[]>([]);

  const {
    files, setFiles, views, shares, inbox, trusted, blocked,
    canopyEntries, canopyConfig, setCanopyConfig, canopyPeers, svPeers, newSvKeys, setNewSvKeys, availableGroups,
    connected, loadError, setPendingShareFor, shareDialog, setShareDialog,
  } = useGroveData(isUploadingRef, uploadCollectedRef);

  const upload = useUpload(setFiles, isUploadingRef, uploadCollectedRef);

  const [selection, setSelection] = useState<Selection>({ kind: 'all' });
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [anchorId, setAnchorId] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingView, setEditingView] = useState<View | null>(null);
  const [publishingFile, setPublishingFile] = useState<FileMeta | null>(null);
  const [bulkTagForSelection, setBulkTagForSelection] = useState<string[] | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [lightboxFileId, setLightboxFileId] = useState<string | null>(null);
  const [pdfViewerFileId, setPdfViewerFileId] = useState<string | null>(null);

  const fileToolbar = useToolbarState('newest', () =>
    parseViewMode(localStorage.getItem('grove:viewMode') ?? 'grid')
  );
  const canopyToolbar = useToolbarState('newest', 'list');
  const inboxToolbar = useToolbarState('newest', 'list');

  const inboxActions = useInboxActions();
  const canopyActions = useCanopyActions(setSelection);

  useEffect(() => {
    setErrorHandler((msg) => { setToast(msg); setTimeout(() => setToast(null), 4000); });
  }, []);
  useEffect(() => { localStorage.setItem('grove:viewMode', fileToolbar.viewMode); }, [fileToolbar.viewMode]);

  // Clear file selection when navigating to a different section.
  useEffect(() => { setSelectedIds(new Set()); setAnchorId(null); }, [selection]);

  // Clear "new" shared view indicators when user visits that section.
  useEffect(() => {
    if (selection.kind === 'shared-views' || selection.kind === 'shared-view') {
      setNewSvKeys(new Set());
    }
  }, [selection, setNewSvKeys]);

  const tagCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const f of files.values()) for (const t of f.tags) m.set(t, (m.get(t) ?? 0) + 1);
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [files]);

  const allTags = useMemo(() => tagCounts.map(([t]) => t).sort((a, b) => a.localeCompare(b)), [tagCounts]);

  const visibleFiles = useMemo(
    () => filterAndSortFiles(files, views, selection, fileToolbar.search, fileToolbar.sort),
    [files, views, selection, fileToolbar.search, fileToolbar.sort],
  );

  const activeFile = activeFileId ? files.get(activeFileId) ?? null : null;
  const shareForActive = useMemo(() => {
    if (!activeFile) return null;
    for (const sh of shares.values()) if (sh.fileId === activeFile.id) return sh;
    return null;
  }, [activeFile, shares]);

  const lightboxFile = lightboxFileId ? files.get(lightboxFileId) ?? null : null;
  const pdfViewerFile = pdfViewerFileId ? files.get(pdfViewerFileId) ?? null : null;

  const lightboxImages = useMemo(
    () => visibleFiles.filter((f) => IMAGE_MARKS.has(f.fileMark.toLowerCase())),
    [visibleFiles],
  );

  const openViewer = useCallback((id: string) => {
    const file = files.get(id);
    if (!file) return;
    if (IMAGE_MARKS.has(file.fileMark.toLowerCase())) {
      setLightboxFileId(id);
    } else if (file.fileMark.toLowerCase() === 'pdf') {
      setPdfViewerFileId(id);
    }
  }, [files]);

  const openShareFor = useCallback((fileId: string) => {
    for (const sh of shares.values()) {
      if (sh.fileId === fileId) { setShareDialog(sh); return; }
    }
    setPendingShareFor(fileId);
    poke({ share: { id: fileId } }).catch((e) => {
      setPendingShareFor(null);
      notifyError(`Share creation failed: ${(e as Error).message}`);
    });
  }, [shares, setShareDialog, setPendingShareFor]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setAnchorId(id);
  }, []);

  const rangeSelect = useCallback((toId: string) => {
    const fromIdx = anchorId ? visibleFiles.findIndex((f) => f.id === anchorId) : 0;
    const toIdx = visibleFiles.findIndex((f) => f.id === toId);
    if (fromIdx < 0 || toIdx < 0) return;
    const start = Math.min(fromIdx, toIdx);
    const end = Math.max(fromIdx, toIdx);
    const next = new Set<string>();
    for (let i = start; i <= end; i++) next.add(visibleFiles[i].id);
    setSelectedIds(next);
  }, [anchorId, visibleFiles]);

  const batchSelect = useCallback((ids: Set<string>) => {
    setSelectedIds(ids);
  }, []);

  const deleteFile = useCallback((id: string) => {
    if (!confirm('Delete this file?')) return;
    pokeSafe({ delete: { id } });
    setActiveFileId((prev) => prev === id ? null : prev);
    setSelectedIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const bulkDownload = useCallback(() => {
    for (const id of selectedIds) {
      const file = files.get(id);
      if (!file) continue;
      const a = document.createElement('a');
      a.href = fileUrl(id);
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }, [selectedIds, files]);

  const bulkDelete = useCallback(() => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} file${selectedIds.size > 1 ? 's' : ''}?`)) return;
    for (const id of selectedIds) pokeSafe({ delete: { id } });
    setSelectedIds(new Set());
    setActiveFileId(null);
  }, [selectedIds]);

  const handleDropOnView = useCallback((viewName: string, fileIds: string[]) => {
    const view = views.get(viewName);
    if (!view || view.tags.length === 0) return;
    for (const id of fileIds) {
      const file = files.get(id);
      if (!file) continue;
      const newTags = view.tags.filter((t) => !file.tags.includes(t));
      if (newTags.length > 0) pokeSafe({ 'add-tags': { id, tags: newTags } });
    }
  }, [views, files]);

  const handleDropOnCanopy = useCallback((fileIds: string[]) => {
    if (fileIds.length === 1) {
      const file = files.get(fileIds[0]);
      if (file) setPublishingFile(file);
    } else {
      for (const id of fileIds) {
        const file = files.get(id);
        if (!file) continue;
        pokeSafe({
          publish: { id, 'display-name': file.name, tags: file.tags, description: file.description },
        });
      }
    }
  }, [files]);

  const bulkTagFiles = upload.bulkTagIds
    ? upload.bulkTagIds.map((id) => files.get(id)).filter((f): f is FileMeta => !!f)
    : [];

  const bulkTagSelFiles = bulkTagForSelection
    ? bulkTagForSelection.map((id) => files.get(id)).filter((f): f is FileMeta => !!f)
    : [];

  const canopyPeerList = useMemo(
    () => Array.from(canopyPeers.keys()).sort((a, b) => a.localeCompare(b)),
    [canopyPeers]
  );

  const isCanopySelection =
    selection.kind === 'canopy-mine' || selection.kind === 'canopy-browse' || selection.kind === 'canopy-peer';

  const isSharedViewSelection =
    selection.kind === 'shared-views' || selection.kind === 'shared-view';

  const isFileView = !isCanopySelection && !isSharedViewSelection && selection.kind !== 'inbox';

  const toolbarProps = useMemo(() => {
    const fromToolbar = (tb: typeof fileToolbar, placeholder: string, tint: 'accent' | 'canopy') => ({
      search: tb.search, onSearchChange: tb.setSearch,
      sortKey: tb.sort, onSortChange: tb.setSort,
      viewMode: tb.viewMode, onViewModeChange: tb.setViewMode,
      placeholder, tint,
    });
    if (isCanopySelection) return fromToolbar(canopyToolbar, 'Search entries…', 'canopy');
    if (selection.kind === 'inbox') return fromToolbar(inboxToolbar, 'Search shared…', 'accent');
    return fromToolbar(fileToolbar, 'Search files & tags…', 'accent');
  }, [
    isCanopySelection, selection.kind,
    canopyToolbar, inboxToolbar, fileToolbar,
  ]);

  let activeTitle: string;
  switch (selection.kind) {
    case 'all': activeTitle = 'All files'; break;
    case 'starred': activeTitle = 'Starred'; break;
    case 'inbox': activeTitle = 'Shared files'; break;
    case 'shared-views': activeTitle = 'Shared Views'; break;
    case 'shared-view': activeTitle = selection.name; break;
    case 'canopy-mine': activeTitle = 'My canopy'; break;
    case 'canopy-browse': activeTitle = 'Browse canopies'; break;
    case 'canopy-peer': activeTitle = canopyPeers.get(selection.ship)?.name || selection.ship; break;
    case 'view': activeTitle = selection.name; break;
    case 'tag': activeTitle = `#${selection.name}`; break;
    default: activeTitle = '';
  }

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
          newSharedViews: newSvKeys.size,
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
        onDropOnView={handleDropOnView}
        onDropOnCanopy={handleDropOnCanopy}
        svPeers={svPeers}
        onUnsubscribeSharedView={(host, name) => {
          pokeSafe({ 'unsubscribe-view': { who: host, name } });
          if (selection.kind === 'shared-view' && selection.host === host && selection.name === name) {
            setSelection({ kind: 'shared-views' });
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
            ) : selection.kind === 'shared-view' ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: svPeers.get(`${selection.host}/${selection.name}`)?.color ?? '#888' }} />
                <span>{selection.name}</span>
                <span className="text-xs text-faint font-mono font-normal">{selection.host}</span>
              </span>
            ) : activeTitle}
          </h1>
          {isFileView && selectedIds.size > 0 ? (
            <BulkActionBar
              count={selectedIds.size}
              onDelete={bulkDelete}
              onDownload={bulkDownload}
              onTag={() => setBulkTagForSelection(Array.from(selectedIds))}
              onClear={() => { setSelectedIds(new Set()); setAnchorId(null); }}
            />
          ) : selection.kind !== 'canopy-browse' && selection.kind !== 'shared-views' ? (
            <ToolbarControls {...toolbarProps} />
          ) : null}
          {(selection.kind === 'canopy-browse' || selection.kind === 'shared-views') && <div className="flex-1" />}
          <div className={selection.kind === 'canopy-browse' ? 'ml-auto' : ''}>
            <UploadZone busy={upload.busy} progress={upload.progress} onFiles={upload.upload} />
          </div>
        </header>
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 flex flex-col min-w-0">
            {selection.kind === 'inbox' ? (
              <InboxView
                entries={Array.from(inbox.values())}
                trusted={trusted}
                blocked={blocked}
                search={inboxToolbar.search}
                sortKey={inboxToolbar.sort}
                viewMode={inboxToolbar.viewMode}
                onAccept={inboxActions.accept}
                onDecline={inboxActions.decline}
                onTrust={inboxActions.trust}
                onUntrust={inboxActions.untrust}
                onBlock={inboxActions.block}
                onUnblock={inboxActions.unblock}
                onFetch={inboxActions.fetch}
                onPlant={inboxActions.plant}
                onDropCache={inboxActions.dropCache}
              />
            ) : selection.kind === 'canopy-mine' ? (
              <CanopyView
                kind="mine"
                entries={Array.from(canopyEntries.values())}
                config={canopyConfig}
                search={canopyToolbar.search}
                sortKey={canopyToolbar.sort}
                viewMode={canopyToolbar.viewMode}
                onUnpublish={canopyActions.unpublish}
                onSetMode={canopyActions.setMode}
                onSetName={canopyActions.setName}
                onAddFriend={canopyActions.addFriend}
                onRemoveFriend={canopyActions.removeFriend}
                onSetGroup={canopyActions.setGroup}
                groups={availableGroups}
              />
            ) : selection.kind === 'canopy-browse' ? (
              <CanopyView
                kind="browse"
                subscribed={new Set(canopyPeers.keys())}
                onSubscribe={canopyActions.subscribe}
              />
            ) : selection.kind === 'canopy-peer' ? (
              <CanopyView
                kind="peer"
                host={selection.ship}
                listing={canopyPeers.get(selection.ship) ?? null}
                cache={inbox}
                search={canopyToolbar.search}
                sortKey={canopyToolbar.sort}
                viewMode={canopyToolbar.viewMode}
                onFetch={canopyActions.fetchEntry}
                onPlant={canopyActions.plantEntry}
                onDropCache={canopyActions.dropCache}
                onUnsubscribe={canopyActions.unsubscribe}
              />
            ) : selection.kind === 'shared-views' ? (
              <SharedViewsView
                kind="browse"
                svPeers={svPeers}
                onSubscribe={(host, name) => pokeSafe({ 'subscribe-view': { who: host, name } })}
                onUnsubscribe={(host, name) => pokeSafe({ 'unsubscribe-view': { who: host, name } })}
                onSelectView={(host, name) => setSelection({ kind: 'shared-view', host, name })}
              />
            ) : selection.kind === 'shared-view' ? (
              <SharedViewsView
                kind="detail"
                listing={svPeers.get(`${selection.host}/${selection.name}`) ?? { host: selection.host, name: selection.name, tags: [], color: '#888', files: [] }}
                viewMode={fileToolbar.viewMode}
                onUnsubscribe={() => {
                  pokeSafe({ 'unsubscribe-view': { who: selection.host, name: selection.name } });
                  setSelection({ kind: 'shared-views' });
                }}
              />
            ) : fileToolbar.viewMode === 'list' ? (
              <FileList
                files={visibleFiles}
                activeId={activeFileId}
                selectedIds={selectedIds}
                onSelect={setActiveFileId}
                onToggleSelect={toggleSelect}
                onRangeSelect={rangeSelect}
                onBatchSelect={batchSelect}
                onToggleStar={(id) => pokeSafe({ 'toggle-star': { id } })}
                onShare={openShareFor}
                onDelete={deleteFile}
                onOpenViewer={openViewer}
              />
            ) : (
              <FileGrid
                files={visibleFiles}
                activeId={activeFileId}
                selectedIds={selectedIds}
                onSelect={setActiveFileId}
                onToggleSelect={toggleSelect}
                onRangeSelect={rangeSelect}
                onBatchSelect={batchSelect}
                onToggleStar={(id) => pokeSafe({ 'toggle-star': { id } })}
                onShare={openShareFor}
                onDelete={deleteFile}
                onOpenViewer={openViewer}
              />
            )}
          </div>
          {activeFile && !isCanopySelection && !isSharedViewSelection && (
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
          groups={availableGroups}
          onClose={() => setShowViewModal(false)}
          onSave={(name, tags, color, shared) => {
            pokeSafe({ mkview: { name, tags, color } });
            if (shared) {
              pokeSafe({ 'share-view': { name, allowed: shared.allowed, 'group-flag': shared.groupFlag } });
            } else if (editingView?.shared) {
              pokeSafe({ 'unshare-view': { name } });
            }
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
      {bulkTagForSelection && bulkTagSelFiles.length > 0 && (
        <BulkTagModal
          files={bulkTagSelFiles}
          allTags={allTags}
          onClose={() => setBulkTagForSelection(null)}
          onApply={({ tags }) => {
            for (const id of bulkTagForSelection) {
              if (tags.length > 0) pokeSafe({ 'add-tags': { id, tags } });
            }
            setBulkTagForSelection(null);
          }}
        />
      )}
      {lightboxFile && (
        <Lightbox
          file={lightboxFile}
          files={lightboxImages}
          onNavigate={(f) => setLightboxFileId(f.id)}
          onClose={() => setLightboxFileId(null)}
        />
      )}
      {pdfViewerFile && (
        <PdfViewer
          file={pdfViewerFile}
          onClose={() => setPdfViewerFileId(null)}
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

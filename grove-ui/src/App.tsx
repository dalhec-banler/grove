import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FileMeta, View, Selection, CatalogListing } from './types';
import { poke, pokeSafe, setErrorHandler, notifyError } from './api';
import { parseViewMode } from './format';
import { filterAndSortFiles } from './filter';
import { useGroveData } from './useGroveData';
import { useUpload } from './useUpload';
import { useToolbarState } from './useToolbarState';
import { useInboxActions, useCatalogActions } from './useActions';
import { useIsMobile } from './useIsMobile';
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
import ToolbarControls from './components/ToolbarControls';
import PublishModal from './components/PublishModal';
import Lightbox from './components/Lightbox';
import PdfViewer from './components/PdfViewer';
import MobileTabBar from './components/MobileTabBar';
import ConfirmDialog from './components/ConfirmDialog';
import CatalogsView from './components/CatalogsView';
import CatalogDetailView from './components/CatalogDetailView';
import BrowseView from './components/BrowseView';
import BrowsePeerView from './components/BrowsePeerView';
import BrowseCatalogView from './components/BrowseCatalogView';
import DiscoverView from './components/DiscoverView';

import { IMAGE_MARKS } from './format';
import { fileUrl } from './urls';

export default function App() {
  const isUploadingRef = useRef(false);
  const uploadCollectedRef = useRef<string[]>([]);

  const {
    files, setFiles, views, shares, inbox, trusted, blocked,
    catalogs, catalogPeers, catalogSubs, availableGroups,
    connected, loadError, setPendingShareFor, shareDialog, setShareDialog,
  } = useGroveData(isUploadingRef, uploadCollectedRef);

  const upload = useUpload(setFiles, isUploadingRef, uploadCollectedRef);

  const [selection, setSelectionRaw] = useState<Selection>({ kind: 'all' });
  const setSelection = useCallback((s: Selection) => { setSelectionRaw(s); setDrawerOpen(false); }, []);
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<{ message: string; resolve: (v: boolean) => void } | null>(null);
  const isMobile = useIsMobile();

  const fileToolbar = useToolbarState('newest', () =>
    parseViewMode(localStorage.getItem('grove:viewMode') ?? 'grid')
  );
  const catalogToolbar = useToolbarState('newest', 'list');
  const inboxToolbar = useToolbarState('newest', 'list');

  const inboxActions = useInboxActions();
  const catalogActions = useCatalogActions(setSelection);

  useEffect(() => {
    setErrorHandler((msg) => { setToast(msg); setTimeout(() => setToast(null), 4000); });
  }, []);
  useEffect(() => { localStorage.setItem('grove:viewMode', fileToolbar.viewMode); }, [fileToolbar.viewMode]);

  // Clear file selection when navigating to a different section.
  useEffect(() => { setSelectedIds(new Set()); setAnchorId(null); }, [selection]);

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

  const mobileConfirm = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => setConfirmState({ message, resolve }));
  }, []);

  const deleteFile = useCallback(async (id: string) => {
    const ok = isMobile ? await mobileConfirm('Delete this file?') : confirm('Delete this file?');
    if (!ok) return;
    pokeSafe({ delete: { id } });
    setActiveFileId((prev) => prev === id ? null : prev);
    setSelectedIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, [isMobile, mobileConfirm]);

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

  const bulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    const msg = `Delete ${selectedIds.size} file${selectedIds.size > 1 ? 's' : ''}?`;
    const ok = isMobile ? await mobileConfirm(msg) : confirm(msg);
    if (!ok) return;
    for (const id of selectedIds) pokeSafe({ delete: { id } });
    setSelectedIds(new Set());
    setActiveFileId(null);
  }, [selectedIds, isMobile, mobileConfirm]);

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

  const bulkTagFiles = upload.bulkTagIds
    ? upload.bulkTagIds.map((id) => files.get(id)).filter((f): f is FileMeta => !!f)
    : [];

  const bulkTagSelFiles = bulkTagForSelection
    ? bulkTagForSelection.map((id) => files.get(id)).filter((f): f is FileMeta => !!f)
    : [];

  const isCatalogSection = selection.kind === 'catalogs' || selection.kind === 'catalog'
    || selection.kind === 'browse' || selection.kind === 'browse-peer'
    || selection.kind === 'browse-catalog' || selection.kind === 'discover';

  const isFileView = !isCatalogSection && selection.kind !== 'inbox';

  const toolbarProps = useMemo(() => {
    const fromToolbar = (tb: typeof fileToolbar, placeholder: string, tint: 'accent' | 'canopy') => ({
      search: tb.search, onSearchChange: tb.setSearch,
      sortKey: tb.sort, onSortChange: tb.setSort,
      viewMode: tb.viewMode, onViewModeChange: tb.setViewMode,
      placeholder, tint,
    });
    if (isCatalogSection) return fromToolbar(catalogToolbar, 'Search entries...', 'canopy');
    if (selection.kind === 'inbox') return fromToolbar(inboxToolbar, 'Search shared...', 'accent');
    return fromToolbar(fileToolbar, 'Search files & tags...', 'accent');
  }, [
    isCatalogSection, selection.kind,
    catalogToolbar, inboxToolbar, fileToolbar,
  ]);

  let activeTitle: string;
  switch (selection.kind) {
    case 'all': activeTitle = 'All files'; break;
    case 'starred': activeTitle = 'Starred'; break;
    case 'inbox': activeTitle = 'Inbox'; break;
    case 'catalogs': activeTitle = 'My Catalogs'; break;
    case 'catalog': {
      const cat = catalogs.get(selection.catalogId);
      activeTitle = cat?.name || selection.catalogId;
      break;
    }
    case 'browse': activeTitle = 'Browse'; break;
    case 'browse-peer': activeTitle = selection.host; break;
    case 'browse-catalog': {
      const key = `${selection.host}/${selection.catalogId}`;
      const listing = catalogPeers.get(key);
      activeTitle = listing?.name || selection.catalogId;
      break;
    }
    case 'discover': activeTitle = 'Discover'; break;
    case 'view': activeTitle = selection.name; break;
    case 'tag': activeTitle = `#${selection.name}`; break;
    default: activeTitle = '';
  }

  // Get listings for a specific peer
  const peerListings = useMemo(() => {
    if (selection.kind !== 'browse-peer') return [];
    return Array.from(catalogPeers.values()).filter((l) => l.host === selection.host);
  }, [selection, catalogPeers]);

  const sidebarProps = {
    views: Array.from(views.values()),
    tagCounts,
    selection,
    onSelect: setSelection,
    onNewView: () => { setEditingView(null); setShowViewModal(true); },
    onEditView: (v: View) => { setEditingView(v); setShowViewModal(true); },
    onDeleteView: (v: View) => pokeSafe({ rmview: { name: v.name } }),
    counts: {
      all: files.size,
      starred: Array.from(files.values()).filter((f) => f.starred).length,
      inbox: inbox.size,
      inboxPending: Array.from(inbox.values()).filter((e) => !e.accepted).length,
    },
    connected,
    shipName: window.ship ?? '',
    catalogs,
    catalogPeers,
    onUnsubscribeCatalog: catalogActions.unsubscribeCatalog,
    onDropOnView: handleDropOnView,
  };

  return (
    <div className="flex h-full relative" {...upload.dragHandlers}>
      {drawerOpen && (
        <Sidebar
          isDrawer
          onCloseDrawer={() => setDrawerOpen(false)}
          {...sidebarProps}
        />
      )}
      <Sidebar {...sidebarProps} />
      <main className="flex-1 flex flex-col min-w-0 pb-14 md:pb-0">
        {loadError && (
          <div className="bg-red-600 text-white text-sm px-4 py-2 text-center">{loadError}</div>
        )}

        <header className="h-14 border-b border-border flex items-center px-3 md:px-6 gap-2 md:gap-4 bg-surface">
          <button onClick={() => setDrawerOpen(true)} className="text-muted hover:text-ink md:hidden shrink-0 p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <h1 className="text-lg font-medium min-w-0 truncate">
            {selection.kind === 'view' ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: views.get(selection.name)?.color ?? '#888' }} />
                {selection.name}
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
          ) : selection.kind !== 'browse' && selection.kind !== 'catalogs' ? (
            <ToolbarControls {...toolbarProps} />
          ) : null}
          {(selection.kind === 'browse' || selection.kind === 'catalogs') && <div className="flex-1" />}
          <div>
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
            ) : selection.kind === 'catalogs' ? (
              <CatalogsView
                catalogs={catalogs}
                onSelect={setSelection}
                onCreateCatalog={catalogActions.createCatalog}
                onDeleteCatalog={catalogActions.deleteCatalog}
              />
            ) : selection.kind === 'catalog' ? (
              <CatalogDetailView
                catalogId={selection.catalogId}
                config={catalogs.get(selection.catalogId) ?? { name: '', description: '', mode: 'public', friends: [], groupFlag: null, files: [], created: '', modified: '' }}
                allFiles={files}
                groups={availableGroups}
                viewMode={catalogToolbar.viewMode}
                search={catalogToolbar.search}
                onUpdateCatalog={catalogActions.updateCatalog}
                onSetMode={catalogActions.setCatalogMode}
                onSetGroup={catalogActions.setCatalogGroup}
                onAddFriend={catalogActions.addCatalogFriend}
                onRemoveFriend={catalogActions.removeCatalogFriend}
                onRemoveFile={catalogActions.removeFromCatalog}
              />
            ) : selection.kind === 'browse' ? (
              <BrowseView
                catalogPeers={catalogPeers}
                onSelect={setSelection}
                onSubscribe={catalogActions.subscribeCatalog}
              />
            ) : selection.kind === 'browse-peer' ? (
              <BrowsePeerView
                host={selection.host}
                listings={peerListings}
                onSelect={setSelection}
                onUnsubscribe={catalogActions.unsubscribeCatalog}
              />
            ) : selection.kind === 'browse-catalog' ? (
              <BrowseCatalogView
                host={selection.host}
                listing={catalogPeers.get(`${selection.host}/${selection.catalogId}`) ?? { host: selection.host, catalogId: selection.catalogId, name: '', description: '', mode: 'public', entries: [] }}
                cache={inbox}
                viewMode={catalogToolbar.viewMode}
                search={catalogToolbar.search}
                onFetch={catalogActions.fetchEntry}
                onPlant={catalogActions.plantEntry}
                onDropCache={catalogActions.dropCache}
                onUnsubscribe={catalogActions.unsubscribeCatalog}
              />
            ) : selection.kind === 'discover' ? (
              <DiscoverView
                catalogPeers={catalogPeers}
                cache={inbox}
                viewMode={catalogToolbar.viewMode}
                search={catalogToolbar.search}
                onFetch={catalogActions.fetchEntry}
                onPlant={catalogActions.plantEntry}
                onDropCache={catalogActions.dropCache}
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
          {activeFile && isFileView && (
            <FileDetails
              file={activeFile}
              share={shareForActive}
              catalogs={catalogs}
              onClose={() => setActiveFileId(null)}
              onRename={(name) => pokeSafe({ rename: { id: activeFile.id, name } })}
              onAddTags={(tags) => pokeSafe({ 'add-tags': { id: activeFile.id, tags } })}
              onRemoveTags={(tags) => pokeSafe({ 'remove-tags': { id: activeFile.id, tags } })}
              onShare={() => openShareFor(activeFile.id)}
              onUnshare={(token) => pokeSafe({ unshare: { token } })}
              onShowShare={(sh) => setShareDialog(sh)}
              onSetAllowed={(ships, notify) =>
                pokeSafe({ 'set-allowed': { id: activeFile.id, ships, notify, 'base-url': window.location.origin } })
              }
              onPublish={() => setPublishingFile(activeFile)}
              onRemoveFromCatalog={(catalogId) =>
                pokeSafe({ 'remove-from-catalog': { id: catalogId, 'file-id': activeFile.id } })
              }
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
          catalogs={catalogs}
          onClose={() => setPublishingFile(null)}
          onPublish={(catalogId, { displayName, tags, description }) => {
            catalogActions.addToCatalog(catalogId, publishingFile.id, displayName, tags, description);
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
      <MobileTabBar
        selection={selection}
        onSelect={setSelection}
        onOpenDrawer={() => setDrawerOpen(true)}
        inboxBadge={Array.from(inbox.values()).filter((e) => !e.accepted).length}
      />
      {confirmState && (
        <ConfirmDialog
          message={confirmState.message}
          onConfirm={() => { confirmState.resolve(true); setConfirmState(null); }}
          onCancel={() => { confirmState.resolve(false); setConfirmState(null); }}
        />
      )}
      {toast && (
        <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-sm px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}

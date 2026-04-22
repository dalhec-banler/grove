import { useState } from 'react';
import type { Selection, View, CatalogConfig, CatalogListing } from '../types';
import { isGroveDrag, getDragFileIds } from '../dnd';
import { shortShip } from '../format';

interface Props {
  views: View[];
  tagCounts: Array<[string, number]>;
  selection: Selection;
  onSelect: (s: Selection) => void;
  onNewView: () => void;
  onEditView: (v: View) => void;
  onDeleteView: (v: View) => void;
  counts: { all: number; starred: number; inbox: number; inboxPending: number };
  connected: boolean;
  shipName: string;
  catalogs: Map<string, CatalogConfig>;
  catalogPeers: Map<string, CatalogListing>;
  onUnsubscribeCatalog: (host: string, catalogId: string) => void;
  onDropOnView: (viewName: string, fileIds: string[]) => void;
  isDrawer?: boolean;
  onCloseDrawer?: () => void;
}

export default function Sidebar({
  views, tagCounts, selection, onSelect, onNewView, onEditView, onDeleteView,
  counts, connected, shipName, catalogs, catalogPeers, onUnsubscribeCatalog,
  onDropOnView,
  isDrawer, onCloseDrawer,
}: Props) {
  const [viewsOpen, setViewsOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [subsOpen, setSubsOpen] = useState(false);
  const [tagFilter, setTagFilter] = useState('');

  const filteredTags = tagCounts.filter(([t]) =>
    !tagFilter || t.toLowerCase().includes(tagFilter.toLowerCase())
  );

  // Group peer listings by host for browse section
  const peerHosts = Array.from(new Set(
    Array.from(catalogPeers.values()).map((l) => l.host)
  )).sort((a, b) => a.localeCompare(b));

  const catalogCount = catalogs.size;
  const totalFiles = Array.from(catalogs.values()).reduce((n, c) => n + c.files.length, 0);

  const navContent = (
    <>
      <div className="py-3">
        <SidebarItem
          label="All files"
          count={counts.all}
          active={selection.kind === 'all'}
          onClick={() => onSelect({ kind: 'all' })}
        />
        <SidebarItem
          label="Starred"
          count={counts.starred}
          active={selection.kind === 'starred'}
          onClick={() => onSelect({ kind: 'starred' })}
          muted
        />

        <SectionHeader
          label="Views"
          open={viewsOpen}
          onToggle={() => setViewsOpen(!viewsOpen)}
          onAdd={onNewView}
          addTitle="New view"
          tooltip="Filtered collections -- files matching all selected tags"
        />
        {viewsOpen && (
          <div className="mt-1">
            {views.length === 0 && (
              <div className="px-4 py-2 text-xs text-faint">No views yet</div>
            )}
            {views.map((v) => (
              <ViewItem
                key={v.name}
                view={v}
                active={selection.kind === 'view' && selection.name === v.name}
                onClick={() => onSelect({ kind: 'view', name: v.name })}
                onEdit={() => onEditView(v)}
                onDelete={() => { if (confirm(`Delete view "${v.name}"?`)) onDeleteView(v); }}
                onDrop={(ids) => onDropOnView(v.name, ids)}
              />
            ))}
          </div>
        )}

        <SectionHeader
          label="Tags"
          open={tagsOpen}
          onToggle={() => setTagsOpen(!tagsOpen)}
        />
        {tagsOpen && (
          <div className="mt-1">
            {tagCounts.length === 0 ? (
              <div className="px-4 py-2 text-xs text-faint">No tags yet</div>
            ) : (
              <>
                <div className="px-4 pb-1">
                  <input
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                    placeholder="Search tags..."
                    className="w-full text-xs border border-border rounded px-2 py-1"
                  />
                </div>
                {filteredTags.map(([tag, count]) => (
                  <SidebarItem
                    key={tag}
                    label={`#${tag}`}
                    count={count}
                    active={selection.kind === 'tag' && selection.name === tag}
                    onClick={() => onSelect({ kind: 'tag', name: tag })}
                  />
                ))}
                {filteredTags.length === 0 && (
                  <div className="px-4 py-2 text-xs text-faint">No matches</div>
                )}
              </>
            )}
          </div>
        )}

        <SidebarItem
          label="Inbox"
          count={counts.inbox}
          active={selection.kind === 'inbox'}
          onClick={() => onSelect({ kind: 'inbox' })}
          badge={counts.inboxPending}
          tooltip="Files shared directly with you by other ships"
        />
      </div>

      <div className="border-t border-border">
        <div className="h-12 flex items-center gap-2 px-4 border-b border-border">
          <div className="w-7 h-7 rounded-md bg-canopy flex items-center justify-center text-white text-sm font-semibold">C</div>
          <div className="font-medium leading-tight text-sm" title="Organize and share files in catalogs">Catalogs</div>
        </div>

        <div className="py-2">
          <SidebarItem
            label="My Catalogs"
            count={totalFiles}
            active={selection.kind === 'catalogs' || selection.kind === 'catalog'}
            onClick={() => onSelect({ kind: 'catalogs' })}
            tint="canopy"
            tooltip="Your catalogs for organizing and sharing files"
          />
          {(selection.kind === 'catalogs' || selection.kind === 'catalog') && catalogCount > 0 && (
            <div className="ml-2">
              {Array.from(catalogs.entries()).map(([cid, cat]) => (
                <button
                  key={cid}
                  onClick={() => onSelect({ kind: 'catalog', catalogId: cid })}
                  className={`w-full px-4 py-1 flex items-center justify-between text-xs ${
                    selection.kind === 'catalog' && selection.catalogId === cid
                      ? 'text-canopy font-medium bg-canopy-soft'
                      : 'text-ink hover:bg-bg'
                  }`}
                >
                  <span className="truncate">{cat.name || cid}</span>
                  <span className="text-[10px] text-faint">{cat.files.length}</span>
                </button>
              ))}
            </div>
          )}

          <SidebarItem
            label="Browse"
            count={peerHosts.length}
            active={selection.kind === 'browse' || selection.kind === 'browse-peer' || selection.kind === 'browse-catalog'}
            onClick={() => onSelect({ kind: 'browse' })}
            tint="canopy"
            tooltip="Browse catalogs from other ships"
          />
          {(selection.kind === 'browse' || selection.kind === 'browse-peer' || selection.kind === 'browse-catalog') && peerHosts.length > 0 && (
            <>
              <SectionHeader
                label={`Subscriptions (${peerHosts.length})`}
                open={subsOpen}
                onToggle={() => setSubsOpen(!subsOpen)}
                small
              />
              {subsOpen && peerHosts.map((host) => {
                const hostCatalogs = Array.from(catalogPeers.values()).filter((l) => l.host === host);
                return (
                  <div key={host}>
                    <PeerItem
                      ship={host}
                      active={selection.kind === 'browse-peer' && selection.host === host}
                      onClick={() => onSelect({ kind: 'browse-peer', host })}
                      onUnsubscribe={() => {
                        for (const c of hostCatalogs) {
                          if (confirm(`Unsubscribe from ${c.name || c.catalogId} on ${host}?`)) {
                            onUnsubscribeCatalog(host, c.catalogId);
                          }
                        }
                      }}
                    />
                  </div>
                );
              })}
            </>
          )}

          <SidebarItem
            label="Discover"
            count={Array.from(catalogPeers.values()).reduce((n, l) => n + l.entries.length, 0)}
            active={selection.kind === 'discover'}
            onClick={() => onSelect({ kind: 'discover' })}
            tint="canopy"
            tooltip="Explore files from across the network"
          />
        </div>
      </div>
    </>
  );

  if (isDrawer) {
    return (
      <>
        <div className="fixed inset-0 bg-black/30 z-40" onClick={onCloseDrawer} />
        <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-surface flex flex-col shadow-xl">
          <div className="h-14 flex items-center gap-2 px-4 border-b border-border">
            <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center text-white text-sm font-semibold">G</div>
            <div className="min-w-0 flex-1">
              <div className="font-medium leading-tight">Grove</div>
              <div className="text-[10px] text-faint font-mono truncate leading-tight">{shortShip(shipName)}</div>
            </div>
            <button onClick={onCloseDrawer} className="text-muted hover:text-ink text-lg">&times;</button>
          </div>
          <nav className="flex-1 overflow-y-auto">{navContent}</nav>
        </aside>
      </>
    );
  }

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-surface hidden md:flex flex-col">
      <div className="h-14 flex items-center gap-2 px-4 border-b border-border">
        <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center text-white text-sm font-semibold">G</div>
        <div className="min-w-0 flex-1">
          <div className="font-medium leading-tight">Grove</div>
          <div className="text-[10px] text-faint font-mono truncate leading-tight">{shortShip(shipName)}</div>
        </div>
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-faint'}`} title={connected ? 'connected' : 'connecting...'} />
      </div>
      <nav className="flex-1 overflow-y-auto">{navContent}</nav>
    </aside>
  );
}

function SectionHeader({ label, open, onToggle, onAdd, addTitle, small, tooltip }: { label: string; open: boolean; onToggle: () => void; onAdd?: () => void; addTitle?: string; small?: boolean; tooltip?: string }) {
  return (
    <div className={`${small ? 'mt-2 mb-0.5' : 'mt-5'} px-4 flex items-center justify-between text-xs text-muted uppercase tracking-wider`}>
      <button onClick={onToggle} className="flex items-center gap-1 hover:text-ink" title={tooltip}>
        <span className="inline-block w-3 text-center">{open ? '▾' : '▸'}</span>
        {small ? <span className="text-[10px]">{label}</span> : label}
      </button>
      {onAdd && (
        <button className="text-muted hover:text-ink text-base leading-none" onClick={onAdd} title={addTitle}>+</button>
      )}
    </div>
  );
}

function SidebarItem({ label, count, active, onClick, tint, muted, badge, onFileDrop, tooltip }: {
  label: string; count: number; active: boolean; onClick: () => void;
  tint?: 'accent' | 'canopy'; muted?: boolean; badge?: number; onFileDrop?: (ids: string[]) => void; tooltip?: string;
}) {
  const [dragOver, setDragOver] = useState(false);
  const c = tint ?? 'accent';

  const cls = dragOver
    ? c === 'canopy' ? 'bg-canopy-soft ring-2 ring-canopy text-canopy font-medium' : 'bg-accent-soft ring-2 ring-accent text-accent font-medium'
    : active
    ? c === 'canopy' ? 'bg-canopy-soft text-canopy font-medium' : 'bg-accent-soft text-accent font-medium'
    : muted ? 'text-muted hover:bg-bg' : 'text-ink hover:bg-bg';

  return (
    <button
      onClick={onClick}
      title={tooltip}
      onDragOver={onFileDrop ? (e) => {
        if (!isGroveDrag(e)) return;
        e.preventDefault();
        e.stopPropagation();
        if (!dragOver) setDragOver(true);
      } : undefined}
      onDragLeave={onFileDrop ? (e) => {
        if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget as Node)) return;
        setDragOver(false);
      } : undefined}
      onDrop={onFileDrop ? (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        const ids = getDragFileIds(e);
        if (ids) onFileDrop(ids);
      } : undefined}
      className={`w-full px-4 py-1.5 flex items-center justify-between text-sm ${cls}`}
    >
      <span className="truncate">{label}</span>
      <span className="flex items-center gap-2 ml-2">
        {badge != null && badge > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent text-white">{badge}</span>
        )}
        <span className="text-xs text-faint">{count}</span>
      </span>
    </button>
  );
}

function PeerItem({ ship, active, onClick, onUnsubscribe }: { ship: string; active: boolean; onClick: () => void; onUnsubscribe: () => void }) {
  return (
    <div className={`group flex items-center pr-2 ${active ? 'bg-canopy-soft' : 'hover:bg-bg'}`}>
      <button onClick={onClick} className="flex-1 px-4 py-1.5 flex items-center gap-2 text-sm min-w-0">
        <span className={`truncate font-mono text-xs ${active ? 'text-canopy font-medium' : 'text-ink'}`}>{shortShip(ship)}</span>
      </button>
      <button className="md:hidden md:group-hover:block text-xs text-muted hover:text-red-600 px-1" onClick={onUnsubscribe} title="Unsubscribe">×</button>
    </div>
  );
}

function ViewItem({ view, active, onClick, onEdit, onDelete, onDrop }: {
  view: View; active: boolean; onClick: () => void;
  onEdit: () => void; onDelete: () => void; onDrop: (fileIds: string[]) => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      className={`group flex items-center pr-2 ${
        dragOver ? 'bg-accent-soft ring-2 ring-accent'
        : active ? 'bg-accent-soft'
        : 'hover:bg-bg'
      }`}
      onDragOver={(e) => {
        if (!isGroveDrag(e)) return;
        e.preventDefault();
        e.stopPropagation();
        if (!dragOver) setDragOver(true);
      }}
      onDragLeave={(e) => {
        if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget as Node)) return;
        setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        const ids = getDragFileIds(e);
        if (ids) onDrop(ids);
      }}
    >
      <button onClick={onClick} className="flex-1 px-4 py-1.5 flex items-center gap-2 text-sm min-w-0">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: view.color }} />
        <span className={`truncate ${active ? 'text-accent font-medium' : 'text-ink'}`}>{view.name}</span>
      </button>
      <div className="md:hidden md:group-hover:flex gap-1">
        <button className="text-xs text-muted hover:text-ink px-1" onClick={onEdit} title="Edit">✎</button>
        <button className="text-xs text-muted hover:text-red-600 px-1" onClick={onDelete} title="Delete">×</button>
      </div>
    </div>
  );
}
